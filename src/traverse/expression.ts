import { Expression } from "../ast/expression";

export function annotateExpression<S, SS, T>(
  expr: Expression<S, T>,
  meta: SS
): Expression<S & SS, T> {
  return { ...expr, meta: { ...expr.meta, ...meta } };
}

export function mapChildExpressions<S, T>(
  expr: Expression<S>,
  fn: (child: Expression<S>) => Expression<T>
): Expression<S, T> {
  switch (expr.type) {
    case "Identifier":
      return { ...expr };

    case "Literal":
      return { ...expr };

    case "TypeLiteral":
      return { ...expr };

    case "Parentheses":
      return { ...expr, body: fn(expr.body) };

    case "PrefixExpression":
      return { ...expr, argument: fn(expr.argument) };

    case "PowerExpression":
      return { ...expr, argument: fn(expr.argument) };

    case "BinaryExpression":
      return { ...expr, left: fn(expr.left), right: fn(expr.right) };

    case "LogicalExpression":
      return { ...expr, left: fn(expr.left), right: fn(expr.right) };

    case "AscriptionExpression":
      return { ...expr, left: fn(expr.left), right: fn(expr.right) };

    case "ConversionExpression":
      return { ...expr, left: fn(expr.left), right: fn(expr.right) };
  }
}

export function forEachChildExpression<T>(
  expr: Expression<T>,
  fn: (child: Expression<T>) => void
): Expression<T> {
  switch (expr.type) {
    case "Identifier":
      return expr;

    case "Literal":
      return expr;

    case "TypeLiteral":
      return expr;

    case "Parentheses":
      return fn(expr.body), expr;

    case "PrefixExpression":
      return fn(expr.argument), expr;

    case "PowerExpression":
      return fn(expr.argument), expr;

    case "BinaryExpression":
      return fn(expr.left), fn(expr.right), expr;

    case "LogicalExpression":
      return fn(expr.left), fn(expr.right), expr;

    case "AscriptionExpression":
      return fn(expr.left), fn(expr.right), expr;

    case "ConversionExpression":
      return fn(expr.left), fn(expr.right), expr;
  }
}
