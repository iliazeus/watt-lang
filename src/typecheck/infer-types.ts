import * as ast from "../ast";
import * as v from "../value";

import { TypeError } from "./error";

export type TypeAnnotation = { type: v.Value };

export function inferTypes<TMeta extends ast.LocationMeta>(
  context: v.Context,
  expr: ast.Expression<TMeta>
): ast.Expression<TMeta & TypeAnnotation> {
  const expr1 = ast.mapChildren(expr, (e) => inferTypes(context, e));
  return ast.annotate(expr1, { type: lift(context, expr1) });
}

function lift<TMeta extends ast.LocationMeta>(
  context: v.Context,
  expr: ast.Expression<TMeta, TMeta & TypeAnnotation>
): v.Value {
  const typeOf = (e: ast.Expression<TypeAnnotation>) => e.meta.type;

  try {
    switch (expr.type) {
      case "Unit": {
        return new v.UnitValue();
      }

      case "Identifier": {
        const type = context.types.get(expr.name);
        if (type === undefined) throw TypeError.NameIsNotDefined(expr, expr.name);
        return type;
      }

      case "Literal": {
        switch (typeof expr.value) {
          case "boolean":
            return new v.BooleanValue(expr.value);
          case "number":
            return new v.DimValue(expr.value, new v.DimConstructor(v.Dimensions.SCALAR));
        }
      }

      case "SpecialLiteral": {
        switch (expr.name) {
          case "boolean":
            return new v.BooleanConstructor();
          case "scalar":
            return new v.DimConstructor(v.Dimensions.SCALAR);
        }
      }

      case "Parentheses": {
        return typeOf(expr.argument);
      }

      case "PrefixExpression": {
        const argtype = typeOf(expr.argument);

        switch (expr.operator) {
          case "!":
            if (argtype instanceof v.BooleanValue) return new v.BooleanValue(!argtype.value);
            if (argtype instanceof v.BooleanType) return argtype;
            throw TypeError.NotABoolean(expr.argument, argtype);

          case "+":
            if (argtype instanceof v.DimValue) return argtype;
            if (argtype instanceof v.DimType) return argtype;
            if (argtype instanceof v.DimConstructor) return argtype;
            throw TypeError.NotANumberOrUnit(expr.argument, argtype);

          case "-":
            if (argtype instanceof v.DimValue) return argtype.negate();
            if (argtype instanceof v.DimType) return argtype;
            if (argtype instanceof v.DimConstructor) return argtype;
            throw TypeError.NotANumberOrUnit(expr.argument, argtype);
        }
      }

      case "PowerExpression": {
        const argtype = typeOf(expr.argument);

        if (argtype instanceof v.DimValue) return argtype.power(expr.power);
        if (argtype instanceof v.DimType) return argtype.power(expr.power);
        if (argtype instanceof v.DimConstructor) return argtype.power(expr.power);

        throw TypeError.NotANumberOrUnit(expr.argument, argtype);
      }

      case "BinaryExpression": {
        let left = typeOf(expr.left);
        let right = typeOf(expr.right);

        if (left instanceof v.DimValue && right instanceof v.DimValue) {
          switch (expr.operator) {
            case "*":
              return left.times(right);

            case "/":
              return left.divide(right);

            case "%":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              if (!left.isScalar) throw TypeError.NotAScalar(expr.left, left);
              if (!right.isScalar) throw TypeError.NotAScalar(expr.right, right);
              return left.modulo(right);

            case "+":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return left.plus(right);

            case "-":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return left.minus(right);

            case "==":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return new v.BooleanValue(left.equals(right));

            case "!=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return new v.BooleanValue(!left.equals(right));

            case "<=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) <= 0);

            case ">=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) >= 0);

            case "<":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) < 0);

            case ">":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) > 0);
          }
        }

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.isScalar) throw TypeError.NotAScalar(expr.left, left);

          switch (expr.operator) {
            case "*":
              return new v.DimConstructor(right.dims, right.baseDims, left.value * right.factor);

            case "/":
              return new v.DimConstructor(
                right.dims.power(-1),
                right.baseDims.power(-1),
                left.value / right.factor
              );

            default:
              throw TypeError.TypeMismatch(expr, left, right);
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimValue) {
          if (!right.isScalar) throw TypeError.NotAScalar(expr.right, right);

          switch (expr.operator) {
            case "*":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor * right.value);

            case "/":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor / right.value);

            default:
              throw TypeError.TypeMismatch(expr, left, right);
          }
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);
        if (right instanceof v.DimValue) right = new v.DimType(right.cons);

        if (left instanceof v.DimType && right instanceof v.DimType) {
          switch (expr.operator) {
            case "*":
              return left.times(right);

            case "/":
              return left.divide(right);

            case "%":
              if (!left.equals(right)) throw TypeError.TypeMismatch(expr, left, right);
              if (!left.isScalar) throw TypeError.NotAScalar(expr.left, left);
              if (!right.isScalar) throw TypeError.NotAScalar(expr.right, right);
              return left;

            case "+":
            case "-":
              if (!left.equals(right)) throw TypeError.TypeMismatch(expr, left, right);
              return left;

            case "==":
            case "!=":
            case "<=":
            case ">=":
            case "<":
            case ">":
              if (!left.equals(right)) throw TypeError.TypeMismatch(expr, left, right);
              return new v.BooleanType();
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimConstructor) {
          switch (expr.operator) {
            case "*":
              return left.times(right);
            case "/":
              return left.divide(right);
            default:
              throw TypeError.OperationIsNotDefinedForTypes(expr, expr.operator, left, right);
          }
        }

        throw TypeError.OperationIsNotDefinedForTypes(expr, expr.operator, left, right);
      }

      case "LogicalExpression": {
        let left = typeOf(expr.left);
        let right = typeOf(expr.right);

        if (left instanceof v.BooleanValue && right instanceof v.BooleanValue) {
          switch (expr.operator) {
            case "&&":
              return new v.BooleanValue(left.value && right.value);
            case "||":
              return new v.BooleanValue(left.value || right.value);
          }
        }

        if (left instanceof v.BooleanValue) left = new v.BooleanType();
        if (right instanceof v.BooleanValue) right = new v.BooleanType();

        if (!(left instanceof v.BooleanType)) throw TypeError.NotABoolean(expr.left, left);
        if (!(right instanceof v.BooleanType)) throw TypeError.NotABoolean(expr.right, right);

        return left;
      }

      case "AscriptionExpression": {
        let left = typeOf(expr.left);
        let right = typeOf(expr.right);

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.isScalar) throw TypeError.NotAScalar(expr.left, left);
          return left.ascribe(right);
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);

        if (!(left instanceof v.DimType && left.isScalar))
          throw TypeError.NotAScalar(expr.left, left);
        if (!(right instanceof v.DimConstructor)) throw TypeError.NotAUnit(expr.right, right);

        return new v.DimType(right);
      }

      case "ConversionExpression": {
        let left = typeOf(expr.left);
        let right = typeOf(expr.right);

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.cons.baseDims.equals(right.baseDims)) {
            throw TypeError.BaseDimensionsMustMatch(expr, left, right);
          }

          return left.convertTo(right);
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);

        if (!(left instanceof v.DimType)) throw TypeError.NotANumber(expr.left, left);
        if (!(right instanceof v.DimConstructor)) throw TypeError.NotAUnit(expr.right, right);

        if (!left.cons.baseDims.equals(right.baseDims)) {
          throw TypeError.BaseDimensionsMustMatch(expr, left, right);
        }

        return new v.DimType(right);
      }
    }
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw TypeError.from(expr, error);
  }
}
