import * as v from "../value";
import * as printer from "../simple-printer";

import { Location, locationToString } from "../util/location";

const show = (val: v.Value) => printer.printExpression(val.toExpression());

export class RuntimeError extends Error {
  override name = "RuntimeError";

  private constructor(readonly location: Location, message: string) {
    super(`${locationToString(location)} - ${message}`);
  }

  static from(loc: Location, error: unknown): RuntimeError {
    return new RuntimeError(loc, String(error));
  }

  static BaseDimensionsDoNotMatch(loc: Location, left: v.Value, right: v.Value): RuntimeError {
    return new RuntimeError(
      loc,
      `base dimensions do not match of '${show(left)}' and '${show(right)}'`
    );
  }

  static NameIsNotDefined(loc: Location, name: string): RuntimeError {
    return new RuntimeError(loc, `'${name}' is not defined`);
  }

  static NotABoolean(loc: Location, val: v.Value): RuntimeError {
    return new RuntimeError(loc, `'${show(val)}' is not a boolean`);
  }

  static NotANumber(loc: Location, val: v.Value): RuntimeError {
    return new RuntimeError(loc, `'${show(val)}' is not a number`);
  }

  static NotANumberOrAUnit(loc: Location, val: v.Value): RuntimeError {
    return new RuntimeError(loc, `'${show(val)}' is not a number or a unit`);
  }

  static NotAScalar(loc: Location, val: v.Value): RuntimeError {
    return new RuntimeError(loc, `'${show(val)}' is not a scalar`);
  }

  static NotAUnit(loc: Location, val: v.Value): RuntimeError {
    return new RuntimeError(loc, `'${show(val)}' is not a unit`);
  }

  static OperationNotDefined(
    loc: Location,
    op: string,
    left: v.Value,
    right: v.Value
  ): RuntimeError {
    return new RuntimeError(loc, `'${op}' is not defined for '${show(left)}' and '${show(right)}'`);
  }
}
