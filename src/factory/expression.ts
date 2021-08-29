import {
  BinaryExpression,
  BinaryOperator,
  Expression,
  Identifier,
  Literal,
  LiteralValue,
  LogicalExpression,
  LogicalOperator,
  Parentheses,
  PrefixExpression,
  PrefixOperator,
  AscriptionExpression,
  TypeLiteralValue,
  TypeLiteral,
  ConversionExpression,
} from "../ast/expression";

export function makeIdentifier<TMeta>(name: string, meta: TMeta): Identifier<TMeta> {
  return { type: "Identifier", name, meta };
}

export function makeLiteral<TMeta>(value: LiteralValue, meta: TMeta): Literal<TMeta> {
  return { type: "Literal", value, meta };
}

export function makeTypeLiteral<TMeta>(value: TypeLiteralValue, meta: TMeta): TypeLiteral<TMeta> {
  return { type: "TypeLiteral", value, meta };
}

export function makeParentheses<TMeta>(body: Expression<TMeta>, meta: TMeta): Parentheses<TMeta> {
  return { type: "Parentheses", body, meta };
}

export function makePrefixExpression<TMeta>(
  operator: PrefixOperator,
  argument: Expression<TMeta>,
  meta: TMeta
): PrefixExpression<TMeta> {
  return { type: "PrefixExpression", operator, argument, meta };
}

export function makeBinaryExpression<TMeta>(
  left: Expression<TMeta>,
  operator: BinaryOperator,
  right: Expression<TMeta>,
  meta: TMeta
): BinaryExpression<TMeta> {
  return { type: "BinaryExpression", left, operator, right, meta };
}

export function makeLogicalExpression<TMeta>(
  left: Expression<TMeta>,
  operator: LogicalOperator,
  right: Expression<TMeta>,
  meta: TMeta
): LogicalExpression<TMeta> {
  return { type: "LogicalExpression", left, operator, right, meta };
}

export function makeAscriptionExpression<TMeta>(
  left: Expression<TMeta>,
  right: Expression<TMeta>,
  meta: TMeta
): AscriptionExpression<TMeta> {
  return { type: "AscriptionExpression", left, right, meta };
}

export function makeConversionExpression<TMeta>(
  left: Expression<TMeta>,
  right: Expression<TMeta>,
  meta: TMeta
): ConversionExpression<TMeta> {
  return { type: "ConversionExpression", left, right, meta };
}
