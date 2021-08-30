import * as ast from "../ast";
import * as t from "../traverse";
import * as v from "../value";

import { Location } from "../util/location";

import { Context, RuntimeError } from "./base";

export type ValueAnnotation = { value: v.Value };

export function evaluateExpression<TMeta extends Location>(
  context: Context,
  expr: ast.Expression<TMeta>
): ast.Expression<TMeta & ValueAnnotation> {
  const expr1 = t.mapChildExpressions(expr, (e) => evaluateExpression(context, e));
  return t.annotateExpression(expr1, { value: lift(context, expr1) });
}

function lift<TMeta extends Location>(
  context: Context,
  expr: ast.Expression<TMeta, TMeta & ValueAnnotation>
): v.Value {
  const valueOf = (e: ast.Expression<ValueAnnotation>) => e.meta.value;

  try {
    switch (expr.type) {
      case "Identifier": {
        const value = context[expr.name];
        if (value === undefined) throw new RuntimeError(expr.meta, `'${expr.name}' is not defined`);
        return value;
      }

      case "Literal": {
        switch (typeof expr.value) {
          case "boolean":
            return new v.BooleanValue(expr.value);
          case "number":
            return new v.DimValue(expr.value, new v.DimConstructor(v.Dimensions.SCALAR));
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
        return valueOf(expr.body);
      }

      case "PrefixExpression": {
        const argval = valueOf(expr.argument);

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
        return valueOf(expr.argument).power(expr.power);
      }

      case "BinaryExpression": {
        switch (expr.operator) {
          case "*":
            return valueOf(expr.left).times(valueOf(expr.right));
          case "/":
            return valueOf(expr.left).divide(valueOf(expr.right));
          case "%":
            return valueOf(expr.left).modulo(valueOf(expr.right));
          case "+":
            return valueOf(expr.left).plus(valueOf(expr.right));
          case "-":
            return valueOf(expr.left).minus(valueOf(expr.right));
          case "==":
            return valueOf(expr.left).equals(valueOf(expr.right));
          case "!=":
            return valueOf(expr.left).doesNotEqual(valueOf(expr.right));
          case "<=":
            return valueOf(expr.left).lessThanOrEqual(valueOf(expr.right));
          case ">=":
            return valueOf(expr.left).greaterThanOrEqual(valueOf(expr.right));
          case "<":
            return valueOf(expr.left).lessThan(valueOf(expr.right));
          case ">":
            return valueOf(expr.left).greaterThan(valueOf(expr.right));
        }
      }

      case "LogicalExpression": {
        const left = valueOf(expr.left);
        RuntimeError.assert(expr.left.meta, left instanceof v.BooleanValue, `must be a boolean`);

        switch (expr.operator) {
          case "&&":
            return left.value ? valueOf(expr.right) : left;
          case "||":
            return left.value ? left : valueOf(expr.right);
        }
      }

      case "AscriptionExpression": {
        return valueOf(expr.left).ascribe(valueOf(expr.right));
      }

      case "ConversionExpression": {
        return valueOf(expr.left).convert(valueOf(expr.right));
      }
    }
  } catch (error) {
    if (error instanceof RuntimeError) throw error;
    throw new RuntimeError(expr.meta, String(error));
  }
}
