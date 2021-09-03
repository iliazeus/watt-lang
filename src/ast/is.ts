import * as ast from "./ast";

export function isStatement<M, MM = M>(node: ast.Node<M, MM>): node is ast.Statement<M, MM> {
  switch (node.type) {
    case "EmptyStatement":
    case "BlockStatement":
    case "VarStatement":
    case "UnitStatement":
    case "LetStatement":
    case "ExpressionStatement":
      return true;

    default:
      return false;
  }
}

export function isExpression<M, MM = M>(node: ast.Node<M, MM>): node is ast.Expression<M, MM> {
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
