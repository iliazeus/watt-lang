import * as ast from "../ast";

export function printExpression(expr: ast.Expression<unknown>): string {
  const rec = (e: ast.Expression<unknown>) => printExpression(e);

  switch (expr.type) {
    case "Identifier":
      return expr.name;

    case "Literal":
      return JSON.stringify(expr.value);

    case "TypeLiteral":
      return expr.value;

    case "Parentheses":
      return `(${rec(expr.body)})`;

    case "PrefixExpression":
      return `${expr.operator}${rec(expr.argument)}`;

    case "PowerExpression":
      return `${rec(expr.argument)}^${expr.power}`;

    case "BinaryExpression":
      return `${rec(expr.left)} ${expr.operator} ${rec(expr.right)}`;

    case "LogicalExpression":
      return `${rec(expr.left)} ${expr.operator} ${rec(expr.right)}`;
    
    case "AscriptionExpression":
      return `${rec(expr.left)} ${rec(expr.right)}`;
    
    case "ConversionExpression":
      return `${rec(expr.left)} as ${rec(expr.right)}`;
  }
}
