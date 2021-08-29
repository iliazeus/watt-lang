export type Expression<TMeta, TChildMeta = TMeta> =
  | Identifier<TMeta>
  | Literal<TMeta>
  | Parentheses<TMeta, TChildMeta>
  | PrefixExpression<TMeta, TChildMeta>
  | BinaryExpression<TMeta, TChildMeta>
  | LogicalExpression<TMeta, TChildMeta>;

export interface Identifier<TMeta> {
  type: "Identifier";
  name: string;
  meta: TMeta;
}

export interface Literal<TMeta> {
  type: "Literal";
  value: LiteralValue;
  meta: TMeta;
}

export type LiteralValue = boolean | number;

export interface Parentheses<TMeta, TChildMeta = TMeta> {
  type: "Parentheses";
  body: Expression<TChildMeta>;
  meta: TMeta;
}

export interface PrefixExpression<TMeta, TChildMeta = TMeta> {
  type: "PrefixExpression";
  operator: PrefixOperator;
  argument: Expression<TChildMeta>;
  meta: TMeta;
}

export type PrefixOperator = "!" | "+" | "-";

export interface BinaryExpression<TMeta, TChildMeta = TMeta> {
  type: "BinaryExpression";
  left: Expression<TChildMeta>;
  operator: BinaryOperator;
  right: Expression<TChildMeta>;
  meta: TMeta;
}

export type BinaryOperator = "*" | "/" | "%" | "-" | "+";

export interface LogicalExpression<TMeta, TChildMeta = TMeta> {
  type: "LogicalExpression";
  left: Expression<TChildMeta>;
  operator: LogicalOperator;
  right: Expression<TChildMeta>;
  meta: TMeta;
}

export type LogicalOperator = "&&" | "||";
