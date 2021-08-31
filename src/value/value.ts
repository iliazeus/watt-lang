import * as ast from "../ast";
import * as factory from "../factory";

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
  | Hole
  | BooleanValue
  | BooleanType
  | BooleanConstructor
  | DimValue
  | DimType
  | DimConstructor;

export class Hole {
  constructor(readonly name: string, readonly type: Value) {}

  toExpression(): ast.Identifier<{}> {
    return factory.makeIdentifier(this.name, {});
  }

  toTypeExpression(): never {
    throw new UndefinedOperationError();
  }

  getType(): Value {
    return this.type;
  }
}

export class BooleanValue {
  constructor(readonly value: boolean) {}

  toExpression(): ast.Literal<{}> {
    return factory.makeLiteral(this.value, {});
  }

  toTypeExpression(): ast.Literal<{}> {
    return this.toExpression();
  }

  getType(): BooleanValue {
    return this;
  }

  equals(other: BooleanValue): boolean {
    return this.value === other.value;
  }
}

export class BooleanType {
  toExpression(): never {
    throw new UndefinedOperationError();
  }

  toTypeExpression(): ast.TypeLiteral<{}> {
    return factory.makeTypeLiteral("boolean", {});
  }

  getType(): never {
    throw new UndefinedOperationError();
  }

  isSubtypeOf(other: Value): boolean {
    return other instanceof BooleanType;
  }
}

export class BooleanConstructor {
  toExpression(): ast.TypeLiteral<{}> {
    return factory.makeTypeLiteral("boolean", {});
  }

  toTypeExpression(): ast.Expression<{}> {
    return factory.makeAscriptionExpression(
      factory.makeIdentifier("type", {}),
      this.toExpression(),
      {}
    );
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
    if (this.isScalar) return factory.makeLiteral(this.value, {});

    return factory.makeAscriptionExpression(
      factory.makeLiteral(this.value, {}),
      factory.makeParentheses(this.cons.toExpression(), {}),
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
    if (this.isScalar) return factory.makeTypeLiteral("scalar", {});

    let result = [...this.dims.map]
      .map<ast.Expression<{}>>(([k, v]) => {
        const id = factory.makeIdentifier(k, {});
        if (v === 1) return id;
        return factory.makePowerExpression(id, v, {});
      })
      .reduce((l, r) => factory.makeBinaryExpression(l, "*", r, {}));

    if (this.dims.equals(this.baseDims) && this.factor !== 1) {
      result = factory.makeBinaryExpression(factory.makeLiteral(this.factor, {}), "*", result, {});
    }

    return result;
  }

  toTypeExpression(): ast.Expression<{}> {
    return factory.makeAscriptionExpression(
      factory.makeIdentifier("unit", {}),
      this.toExpression(),
      {}
    );
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
