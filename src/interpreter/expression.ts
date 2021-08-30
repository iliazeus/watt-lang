import * as ast from "../ast";
import { Location } from "../util/location";

import { Context, RuntimeError } from "./base";
import { Value } from "./value";

export function evaluate(context: Context, expr: ast.Expression<Location>): Value {
  const rec = (e: ast.Expression<Location>) => evaluate(context, e);
  const err = (message: string) => new RuntimeError(expr.meta, message);

  switch (expr.type) {
    case "Identifier": {
      const value = context[expr.name];
      if (value === undefined) throw err(`'${expr.name}' is not defined`);
      return value;
    }
    case "Literal": {
      switch (typeof expr.value) {
        case "boolean":
          return Value.fromBoolean(expr.value);
        case "number":
          return Value.fromScalar(expr.value);
      }
    }
    case "TypeLiteral": {
      switch (expr.value) {
        case "boolean":
          return Value.fromBoolean(true);
        case "scalar":
          return Value.fromScalar(1);
      }
    }
    case "Parentheses": {
      return rec(expr.body);
    }
    case "PrefixExpression": {
      switch (expr.operator) {
        case "!":
          return rec(expr.argument).not();
        case "+":
          return rec(expr.argument).unaryPlus();
        case "-":
          return rec(expr.argument).unaryMinus();
      }
    }
    case "PowerExpression": {
      return rec(expr.argument).power(expr.power);
    }
    case "BinaryExpression": {
      switch (expr.operator) {
        case "*":
          return rec(expr.left).times(rec(expr.right));
        case "/":
          return rec(expr.left).divide(rec(expr.right));
        case "%":
          return rec(expr.left).modulo(rec(expr.right));
        case "+":
          return rec(expr.left).plus(rec(expr.right));
        case "-":
          return rec(expr.left).minus(rec(expr.right));
        case "==":
          return rec(expr.left).equals(rec(expr.right));
        case "!=":
          return rec(expr.left).notEquals(rec(expr.right));
        case "<=":
          return rec(expr.left).lessThanOrEqual(rec(expr.right));
        case ">=":
          return rec(expr.left).greaterThanOrEqual(rec(expr.right));
        case "<":
          return rec(expr.left).lessThan(rec(expr.right));
        case ">":
          return rec(expr.left).greaterThan(rec(expr.right));
      }
    }
    case "LogicalExpression": {
      const left = rec(expr.left);

      switch (expr.operator) {
        case "&&":
          return left.value ? rec(expr.right) : left;
        case "||":
          return left.value ? left : rec(expr.right);
      }
    }
    case "AscriptionExpression": {
      return rec(expr.left).times(rec(expr.right));
    }
    case "ConversionExpression": {
      return rec(expr.left).as(rec(expr.right));
    }
  }
}
