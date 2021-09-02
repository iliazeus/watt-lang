import * as ast from "./ast";

export function isExpression<M>(node: ast.Node<M>): node is ast.Expression<M> {
  switch (node.type) {
    case "Unit":
    case "Identifier":
    case "Literal":
    case "SpecialLiteral":
    case "Parentheses":
    case "PrefixExpression":
    case "PowerExpression":
    case "BinaryExpression":
    case "LogicalExpression":
    case "AscriptionExpression":
    case "ConversionExpression":
      return true;

    default:
      return false;
  }
}
