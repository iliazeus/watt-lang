import * as ast from "../ast";
import * as v from "../value";

import { RuntimeError } from "./error";

export function evaluate<TMeta extends ast.LocationMeta>(
  context: v.Context,
  node: ast.Node<TMeta>
): v.Value {
  const valueOf = (e: typeof node) => evaluate(context, e);

  try {
    switch (node.type) {
      case "Identifier": {
        const value = context.getValue(node.name);
        if (value === undefined) throw RuntimeError.NameIsNotDefined(node, node.name);
        return value;
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
        return valueOf(node.argument);
      }

      case "PrefixExpression": {
        const argval = valueOf(node.argument);

        switch (node.operator) {
          case "!":
            if (argval instanceof v.BooleanValue) return new v.BooleanValue(!argval.value);
            throw RuntimeError.NotABoolean(node.argument, argval);

          case "+":
            if (argval instanceof v.DimValue) return argval;
            if (argval instanceof v.DimConstructor) return argval;
            throw RuntimeError.NotANumberOrAUnit(node.argument, argval);

          case "-":
            if (argval instanceof v.DimValue) return argval.negate();
            if (argval instanceof v.DimConstructor) return argval.negate();
            throw RuntimeError.NotANumberOrAUnit(node.argument, argval);
        }
      }

      case "PowerExpression": {
        const argval = valueOf(node.argument);

        if (argval instanceof v.DimValue) return argval.power(node.power);
        if (argval instanceof v.DimConstructor) return argval.power(node.power);

        throw RuntimeError.NotANumberOrAUnit(node.argument, argval);
      }

      case "BinaryExpression": {
        const left = valueOf(node.left);
        const right = valueOf(node.right);

        if (left instanceof v.DimValue && right instanceof v.DimValue) {
          switch (node.operator) {
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
          if (!left.isScalar) throw RuntimeError.NotAScalar(node.left, left);

          switch (node.operator) {
            case "*":
              return new v.DimConstructor(right.dims, right.baseDims, left.value * right.factor);
            case "/":
              return new v.DimConstructor(right.dims, right.baseDims, left.value / right.factor);
            default:
              throw RuntimeError.OperationNotDefined(node, node.operator, left, right);
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimValue) {
          if (!right.isScalar) throw RuntimeError.NotAScalar(node.right, right);

          switch (node.operator) {
            case "*":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor * right.value);
            case "/":
              return new v.DimConstructor(left.dims, left.baseDims, left.factor / right.value);
            default:
              throw RuntimeError.OperationNotDefined(node, node.operator, left, right);
          }
        }

        if (left instanceof v.DimConstructor && right instanceof v.DimConstructor) {
          switch (node.operator) {
            case "*":
              return left.times(right);
            case "/":
              return left.divide(right);
            default:
              throw RuntimeError.OperationNotDefined(node, node.operator, left, right);
          }
        }

        throw RuntimeError.OperationNotDefined(node, node.operator, left, right);
      }

      case "LogicalExpression": {
        const left = valueOf(node.left);
        if (!(left instanceof v.BooleanValue)) throw RuntimeError.NotABoolean(node.left, left);

        switch (node.operator) {
          case "&&":
            return left.value ? valueOf(node.right) : left;
          case "||":
            return left.value ? left : valueOf(node.right);
        }
      }

      case "AscriptionExpression": {
        const left = valueOf(node.left);
        const right = valueOf(node.right);

        if (!(left instanceof v.DimValue && left.isScalar))
          throw RuntimeError.NotAScalar(node.left, left);
        if (!(right instanceof v.DimConstructor)) throw RuntimeError.NotAUnit(node.right, right);

        return left.ascribe(right);
      }

      case "ConversionExpression": {
        const left = valueOf(node.left);
        const right = valueOf(node.right);

        if (!(left instanceof v.DimValue)) throw RuntimeError.NotANumber(node.left, left);
        if (!(right instanceof v.DimConstructor)) throw RuntimeError.NotAUnit(node.right, right);

        if (!left.cons.baseDims.equals(right.baseDims)) {
          throw RuntimeError.BaseDimensionsDoNotMatch(node, left, right);
        }

        return left.convertTo(right);
      }
    }
  } catch (error) {
    if (error instanceof RuntimeError) throw error;
    throw RuntimeError.from(node, String(error));
  }
}
