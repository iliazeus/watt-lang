{
  const factory = require("../factory");
}

Start_Expression = _ expr:Expression _ { return expr }

Expression
  = Expression_1

Expression_1
  = LogicalExpression_1
  / Expression_2

Expression_2
  = LogicalExpression_2
  / Expression_3

Expression_3
  = BinaryExpression_3
  / Expression_4

Expression_4
  = BinaryExpression_4
  / Expression_5

Expression_5
  = BinaryExpression_5
  / Expression_6

Expression_6
  = PrefixExpression
  / Expression_7

Expression_7
  = Literal
  / Identifier
  / Parentheses

Identifier
  = name:ID
    { return factory.makeIdentifier(name, location()) }

Literal
  = value:BOOL
    { return factory.makeLiteral(JSON.parse(value), location()) }
  / value:NUM
    { return factory.makeLiteral(JSON.parse(value), location()) }

Parentheses
  = "(" _ expr:Expression _ ")"
    { return factory.makeParentheses(expr, location()) }

PrefixExpression
  = op:PrefixOperator _ expr:Expression
    { return factory.makePrefixExpression(op, expr, location()) }

PrefixOperator
  = "!" / "+" / "-"

BinaryExpression_5
  = left:Expression_6 _ op:BinaryOperator_5 _ right:Expression_5
    { return factory.makeBinaryExpression(left, op, right, location()) }

BinaryOperator_5
  = "*" / "/" / "%"

BinaryExpression_4
  = left:Expression_5 _ op:BinaryOperator_4 _ right:Expression_4
    { return factory.makeBinaryExpression(left, op, right, location()) }

BinaryOperator_4
  = "-" / "+"

BinaryExpression_3
  = left:Expression_4 _ op:BinaryOperator_3 _ right:Expression_3
    { return factory.makeBinaryExpression(left, op, right, location()) }

BinaryOperator_3
  = "==" / "!=" / "<=" / ">=" / "<" / ">"

LogicalExpression_2
  = left:Expression_4 _ op:LogicalOperator_2 _ right:Expression_2
    { return factory.makeLogicalExpression(left, op, right, location()) }

LogicalOperator_2
  = "&&"

LogicalExpression_1
  = left:Expression_2 _ op:LogicalOperator_1 _ right:Expression_1
    { return factory.makeLogicalExpression(left, op, right, location()) }

LogicalOperator_1
  = "||"

NUM "numeric literal" = $([-+]? (([0-9]+([.][0-9]*)?) / ([.][0-9]+)) ([eE][-+]?[0-9]+)?)
BOOL "boolean literal" = $("true") / $("false")
ID "identifier" = $([a-zA-Z_][a-zA-Z0-9_]*)

_ "whitespace" = [ \t\n\r]*
__ "whitespace" = [ \t\n\r]+
