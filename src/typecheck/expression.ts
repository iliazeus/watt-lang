import * as ast from "../ast";
import * as t from "../traverse";
import * as v from "../value";

import { Location } from "../util/location";

import { Context, TypeError } from "./base";

export type TypeAnnotation = { type: v.Value };

export function inferTypesInExpression<TMeta extends Location>(
  context: Context,
  expr: ast.Expression<TMeta>
): ast.Expression<TMeta & TypeAnnotation> {
  const expr1 = t.mapChildExpressions(expr, (e) => inferTypesInExpression(context, e));
  return t.annotateExpression(expr1, { type: lift(context, expr1) });
}

function lift<TMeta extends Location>(
  context: Context,
  expr: ast.Expression<TMeta, TMeta & TypeAnnotation>
): v.Value {
  const typeOf = (e: ast.Expression<TypeAnnotation>) => e.meta.type;

  try {
    switch (expr.type) {
      case "Identifier": {
        const value = context[expr.name];
        if (value === undefined) throw TypeError.NameIsNotDefined(expr.meta, expr.name);
        return value.getType();
      }

      case "Literal": {
        switch (typeof expr.value) {
          case "boolean":
            return new v.BooleanValue(expr.value);
          case "number":
            return new v.DimValue(expr.value, new v.DimConstructor(v.Dimensions.SCALAR));
        }
      }

      case "TypeLiteral": {
        switch (expr.value) {
          case "boolean":
            return new v.BooleanConstructor();
          case "scalar":
            return new v.DimConstructor(v.Dimensions.SCALAR);
        }
      }

      case "Parentheses": {
        return typeOf(expr.body);
      }

      case "PrefixExpression": {
        const argtype = typeOf(expr.argument);

        switch (expr.operator) {
          case "!":
            if (argtype instanceof v.BooleanValue) return new v.BooleanValue(!argtype.value);
            if (argtype instanceof v.BooleanType) return argtype;
            throw TypeError.NotABoolean(expr.argument.meta, argtype);

          case "+":
            if (argtype instanceof v.DimValue) return argtype;
            if (argtype instanceof v.DimType) return argtype;
            if (argtype instanceof v.DimConstructor) return argtype;
            throw TypeError.NotANumberOrUnit(expr.argument.meta, argtype);

          case "-":
            if (argtype instanceof v.DimValue) return argtype.negate();
            if (argtype instanceof v.DimType) return argtype;
            if (argtype instanceof v.DimConstructor) return argtype;
            throw TypeError.NotANumberOrUnit(expr.argument.meta, argtype);
        }
      }

      case "PowerExpression": {
        const argtype = typeOf(expr.argument);

        if (argtype instanceof v.DimValue) return argtype.power(expr.power);
        if (argtype instanceof v.DimType) return argtype.power(expr.power);
        if (argtype instanceof v.DimConstructor) return argtype.power(expr.power);

        throw TypeError.NotANumberOrUnit(expr.argument.meta, argtype);
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
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              if (!left.isScalar) throw TypeError.NotAScalar(expr.left.meta, left);
              if (!right.isScalar) throw TypeError.NotAScalar(expr.right.meta, right);
              return left.modulo(right);

            case "+":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return left.plus(right);

            case "-":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return left.minus(right);

            case "==":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return new v.BooleanValue(left.equals(right));

            case "!=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return new v.BooleanValue(!left.equals(right));

            case "<=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) <= 0);

            case ">=":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) >= 0);

            case "<":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) < 0);

            case ">":
              if (!left.cons.equals(right.cons))
                throw TypeError.TypeMismatch(expr.meta, left.getType(), right.getType());
              return new v.BooleanValue(left.compareTo(right) > 0);
          }
        }

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.isScalar) throw TypeError.NotAScalar(expr.left.meta, left);

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
              throw TypeError.TypeMismatch(expr.meta, left, right);
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimValue) {
          if (!right.isScalar) throw TypeError.NotAScalar(expr.right.meta, right);

          switch (expr.operator) {
            case "*":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor * right.value);

            case "/":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor / right.value);

            default:
              throw TypeError.TypeMismatch(expr.meta, left, right);
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
              if (!left.equals(right)) throw TypeError.TypeMismatch(expr.meta, left, right);
              if (!left.isScalar) throw TypeError.NotAScalar(expr.left.meta, left);
              if (!right.isScalar) throw TypeError.NotAScalar(expr.right.meta, right);
              return left;

            case "+":
            case "-":
              if (!left.equals(right)) throw TypeError.TypeMismatch(expr.meta, left, right);
              return left;

            case "==":
            case "!=":
            case "<=":
            case ">=":
            case "<":
            case ">":
              if (!left.equals(right)) throw TypeError.TypeMismatch(expr.meta, left, right);
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
              throw TypeError.OperationIsNotDefinedForTypes(expr.meta, expr.operator, left, right);
          }
        }

        throw TypeError.OperationIsNotDefinedForTypes(expr.meta, expr.operator, left, right);
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

        if (!(left instanceof v.BooleanType)) throw TypeError.NotABoolean(expr.left.meta, left);
        if (!(right instanceof v.BooleanType)) throw TypeError.NotABoolean(expr.right.meta, right);

        return left;
      }

      case "AscriptionExpression": {
        let left = typeOf(expr.left);
        let right = typeOf(expr.right);

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.isScalar) throw TypeError.NotAScalar(expr.left.meta, left);
          return left.ascribe(right);
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);

        if (!(left instanceof v.DimType && left.isScalar))
          throw TypeError.NotAScalar(expr.left.meta, left);
        if (!(right instanceof v.DimConstructor)) throw TypeError.NotAUnit(expr.right.meta, right);

        return new v.DimType(right);
      }

      case "ConversionExpression": {
        let left = typeOf(expr.left);
        let right = typeOf(expr.right);

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.cons.baseDims.equals(right.baseDims)) {
            throw TypeError.BaseDimensionsMustMatch(expr.meta, left, right);
          }

          return left.convertTo(right);
        }

        if (left instanceof v.DimValue) left = new v.DimType(left.cons);

        if (!(left instanceof v.DimType)) throw TypeError.NotANumber(expr.left.meta, left);
        if (!(right instanceof v.DimConstructor)) throw TypeError.NotAUnit(expr.right.meta, right);

        if (!left.cons.baseDims.equals(right.baseDims)) {
          throw TypeError.BaseDimensionsMustMatch(expr.meta, left, right);
        }

        return right;
      }
    }
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw TypeError.from(expr.meta, error);
  }
}
