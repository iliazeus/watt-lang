import { Expression } from "../ast/expression";

export function mapChildren<S, T>(
  expr: Expression<S>,
  fn: (child: Expression<S>) => Expression<T>
): Expression<S, T> {
  switch (expr.type) {
    case "Identifier":
      return { ...expr };

    case "Literal":
      return { ...expr };

    case "Parentheses":
      return { ...expr, body: fn(expr.body) };

    case "PrefixExpression":
      return { ...expr, argument: fn(expr.argument) };

    case "BinaryExpression":
      return { ...expr, left: fn(expr.left), right: fn(expr.right) };

    case "LogicalExpression":
      return { ...expr, left: fn(expr.left), right: fn(expr.right) };
  }
}

export function forEachChild<T>(
  expr: Expression<T>,
  fn: (child: Expression<T>) => void
): Expression<T> {
  switch (expr.type) {
    case "Identifier":
      return expr;

    case "Literal":
      return expr;

    case "Parentheses":
      return fn(expr.body), expr;

    case "PrefixExpression":
      return fn(expr.argument), expr;

    case "BinaryExpression":
      return fn(expr.left), fn(expr.right), expr;

    case "LogicalExpression":
      return fn(expr.left), fn(expr.right), expr;
  }
}
