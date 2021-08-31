import * as v from "../value";
import * as printer from "../simple-printer";

import { Location, locationToString } from "../util/location";

export type Context = { [name: string]: v.Value };

const show = (val: v.Value) => printer.printExpression(val.toTypeExpression());

export class TypeError extends Error {
  override name = "TypeError";

  private constructor(readonly location: Location, message: string) {
    super(`${locationToString(location)} - ${message}`);
  }

  static from(loc: Location, error: unknown): TypeError {
    return new TypeError(loc, String(error));
  }

  static BaseDimensionsMustMatch(loc: Location, left: v.Value, right: v.Value): TypeError {
    return new TypeError(
      loc,
      `base dimensions do not match of '${show(left)}' and '${show(right)}'`
    );
  }

  static TypeMismatch(loc: Location, left: v.Value, right: v.Value): TypeError {
    return new TypeError(loc, `type mismatch: '${show(left)}' and '${show(right)}'`);
  }

  static NameIsNotDefined(loc: Location, name: string): TypeError {
    return new TypeError(loc, `'${name}' is not defined`);
  }

  static NotABoolean(loc: Location, type: v.Value): TypeError {
    return new TypeError(loc, `not a boolean: '${show(type)}'`);
  }

  static NotANumber(loc: Location, type: v.Value): TypeError {
    return new TypeError(loc, `not a number: ${show(type)}`);
  }

  static NotANumberOrUnit(loc: Location, type: v.Value): TypeError {
    return new TypeError(loc, `not a number or unit: '${show(type)}'`);
  }

  static NotAScalar(loc: Location, type: v.Value): TypeError {
    return new TypeError(loc, `not a scalar: '${show(type)}'`);
  }

  static NotAUnit(loc: Location, type: v.Value): TypeError {
    return new TypeError(loc, `not a unit: ${show(type)}`);
  }

  static OperationIsNotDefinedForTypes(
    loc: Location,
    op: string,
    left: v.Value,
    right: v.Value
  ): TypeError {
    return new TypeError(
      loc,
      `'${op}' is not defined for types '${show(left)}' and '${show(right)}'`
    );
  }
}
