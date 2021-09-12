import * as ast from "../ast";
import * as v from "../value";

import { RuntimeError } from "./error";

export function evaluate<M extends ast.LocationMeta>(
  context: v.Context,
  node: ast.Node<M>
): [v.Value, v.Context] {
  const value = recurse(node);
  return [value, context];

  function recurse(node: ast.Node<M>): v.Value {
    try {
      return evaluate(node, recurse);
    } catch (error) {
      if (error instanceof RuntimeError) throw error;
      throw RuntimeError.from(node, error);
    }
  }

  function evaluate(node: ast.Node<M>, evaluate: typeof recurse): v.Value {
    switch (node.type) {
      case "EmptyStatement": {
        return new v.UnitValue();
      }

      case "BlockStatement": {
        const ctx = context;
        node.body.forEach(evaluate);
        context = ctx;
  
        return new v.UnitValue();
      }

      case "WhileStatement": {
        const ctx = context;

        while (true) {
          const condval = evaluate(node.condition);
          if (!(condval instanceof v.BooleanValue)) {
            throw RuntimeError.NotABoolean(node.condition, condval);
          }

          if (!condval.value) break;
          evaluate(node.body);
        }

        context = ctx;
        return new v.UnitValue();
      }

      case "VarStatement": {
        const value = evaluate(node.value);
        context = context.addValue(node.name, value);
        return value;
      }

      case "UnitStatement": {
        if (!node.expression) {
          const value = new v.DimConstructor(v.Dimensions.fromUnit(node.name));
          context = context.addValue(node.name, value);
          return value;
        }

        let expvalue = evaluate(node.expression);

        if (expvalue instanceof v.DimValue) {
          expvalue = new v.DimConstructor(
            expvalue.cons.dims,
            expvalue.cons.baseDims,
            expvalue.value * expvalue.cons.factor
          );
        }

        if (!(expvalue instanceof v.DimConstructor)) {
          throw RuntimeError.NotANumberOrAUnit(node, expvalue);
        }

        const value = new v.DimConstructor(
          v.Dimensions.fromUnit(node.name),
          expvalue.baseDims,
          expvalue.factor
        );

        context = context.addValue(node.name, value);
        return value;
      }

      case "AssignmentStatement": {
        const value = evaluate(node.value);
        context.setValue(node.name, value);
        return value;
      }

      case "LetStatement": {
        const value = evaluate(node.expression);
        context = context.addValue(node.name, value);
        return value;
      }

      case "ExpressionStatement": {
        return evaluate(node.expression);
      }

      case "Unit": {
        return new v.UnitValue();
      }

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
        return evaluate(node.argument);
      }

      case "PrefixExpression": {
        const argval = evaluate(node.argument);

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
        const argval = evaluate(node.argument);

        if (argval instanceof v.DimValue) return argval.power(node.power);
        if (argval instanceof v.DimConstructor) return argval.power(node.power);

        throw RuntimeError.NotANumberOrAUnit(node.argument, argval);
      }

      case "BinaryExpression": {
        const left = evaluate(node.left);
        const right = evaluate(node.right);

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
        const left = evaluate(node.left);
        if (!(left instanceof v.BooleanValue)) throw RuntimeError.NotABoolean(node.left, left);

        switch (node.operator) {
          case "&&":
            return left.value ? evaluate(node.right) : left;
          case "||":
            return left.value ? left : evaluate(node.right);
        }
      }

      case "AscriptionExpression": {
        const left = evaluate(node.left);
        const right = evaluate(node.right);

        if (!(left instanceof v.DimValue && left.isScalar))
          throw RuntimeError.NotAScalar(node.left, left);
        if (!(right instanceof v.DimConstructor)) throw RuntimeError.NotAUnit(node.right, right);

        return left.ascribe(right);
      }

      case "ConversionExpression": {
        const left = evaluate(node.left);
        const right = evaluate(node.right);

        if (!(left instanceof v.DimValue)) throw RuntimeError.NotANumber(node.left, left);
        if (!(right instanceof v.DimConstructor)) throw RuntimeError.NotAUnit(node.right, right);

        if (!left.cons.baseDims.equals(right.baseDims)) {
          throw RuntimeError.BaseDimensionsDoNotMatch(node, left, right);
        }

        return left.convertTo(right);
      }
    }
  }
}
