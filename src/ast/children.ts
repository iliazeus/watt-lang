import * as ast from "./ast";

export function forEachChild<M>(
  expr: ast.Expression<M>,
  fn: (child: ast.Expression<M>) => void
): ast.Expression<M>;

export function forEachChild<M>(node: ast.Node<M>, fn: (child: ast.Node<M>) => void): ast.Node<M>;

export function forEachChild<M>(node: ast.Node<M>, fn: (child: ast.Node<M>) => void): ast.Node<M> {
  switch (node.type) {
    case "Identifier":
    case "Literal":
    case "SpecialLiteral":
      return node;

    case "Parentheses":
    case "PrefixExpression":
    case "PowerExpression":
      return fn(node.argument), node;

    case "BinaryExpression":
    case "LogicalExpression":
    case "AscriptionExpression":
    case "ConversionExpression":
      return fn(node.left), fn(node.right), node;
  }
}

export function mapChildren<M, MM>(
  expr: ast.Expression<M>,
  fn: (child: ast.Expression<M>) => ast.Expression<MM>
): ast.Expression<M, MM>;

export function mapChildren<M, MM>(
  node: ast.Node<M>,
  fn: (child: ast.Node<M>) => ast.Node<MM>
): ast.Node<M, MM>;

export function mapChildren<M, MM>(
  node: ast.Node<M>,
  fn: (child: ast.Node<M>) => ast.Node<MM>
): ast.Node<M, MM> {
  switch (node.type) {
    case "Identifier":
    case "Literal":
    case "SpecialLiteral":
      return node;

    case "Parentheses":
    case "PrefixExpression":
    case "PowerExpression":
      return { ...node, argument: fn(node.argument) };

    case "BinaryExpression":
    case "LogicalExpression":
    case "AscriptionExpression":
    case "ConversionExpression":
      return { ...node, left: fn(node.left), right: fn(node.right) };
  }
}
