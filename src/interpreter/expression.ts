import * as ast from "../ast";
import { Location } from "../util/location";
import { Context, RuntimeError, Value } from "./base";

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
      return expr.value;
    }
    case "Parentheses": {
      return rec(expr.body);
    }
    case "PrefixExpression": {
      switch (expr.operator) {
        case "!":
          return !rec(expr.argument);
        case "+":
          return +rec(expr.argument);
        case "-":
          return -rec(expr.argument);
      }
    }
    case "BinaryExpression": {
      switch (expr.operator) {
        case "*":
          return (+rec(expr.left)) * (+rec(expr.right));
        case "/":
          return (+rec(expr.left)) / (+rec(expr.right));
        case "%":
          return (+rec(expr.left)) % (+rec(expr.right));
        case "+":
          return (+rec(expr.left)) + (+rec(expr.right));
        case "-":
          return (+rec(expr.left)) - (+rec(expr.right));
      }
    }
    case "LogicalExpression": {
      switch (expr.operator) {
        case "&&":
          return rec(expr.left) && rec(expr.right);
        case "||":
          return rec(expr.left) || rec(expr.right);
      }
    }
  }
}
