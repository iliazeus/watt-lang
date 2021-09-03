import * as ast from "../ast";
import * as v from "../value";

import { TypeError } from "./error";

export type TypeMeta = { type: v.Value };

export function inferTypes<M extends ast.LocationMeta>(
  context: v.Context,
  node: ast.Node<M>
): ast.Node<M & TypeMeta> {
  recurse(node);
  return node as ast.Node<M & TypeMeta>;

  function recurse(node: ast.Node<M>): v.Value {
    try {
      const type = inferType(node, recurse);
      (node as ast.Node<M & TypeMeta>).meta.type = type;
      return type;
    } catch (error) {
      if (error instanceof TypeError) throw error;
      throw TypeError.from(node, error);
    }
  }

  function inferType(node: ast.Node<M>, inferType: typeof recurse): v.Value {
    switch (node.type) {
      case "Unit": {
        return new v.UnitValue();
      }

      case "Identifier": {
        const type = context.types.get(node.name);
        if (type === undefined) throw TypeError.NameIsNotDefined(node, node.name);
        return type;
      }

      case "Literal": {
        switch (typeof node.value) {
          case "boolean":
            return new v.BooleanValue(node.value);
          case "number":
            return new v.DimValue(node.value, new v.DimConstructor(v.Dimensions.SCALAR));
        }
      }

      case "SpecialLiteral": {
        switch (node.name) {
          case "boolean":
            return new v.BooleanConstructor();
          case "scalar":
            return new v.DimConstructor(v.Dimensions.SCALAR);
        }
      }

      case "Parentheses": {
        return inferType(node.argument);
      }

      case "PrefixExpression": {
        const argtype = inferType(node.argument);

        switch (node.operator) {
          case "!":
            if (argtype instanceof v.BooleanValue) return new v.BooleanValue(!argtype.value);
            if (argtype instanceof v.BooleanType) return argtype;
            throw TypeError.NotABoolean(node.argument, argtype);

          case "+":
            if (argtype instanceof v.DimValue) return argtype;
            if (argtype instanceof v.DimType) return argtype;
            if (argtype instanceof v.DimConstructor) return argtype;
            throw TypeError.NotANumberOrUnit(node.argument, argtype);

          case "-":
            if (argtype instanceof v.DimValue) return argtype.negate();
            if (argtype instanceof v.DimType) return argtype;
            if (argtype instanceof v.DimConstructor) return argtype;
            throw TypeError.NotANumberOrUnit(node.argument, argtype);
        }
      }

      case "PowerExpression": {
        const argtype = inferType(node.argument);

        if (argtype instanceof v.DimValue) return argtype.power(node.power);
        if (argtype instanceof v.DimType) return argtype.power(node.power);
        if (argtype instanceof v.DimConstructor) return argtype.power(node.power);

        throw TypeError.NotANumberOrUnit(node.argument, argtype);
      }

      case "BinaryExpression": {
        let left = inferType(node.left);
        let right = inferType(node.right);

        if (left instanceof v.DimValue && right instanceof v.DimValue) {
          switch (node.operator) {
            case "*":
              return left.times(right);

            case "/":
              return left.divide(right);

            case "%":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              if (!left.isScalar) throw TypeError.NotAScalar(node.left, left);
              if (!right.isScalar) throw TypeError.NotAScalar(node.right, right);
              return left.modulo(right);

            case "+":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return left.plus(right);

            case "-":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return left.minus(right);

            case "==":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return new v.BooleanValue(left.equals(right));

            case "!=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return new v.BooleanValue(!left.equals(right));

            case "<=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) <= 0);

            case ">=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) >= 0);

            case "<":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) < 0);

            case ">":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(node, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) > 0);
          }
        }

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.isScalar) throw TypeError.NotAScalar(node.left, left);

          switch (node.operator) {
            case "*":
              return new v.DimConstructor(right.dims, right.baseDims, left.value * right.factor);

            case "/":
              return new v.DimConstructor(
                right.dims.power(-1),
                right.baseDims.power(-1),
                left.value / right.factor
              );

            default:
              throw TypeError.TypeMismatch(node, left, right);
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimValue) {
          if (!right.isScalar) throw TypeError.NotAScalar(node.right, right);

          switch (node.operator) {
            case "*":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor * right.value);

            case "/":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor / right.value);

            default:
              throw TypeError.TypeMismatch(node, left, right);
          }
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);
        if (right instanceof v.DimValue) right = new v.DimType(right.cons);

        if (left instanceof v.DimType && right instanceof v.DimType) {
          switch (node.operator) {
            case "*":
              return left.times(right);

            case "/":
              return left.divide(right);

            case "%":
              if (!left.equals(right)) throw TypeError.TypeMismatch(node, left, right);
              if (!left.isScalar) throw TypeError.NotAScalar(node.left, left);
              if (!right.isScalar) throw TypeError.NotAScalar(node.right, right);
              return left;

            case "+":
            case "-":
              if (!left.equals(right)) throw TypeError.TypeMismatch(node, left, right);
              return left;

            case "==":
            case "!=":
            case "<=":
            case ">=":
            case "<":
            case ">":
              if (!left.equals(right)) throw TypeError.TypeMismatch(node, left, right);
              return new v.BooleanType();
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimConstructor) {
          switch (node.operator) {
            case "*":
              return left.times(right);
            case "/":
              return left.divide(right);
            default:
              throw TypeError.OperationIsNotDefinedForTypes(node, node.operator, left, right);
          }
        }

        throw TypeError.OperationIsNotDefinedForTypes(node, node.operator, left, right);
      }

      case "LogicalExpression": {
        let left = inferType(node.left);
        let right = inferType(node.right);

        if (left instanceof v.BooleanValue && right instanceof v.BooleanValue) {
          switch (node.operator) {
            case "&&":
              return new v.BooleanValue(left.value && right.value);
            case "||":
              return new v.BooleanValue(left.value || right.value);
          }
        }

        if (left instanceof v.BooleanValue) left = new v.BooleanType();
        if (right instanceof v.BooleanValue) right = new v.BooleanType();

        if (!(left instanceof v.BooleanType)) throw TypeError.NotABoolean(node.left, left);
        if (!(right instanceof v.BooleanType)) throw TypeError.NotABoolean(node.right, right);

        return left;
      }

      case "AscriptionExpression": {
        let left = inferType(node.left);
        let right = inferType(node.right);

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.isScalar) throw TypeError.NotAScalar(node.left, left);
          return left.ascribe(right);
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);

        if (!(left instanceof v.DimType && left.isScalar))
          throw TypeError.NotAScalar(node.left, left);
        if (!(right instanceof v.DimConstructor)) throw TypeError.NotAUnit(node.right, right);

        return new v.DimType(right);
      }

      case "ConversionExpression": {
        let left = inferType(node.left);
        let right = inferType(node.right);

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.cons.baseDims.equals(right.baseDims)) {
            throw TypeError.BaseDimensionsMustMatch(node, left, right);
          }

          return left.convertTo(right);
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);

        if (!(left instanceof v.DimType)) throw TypeError.NotANumber(node.left, left);
        if (!(right instanceof v.DimConstructor)) throw TypeError.NotAUnit(node.right, right);

        if (!left.cons.baseDims.equals(right.baseDims)) {
          throw TypeError.BaseDimensionsMustMatch(node, left, right);
        }

        return new v.DimType(right);
      }
    }
  }
}
