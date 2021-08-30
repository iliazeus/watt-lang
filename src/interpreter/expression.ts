import * as ast from "../ast";

import { Dimensions } from "../value/dimensions";
import { Location } from "../util/location";

import { Context, RuntimeError } from "./base";
import { BooleanConstructor, BooleanValue, DimConstructor, DimValue, Value } from "../value/value";

export function evaluateExpression(context: Context, expr: ast.Expression<Location>): Value {
  const rec = (e: ast.Expression<Location>) => evaluateExpression(context, e);

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
            return new BooleanValue(expr.value);
          case "number":
            return new DimValue(expr.value, new DimConstructor(Dimensions.SCALAR));
        }
      }

      case "TypeLiteral": {
        switch (expr.value) {
          case "boolean":
            return new BooleanConstructor();
          case "scalar":
            return new DimConstructor(Dimensions.SCALAR);
        }
      }

      case "Parentheses": {
        return rec(expr.body);
      }

      case "PrefixExpression": {
        const argval = rec(expr.argument);

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
        return rec(expr.argument).power(expr.power);
      }

      case "BinaryExpression": {
        switch (expr.operator) {
          case "*":
            return rec(expr.left).times(rec(expr.right));
          case "/":
            return rec(expr.left).divide(rec(expr.right));
          case "%":
            return rec(expr.left).modulo(rec(expr.right));
          case "+":
            return rec(expr.left).plus(rec(expr.right));
          case "-":
            return rec(expr.left).minus(rec(expr.right));
          case "==":
            return rec(expr.left).equals(rec(expr.right));
          case "!=":
            return rec(expr.left).doesNotEqual(rec(expr.right));
          case "<=":
            return rec(expr.left).lessThanOrEqual(rec(expr.right));
          case ">=":
            return rec(expr.left).greaterThanOrEqual(rec(expr.right));
          case "<":
            return rec(expr.left).lessThan(rec(expr.right));
          case ">":
            return rec(expr.left).greaterThan(rec(expr.right));
        }
      }

      case "LogicalExpression": {
        const left = rec(expr.left);
        RuntimeError.assert(expr.left.meta, left instanceof BooleanValue, `must be a boolean`);

        switch (expr.operator) {
          case "&&":
            return left.value ? rec(expr.right) : left;
          case "||":
            return left.value ? left : rec(expr.right);
        }
      }

      case "AscriptionExpression": {
        return rec(expr.left).ascribe(rec(expr.right));
      }

      case "ConversionExpression": {
        return rec(expr.left).convert(rec(expr.right));
      }
    }
  } catch (error) {
    if (error instanceof RuntimeError) throw error;
    throw new RuntimeError(expr.meta, String(error));
  }
}
