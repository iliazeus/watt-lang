import * as ast from "../ast";

import { Value } from "./value";

export class UndefinedOperationError extends Error {
  override name = "UndefinedOperationError";

  constructor() {
    super(`operation not defined`);
  }

  static assert(cond: boolean): asserts cond {
    if (!cond) throw new UndefinedOperationError();
  }
}

export abstract class BaseValue {
  abstract toExpression(): ast.Expression<{}>;

  not(): Value {
    throw new UndefinedOperationError();
  }

  negate(): Value {
    throw new UndefinedOperationError();
  }

  power(_power: number): Value {
    throw new UndefinedOperationError();
  }

  plus(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  minus(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  times(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  divide(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  modulo(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  equals(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  doesNotEqual(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  lessThan(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  lessThanOrEqual(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  greaterThan(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  greaterThanOrEqual(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  ascribe(_other: Value): Value {
    throw new UndefinedOperationError();
  }

  convert(_to: Value): Value {
    throw new UndefinedOperationError();
  }
}
