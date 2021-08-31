import * as ast from "../ast";
import * as f from "../factory";
import * as t from "../traverse";

export function parenthesizeExpression(expr: ast.Expression<{}>): ast.Expression<{}> {
  return parenthesizeStrippedExpression(stripParenthesesFromExpression(expr));
}

function stripParenthesesFromExpression(expr: ast.Expression<{}>): ast.Expression<{}> {
  const rec = (e: typeof expr) => stripParenthesesFromExpression(e);
  const expr1 = t.mapChildExpressions(expr, rec);

  if (expr1.type === "Parentheses") return expr1.body;
  return expr1;
}

function parenthesizeStrippedExpression(expr: ast.Expression<{}>): ast.Expression<{}> {
  const rec = (e: typeof expr) => parenthesizeStrippedExpression(e);
  const expr1 = t.mapChildExpressions(expr, rec);

  switch (expr.type) {
    case "Identifier":
    case "Literal":
    case "TypeLiteral":
      return expr1;
  }

  return f.makeParentheses(expr1, {});
}
