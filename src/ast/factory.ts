import * as ast from "./ast";

export function makeEmptyStatement<M>(meta: M): ast.EmptyStatement<M> {
  return { type: "EmptyStatement", meta };
}

export function makeBlockStatement<M, MM = M>(
  body: ast.Statement<MM>[],
  meta: M
): ast.BlockStatement<M, MM> {
  return { type: "BlockStatement", body, meta };
}

export function makeLetStatement<M, MM = M>(
  name: string,
  expression: ast.Expression<MM>,
  meta: M
): ast.LetStatement<M, MM> {
  return { type: "LetStatement", name, expression, meta };
}

export function makeExpressionStatement<M, MM = M>(
  expression: ast.Expression<MM>,
  meta: M
): ast.ExpressionStatement<M, MM> {
  return { type: "ExpressionStatement", expression, meta };
}

export function makeUnit<M>(meta: M): ast.Unit<M> {
  return { type: "Unit", meta };
}

export function makeIdentifier<M>(name: string, meta: M): ast.Identifier<M> {
  return { type: "Identifier", name, meta };
}

export function makeLiteral<M>(value: ast.LiteralValue, meta: M): ast.Literal<M> {
  return { type: "Literal", value, meta };
}

export function makeSpecialLiteral<M>(
  name: ast.SpecialLiteralName,
  meta: M
): ast.SpecialLiteral<M> {
  return { type: "SpecialLiteral", name, meta };
}

export function makeParentheses<M, MM = M>(
  argument: ast.Expression<MM>,
  meta: M
): ast.Parentheses<M, MM> {
  return { type: "Parentheses", argument, meta };
}

export function makePrefixExpression<M, MM = M>(
  operator: ast.PrefixOperator,
  argument: ast.Expression<MM>,
  meta: M
): ast.PrefixExpression<M, MM> {
  return { type: "PrefixExpression", operator, argument, meta };
}

export function makePowerExpression<M, MM = M>(
  argument: ast.Expression<MM>,
  power: number,
  meta: M
): ast.PowerExpression<M, MM> {
  return { type: "PowerExpression", argument, power, meta };
}

export function makeBinaryExpression<M, MM = M>(
  left: ast.Expression<MM>,
  operator: ast.BinaryOperator,
  right: ast.Expression<MM>,
  meta: M
): ast.BinaryExpression<M, MM> {
  return { type: "BinaryExpression", left, operator, right, meta };
}

export function makeLogicalExpression<M, MM = M>(
  left: ast.Expression<MM>,
  operator: ast.LogicalOperator,
  right: ast.Expression<MM>,
  meta: M
): ast.LogicalExpression<M, MM> {
  return { type: "LogicalExpression", left, operator, right, meta };
}

export function makeAscriptionExpression<M, MM = M>(
  left: ast.Expression<MM>,
  right: ast.Expression<MM>,
  meta: M
): ast.AscriptionExpression<M, MM> {
  return { type: "AscriptionExpression", left, right, meta };
}

export function makeConversionExpression<M, MM = M>(
  left: ast.Expression<MM>,
  right: ast.Expression<MM>,
  meta: M
): ast.ConversionExpression<M, MM> {
  return { type: "ConversionExpression", left, right, meta };
}
