export interface BaseNode<M> {
  type: string;
  meta: M;
}

export type Node<M, MM = M> = Statement<M, MM> | Expression<M, MM>;

export type Statement<M, MM = M> =
  | EmptyStatement<M>
  | BlockStatement<M, MM>
  | UnitStatement<M, MM>
  | LetStatement<M, MM>
  | ExpressionStatement<M, MM>;

export interface EmptyStatement<M> extends BaseNode<M> {
  type: "EmptyStatement";
}

export interface BlockStatement<M, MM> extends BaseNode<M> {
  type: "BlockStatement";
  body: Statement<MM>[];
}

export interface UnitStatement<M, MM> extends BaseNode<M> {
  type: "UnitStatement";
  name: string;
  expression: Expression<MM> | null;
}

export interface LetStatement<M, MM> extends BaseNode<M> {
  type: "LetStatement";
  name: string;
  expression: Expression<MM>;
}

export interface ExpressionStatement<M, MM> extends BaseNode<M> {
  type: "ExpressionStatement";
  expression: Expression<MM>;
}

export type Expression<M, MM = M> =
  | Unit<M>
  | Identifier<M>
  | Literal<M>
  | SpecialLiteral<M>
  | Parentheses<M, MM>
  | PrefixExpression<M, MM>
  | PowerExpression<M, MM>
  | BinaryExpression<M, MM>
  | LogicalExpression<M, MM>
  | AscriptionExpression<M, MM>
  | ConversionExpression<M, MM>;

export interface Unit<M> extends BaseNode<M> {
  type: "Unit";
}

export interface Identifier<M> extends BaseNode<M> {
  type: "Identifier";
  name: string;
}

export interface Literal<M> extends BaseNode<M> {
  type: "Literal";
  value: LiteralValue;
}

export type LiteralValue = boolean | number;

export interface SpecialLiteral<M> extends BaseNode<M> {
  type: "SpecialLiteral";
  name: SpecialLiteralName;
}

export type SpecialLiteralName = "boolean" | "scalar";

export interface Parentheses<M, MM = M> extends BaseNode<M> {
  type: "Parentheses";
  argument: Expression<MM>;
}

export interface PrefixExpression<M, MM = M> extends BaseNode<M> {
  type: "PrefixExpression";
  operator: PrefixOperator;
  argument: Expression<MM>;
}

export type PrefixOperator = "!" | "+" | "-";

export interface PowerExpression<M, MM = M> extends BaseNode<M> {
  type: "PowerExpression";
  argument: Expression<MM>;
  power: number;
}

export interface BinaryExpression<M, MM = M> extends BaseNode<M> {
  type: "BinaryExpression";
  left: Expression<MM>;
  operator: BinaryOperator;
  right: Expression<MM>;
}

export type BinaryOperator = "*" | "/" | "%" | "-" | "+" | "==" | "!=" | "<=" | ">=" | "<" | ">";

export interface LogicalExpression<M, MM = M> extends BaseNode<M> {
  type: "LogicalExpression";
  left: Expression<MM>;
  operator: LogicalOperator;
  right: Expression<MM>;
}

export type LogicalOperator = "&&" | "||";

export interface AscriptionExpression<M, MM = M> extends BaseNode<M> {
  type: "AscriptionExpression";
  left: Expression<MM>;
  right: Expression<MM>;
}

export interface ConversionExpression<M, MM = M> extends BaseNode<M> {
  type: "ConversionExpression";
  left: Expression<MM>;
  right: Expression<MM>;
}
