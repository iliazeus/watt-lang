import * as ast from "../ast";
import * as t from "../traverse";
import * as v from "../value";

import { Location } from "../util/location";

import { Context, TypeError } from "./base";

export type TypeAnnotation = { type: v.Value };

export function inferTypesInExpression<TMeta extends Location>(
  context: Context,
  expr: ast.Expression<TMeta>
): ast.Expression<TMeta & TypeAnnotation> {
  const expr1 = t.mapChildExpressions(expr, (e) => inferTypesInExpression(context, e));
  return t.annotateExpression(expr1, { type: lift(context, expr1) });
}

function lift<TMeta extends Location>(
  context: Context,
  expr: ast.Expression<TMeta, TMeta & TypeAnnotation>
): v.Value {
  const typeOf = (e: ast.Expression<TypeAnnotation>) => e.meta.type;

  try {
    switch (expr.type) {
      case "Identifier": {
        const value = context[expr.name];
        if (value === undefined) throw new TypeError(expr.meta, `'${expr.name}' is not defined`);
        return value.getType();
      }

      case "Literal": {
        switch (typeof expr.value) {
          case "boolean":
            return new v.BooleanType();
          case "number":
            return new v.DimType(new v.DimConstructor(v.Dimensions.SCALAR));
        }
      }

      case "TypeLiteral": {
        switch (expr.value) {
          case "boolean":
            return new v.BooleanConstructor();
          case "scalar":
            return new v.DimConstructor(v.Dimensions.SCALAR);
        }
      }

      case "Parentheses": {
        return typeOf(expr.body);
      }

      case "PrefixExpression": {
        const argval = typeOf(expr.argument);

        switch (expr.operator) {
          case "!":
            return argval.not();

          case "+":
            return argval;

          case "-":
            return argval.negate();
        }
      }

      case "PowerExpression": {
        return typeOf(expr.argument).power(expr.power);
      }

      case "BinaryExpression": {
        switch (expr.operator) {
          case "*":
            return typeOf(expr.left).times(typeOf(expr.right));
          case "/":
            return typeOf(expr.left).divide(typeOf(expr.right));
          case "%":
            return typeOf(expr.left).modulo(typeOf(expr.right));
          case "+":
            return typeOf(expr.left).plus(typeOf(expr.right));
          case "-":
            return typeOf(expr.left).minus(typeOf(expr.right));
          case "==":
            return typeOf(expr.left).equals(typeOf(expr.right));
          case "!=":
            return typeOf(expr.left).doesNotEqual(typeOf(expr.right));
          case "<=":
            return typeOf(expr.left).lessThanOrEqual(typeOf(expr.right));
          case ">=":
            return typeOf(expr.left).greaterThanOrEqual(typeOf(expr.right));
          case "<":
            return typeOf(expr.left).lessThan(typeOf(expr.right));
          case ">":
            return typeOf(expr.left).greaterThan(typeOf(expr.right));
        }
      }

      case "LogicalExpression": {
        const left = typeOf(expr.left);
        const right = typeOf(expr.right);

        TypeError.assert(expr.left.meta, left instanceof v.BooleanType, `must be a boolean`);
        TypeError.assert(expr.right.meta, right instanceof v.BooleanType, `must be a boolean`);

        return left;
      }

      case "AscriptionExpression": {
        return typeOf(expr.left).ascribe(typeOf(expr.right));
      }

      case "ConversionExpression": {
        return typeOf(expr.left).convert(typeOf(expr.right));
      }
    }
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError(expr.meta, String(error));
  }
}
