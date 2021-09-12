import * as ast from "../ast";

import { Dimensions } from "./dimensions";

export class UndefinedOperationError extends Error {
  override name = "UndefinedOperationError";

  constructor() {
    super(`operation not defined`);
  }

  static assert(cond: boolean): asserts cond {
    if (!cond) throw new UndefinedOperationError();
  }
}

export type Value =
  | UnitValue
  | BooleanValue
  | BooleanType
  | BooleanConstructor
  | DimValue
  | DimType
  | DimConstructor;

export class UnitValue {
  toExpression(): ast.Unit<{}> {
    return ast.makeUnit({});
  }

  toTypeExpression(): ast.Unit<{}> {
    return ast.makeUnit({});
  }

  getType(): UnitValue {
    return this;
  }

  isSubtypeOf(other: Value): boolean {
    return other instanceof UnitValue;
  }
}

export class BooleanValue {
  constructor(readonly value: boolean) {}

  toExpression(): ast.Literal<{}> {
    return ast.makeLiteral(this.value, {});
  }

  toTypeExpression(): ast.Literal<{}> {
    return this.toExpression();
  }

  getType(): BooleanValue {
    return this;
  }

  isSubtypeOf(other: Value): boolean {
    return (other instanceof BooleanValue && other.equals(this)) || other instanceof BooleanType;
  }

  equals(other: BooleanValue): boolean {
    return this.value === other.value;
  }
}

export class BooleanType {
  toExpression(): never {
    throw new UndefinedOperationError();
  }

  toTypeExpression(): ast.SpecialLiteral<{}> {
    return ast.makeSpecialLiteral("boolean", {});
  }

  getType(): never {
    throw new UndefinedOperationError();
  }

  isSubtypeOf(other: Value): boolean {
    return other instanceof BooleanType;
  }
}

export class BooleanConstructor {
  toExpression(): ast.SpecialLiteral<{}> {
    return ast.makeSpecialLiteral("boolean", {});
  }

  toTypeExpression(): ast.Expression<{}> {
    return ast.makeAscriptionExpression(ast.makeIdentifier("type", {}), this.toExpression(), {});
  }

  getType(): BooleanConstructor {
    return this;
  }

  isSubtypeOf(other: Value): boolean {
    return other instanceof BooleanConstructor;
  }
}

export class DimValue {
  constructor(readonly value: number, readonly cons: DimConstructor) {}

  get isScalar(): boolean {
    return this.cons.isScalar;
  }

  toExpression(): ast.Expression<{}> {
    if (this.isScalar && this.cons.factor === 1) return ast.makeLiteral(this.value, {});

    return ast.makeAscriptionExpression(
      ast.makeLiteral(this.value, {}),
      ast.makeParentheses(this.cons.toExpression(), {}),
      {}
    );
  }

  toTypeExpression(): ast.Expression<{}> {
    return this.toExpression();
  }

  getType(): DimValue {
    return this;
  }

  isSubtypeOf(other: Value): boolean {
    return (
      (other instanceof DimValue && this.equals(other)) ||
      (other instanceof DimType && this.cons.equals(other.cons))
    );
  }

  negate(): DimValue {
    return new DimValue(-this.value, this.cons);
  }

  power(power: number): DimValue {
    return new DimValue(this.value ** power, this.cons.power(power));
  }

  plus(other: DimValue): DimValue {
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new DimValue(this.value + other.value, this.cons);
  }

  minus(other: DimValue): DimValue {
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new DimValue(this.value - other.value, this.cons);
  }

  times(other: DimValue): DimValue {
    return new DimValue(this.value * other.value, this.cons.times(other.cons));
  }

  divide(other: DimValue): DimValue {
    return new DimValue(this.value / other.value, this.cons.divide(other.cons));
  }

  modulo(other: DimValue): DimValue {
    UndefinedOperationError.assert(this.isScalar);
    UndefinedOperationError.assert(other.isScalar);
    return new DimValue(this.value % other.value, this.cons);
  }

  equals(other: DimValue): boolean {
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return this.value === other.value;
  }

  compareTo(other: DimValue): number {
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return this.value - other.value;
  }

  ascribe(cons: DimConstructor): DimValue {
    UndefinedOperationError.assert(this.isScalar);
    return new DimValue(this.value, cons);
  }

  convertTo(to: DimConstructor): DimValue {
    UndefinedOperationError.assert(this.cons.baseDims.equals(to.baseDims));
    return new DimValue((this.value * this.cons.factor) / to.factor, to);
  }
}

export class DimType {
  constructor(readonly cons: DimConstructor) {}

  get isScalar(): boolean {
    return this.cons.isScalar;
  }

  toExpression(): never {
    throw new UndefinedOperationError();
  }

  toTypeExpression(): ast.Expression<{}> {
    return this.cons.toExpression();
  }

  getType(): never {
    throw new UndefinedOperationError();
  }

  isSubtypeOf(other: Value): boolean {
    return other instanceof DimType && this.equals(other);
  }

  power(power: number): DimType {
    return new DimType(this.cons.power(power));
  }

  times(other: DimType): DimType {
    return new DimType(this.cons.times(other.cons));
  }

  divide(other: DimType): DimType {
    return new DimType(this.cons.divide(other.cons));
  }

  equals(other: DimType): boolean {
    return this.cons.equals(other.cons);
  }
}

export class DimConstructor {
  constructor(
    readonly dims: Dimensions,
    readonly baseDims: Dimensions = dims,
    readonly factor: number = 1
  ) {}

  get isScalar(): boolean {
    return this.dims.isScalar;
  }

  toExpression(): ast.Expression<{}> {
    let result: ast.Expression<{}>;

    if (this.isScalar) {
      result = ast.makeSpecialLiteral("scalar", {});
    } else {
      result = [...this.dims.map]
        .map<ast.Expression<{}>>(([k, v]) => {
          const id = ast.makeIdentifier(k, {});
          if (v === 1) return id;
          return ast.makePowerExpression(id, v, {});
        })
        .reduce((l, r) => ast.makeBinaryExpression(l, "*", r, {}));
    }

    if (this.dims.equals(this.baseDims) && this.factor !== 1) {
      result = ast.makeBinaryExpression(ast.makeLiteral(this.factor, {}), "*", result, {});
    }

    return result;
  }

  toTypeExpression(): ast.Expression<{}> {
    return ast.makeAscriptionExpression(ast.makeIdentifier("unit", {}), this.toExpression(), {});
  }

  getType(): DimConstructor {
    return this;
  }

  isSubtypeOf(other: Value): boolean {
    return other instanceof DimConstructor && this.equals(other);
  }

  negate(): DimConstructor {
    return new DimConstructor(this.dims, this.baseDims, -this.factor);
  }

  power(power: number): DimConstructor {
    return new DimConstructor(
      this.dims.power(power),
      this.baseDims.power(power),
      this.factor ** power
    );
  }

  times(other: DimConstructor): DimConstructor {
    return new DimConstructor(
      this.dims.times(other.dims),
      this.baseDims.times(other.baseDims),
      this.factor * other.factor
    );
  }

  divide(other: DimConstructor): DimConstructor {
    return new DimConstructor(
      this.dims.divide(other.dims),
      this.baseDims.divide(other.baseDims),
      this.factor / other.factor
    );
  }

  equals(other: DimConstructor): boolean {
    return (
      this.dims.equals(other.dims) &&
      this.baseDims.equals(other.baseDims) &&
      this.factor === other.factor
    );
  }
}
