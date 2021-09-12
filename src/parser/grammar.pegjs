{
  const ast = require("../ast");
}

Start_Expression
  = _ expr:Expression _
    { return expr }

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
  = ConversionExpression
  / Expression_5

Expression_5
  = BinaryExpression_5
  / Expression_6

Expression_6
  = BinaryExpression_6
  / Expression_7

Expression_7
  = PrefixExpression
  / Expression_8

Expression_8
  = AscriptionExpression
  / Expression_9

Expression_9
  = PowerExpression
  / Expression_10

Expression_10
  = Literal
  / SpecialLiteral
  / Identifier
  / Unit
  / Parentheses

Unit
  = "(" _ ")"
    { return ast.makeUnit({ location: location() }) }

Identifier
  = name:ID
    { return ast.makeIdentifier(name, { location: location() }) }

Literal
  = value:BOOL
    { return ast.makeLiteral(JSON.parse(value), { location: location() }) }
  / value:NUM
    { return ast.makeLiteral(JSON.parse(value), { location: location() }) }

SpecialLiteral
  = name:$("boolean" / "scalar")
    { return ast.makeSpecialLiteral(name, { location: location() }) }

Parentheses
  = "(" _ expr:Expression _ ")"
    { return ast.makeParentheses(expr, { location: location() }) }

PrefixExpression
  = op:PrefixOperator _ expr:Expression
    { return ast.makePrefixExpression(op, expr, { location: location() }) }

PrefixOperator
  = "!" / "+" / "-"

PowerExpression
  = expr:Expression_10 _ "^" _ pow:INT
    { return ast.makePowerExpression(expr, JSON.parse(pow), { location: location() }) }

BinaryExpression_6
  = left:Expression_7 _ op:BinaryOperator_6 _ right:Expression_6
    { return ast.makeBinaryExpression(left, op, right, { location: location() }) }

BinaryOperator_6
  = "*" / "/" / "%"

BinaryExpression_5
  = left:Expression_6 _ op:BinaryOperator_5 _ right:Expression_5
    { return ast.makeBinaryExpression(left, op, right, { location: location() }) }

BinaryOperator_5
  = "-" / "+"

BinaryExpression_3
  = left:Expression_5 _ op:BinaryOperator_3 _ right:Expression_3
    { return ast.makeBinaryExpression(left, op, right, { location: location() }) }

BinaryOperator_3
  = "==" / "!=" / "<=" / ">=" / "<" / ">"

LogicalExpression_2
  = left:Expression_3 _ op:LogicalOperator_2 _ right:Expression_2
    { return ast.makeLogicalExpression(left, op, right, { location: location() }) }

LogicalOperator_2
  = "&&"

LogicalExpression_1
  = left:Expression_2 _ op:LogicalOperator_1 _ right:Expression_1
    { return ast.makeLogicalExpression(left, op, right, { location: location() }) }

LogicalOperator_1
  = "||"

AscriptionExpression
  = left:Expression_10 __ right:Expression_10
    { return ast.makeAscriptionExpression(left, right, { location: location() }) }

ConversionExpression
  = left:Expression_5 __ "as" __ right:Expression_4
    { return ast.makeConversionExpression(left, right, { location: location() }) }

INT "integer literal" = $([-+]? [0-9]+)
NUM "numeric literal" = $([-+]? (([0-9]+([.][0-9]*)?) / ([.][0-9]+)) ([eE][-+]?[0-9]+)?)
BOOL "boolean literal" = $("true") / $("false")
ID "identifier" = $(!(KW) [a-zA-Z_][a-zA-Z0-9_]*)
KW "keyword" = $("as" / "unit" / "type")

_ "whitespace" = [ \t\n\r]*
__ "whitespace" = [ \t\n\r]+
