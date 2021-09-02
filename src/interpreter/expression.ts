import * as ast from "../ast";
import * as v from "../value";

import { Location } from "../util/location";

import { RuntimeError } from "./base";

export function evaluateExpression<TMeta extends Location>(
  context: v.Context,
  expr: ast.Expression<TMeta>
): v.Value {
  const valueOf = (e: typeof expr) => evaluateExpression(context, e);

  try {
    switch (expr.type) {
      case "Identifier": {
        const value = context.getValue(expr.name);
        if (value === undefined) throw RuntimeError.NameIsNotDefined(expr.meta, expr.name);
        return value;
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
        return valueOf(expr.body);
      }

      case "PrefixExpression": {
        const argval = valueOf(expr.argument);

        switch (expr.operator) {
          case "!":
            if (argval instanceof v.BooleanValue) return new v.BooleanValue(!argval.value);
            throw RuntimeError.NotABoolean(expr.argument.meta, argval);

          case "+":
            if (argval instanceof v.DimValue) return argval;
            if (argval instanceof v.DimConstructor) return argval;
            throw RuntimeError.NotANumberOrAUnit(expr.argument.meta, argval);

          case "-":
            if (argval instanceof v.DimValue) return argval.negate();
            if (argval instanceof v.DimConstructor) return argval.negate();
            throw RuntimeError.NotANumberOrAUnit(expr.argument.meta, argval);
        }
      }

      case "PowerExpression": {
        const argval = valueOf(expr.argument);

        if (argval instanceof v.DimValue) return argval.power(expr.power);
        if (argval instanceof v.DimConstructor) return argval.power(expr.power);

        throw RuntimeError.NotANumberOrAUnit(expr.argument.meta, argval);
      }

      case "BinaryExpression": {
        const left = valueOf(expr.left);
        const right = valueOf(expr.right);

        if (left instanceof v.DimValue && right instanceof v.DimValue) {
          switch (expr.operator) {
            case "*":
              return left.times(right);
            case "/":
              return left.divide(right);
            case "%":
              return left.modulo(right);
            case "+":
              return left.plus(right);
            case "-":
              return left.minus(right);
            case "==":
              return new v.BooleanValue(left.equals(right));
            case "!=":
              return new v.BooleanValue(!left.equals(right));
            case "<=":
              return new v.BooleanValue(left.compareTo(right) <= 0);
            case "<":
              return new v.BooleanValue(left.compareTo(right) < 0);
            case ">=":
              return new v.BooleanValue(left.compareTo(right) >= 0);
            case ">":
              return new v.BooleanValue(left.compareTo(right) > 0);
          }
        }

        if (left instanceof v.DimValue && right instanceof v.DimConstructor) {
          if (!left.isScalar) throw RuntimeError.NotAScalar(expr.left.meta, left);

          switch (expr.operator) {
            case "*":
              return new v.DimConstructor(right.dims, right.baseDims, left.value * right.factor);
            case "/":
              return new v.DimConstructor(right.dims, right.baseDims, left.value / right.factor);
            default:
              throw RuntimeError.OperationNotDefined(expr.meta, expr.operator, left, right);
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimValue) {
          if (!right.isScalar) throw RuntimeError.NotAScalar(expr.right.meta, right);

          switch (expr.operator) {
            case "*":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor * right.value);
            case "/":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor / right.value);
            default:
              throw RuntimeError.OperationNotDefined(expr.meta, expr.operator, left, right);
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimConstructor) {
          switch (expr.operator) {
            case "*":
              return left.times(right);
            case "/":
              return left.divide(right);
            default:
              throw RuntimeError.OperationNotDefined(expr.meta, expr.operator, left, right);
          }
        }

        throw RuntimeError.OperationNotDefined(expr.meta, expr.operator, left, right);
      }

      case "LogicalExpression": {
        const left = valueOf(expr.left);
        if (!(left instanceof v.BooleanValue)) throw RuntimeError.NotABoolean(expr.left.meta, left);

        switch (expr.operator) {
          case "&&":
            return left.value ? valueOf(expr.right) : left;
          case "||":
            return left.value ? left : valueOf(expr.right);
        }
      }

      case "AscriptionExpression": {
        const left = valueOf(expr.left);
        const right = valueOf(expr.right);

        if (!(left instanceof v.DimValue && left.isScalar))
          throw RuntimeError.NotAScalar(expr.left.meta, left);
        if (!(right instanceof v.DimConstructor))
          throw RuntimeError.NotAUnit(expr.right.meta, right);

        return left.ascribe(right);
      }

      case "ConversionExpression": {
        const left = valueOf(expr.left);
        const right = valueOf(expr.right);

        if (!(left instanceof v.DimValue)) throw RuntimeError.NotANumber(expr.left.meta, left);
        if (!(right instanceof v.DimConstructor))
          throw RuntimeError.NotAUnit(expr.right.meta, right);

        if (!left.cons.baseDims.equals(right.baseDims)) {
          throw RuntimeError.BaseDimensionsDoNotMatch(expr.meta, left, right);
        }

        return left.convertTo(right);
      }
    }
  } catch (error) {
    if (error instanceof RuntimeError) throw error;
    throw RuntimeError.from(expr.meta, String(error));
  }
}
