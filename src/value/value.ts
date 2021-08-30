import * as ast from "../ast";
import * as factory from "../factory";

import { BaseValue, UndefinedOperationError } from "./base";
import { Dimensions } from "./dimensions";

export type Value =
  | Hole
  | BooleanValue
  | BooleanType
  | BooleanConstructor
  | DimValue
  | DimType
  | DimConstructor;

export class Hole extends BaseValue {
  constructor(readonly name: string, readonly type: Value) {
    super();
  }

  toExpression(): ast.Identifier<{}> {
    return factory.makeIdentifier(this.name, {});
  }

  toTypeExpression(): ast.Expression<{}> {
    return this.type.toExpression();
  }

  getType(): Value {
    return this.type;
  }
}

export class BooleanValue extends BaseValue {
  constructor(readonly value: boolean) {
    super();
  }

  toExpression(): ast.Literal<{}> {
    return factory.makeLiteral(this.value, {});
  }

  toTypeExpression(): never {
    throw new UndefinedOperationError();
  }

  getType(): BooleanType {
    return new BooleanType();
  }

  override not(): BooleanValue {
    return new BooleanValue(!this.value);
  }

  override equals(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof BooleanValue);
    return new BooleanValue(this.value === other.value);
  }

  override doesNotEqual(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof BooleanValue);
    return new BooleanValue(this.value !== other.value);
  }
}

export class BooleanType extends BaseValue {
  toExpression(): never {
    throw new UndefinedOperationError();
  }

  toTypeExpression(): ast.TypeLiteral<{}> {
    return factory.makeTypeLiteral("boolean", {});
  }

  getType(): never {
    throw new UndefinedOperationError();
  }

  override not(): BooleanType {
    return this;
  }

  override equals(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof BooleanType);
    return this;
  }

  override doesNotEqual(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof BooleanType);
    return this;
  }
}

export class BooleanConstructor extends BaseValue {
  toExpression(): ast.TypeLiteral<{}> {
    return factory.makeTypeLiteral("boolean", {});
  }

  toTypeExpression(): never {
    throw new UndefinedOperationError();
  }

  getType(): BooleanConstructor {
    return this;
  }
}

export class DimValue extends BaseValue {
  constructor(readonly value: number, readonly cons: DimConstructor) {
    super();
  }

  toExpression(): ast.Expression<{}> {
    if (this.cons.dims.isScalar) {
      return factory.makeLiteral(this.value, {});
    }

    return factory.makeAscriptionExpression(
      factory.makeLiteral(this.value, {}),
      factory.makeParentheses(this.cons.toExpression(), {}),
      {}
    );
  }

  toTypeExpression(): never {
    throw new UndefinedOperationError();
  }

  getType(): DimType {
    return new DimType(this.cons);
  }

  override negate(): DimValue {
    return new DimValue(-this.value, this.cons);
  }

  override power(power: number): DimValue {
    return new DimValue(this.value ** power, this.cons.power(power));
  }

  override plus(other: Value): DimValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new DimValue(this.value + other.value, this.cons);
  }

  override minus(other: Value): DimValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new DimValue(this.value - other.value, this.cons);
  }

  override times(other: Value): DimValue | DimConstructor {
    if (other instanceof DimConstructor) return other.times(this);

    if (other instanceof DimValue) {
      return new DimValue(this.value * other.value, this.cons.times(other.cons));
    }

    throw new UndefinedOperationError();
  }

  override divide(other: Value): DimValue {
    if (other instanceof DimValue) {
      return new DimValue(this.value / other.value, this.cons.divide(other.cons));
    }

    throw new UndefinedOperationError();
  }

  override modulo(other: Value): DimValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.isScalar);
    UndefinedOperationError.assert(other.cons.dims.isScalar);
    return new DimValue(this.value % other.value, this.cons);
  }

  override equals(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanValue(this.value === other.value);
  }

  override doesNotEqual(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanValue(this.value !== other.value);
  }

  override lessThan(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanValue(this.value < other.value);
  }

  override lessThanOrEqual(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanValue(this.value <= other.value);
  }

  override greaterThan(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanValue(this.value > other.value);
  }

  override greaterThanOrEqual(other: Value): BooleanValue {
    UndefinedOperationError.assert(other instanceof DimValue);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanValue(this.value >= other.value);
  }

  override ascribe(cons: Value): DimValue {
    UndefinedOperationError.assert(cons instanceof DimConstructor);
    UndefinedOperationError.assert(this.cons.dims.isScalar);
    return new DimValue(this.value, cons);
  }

  override convert(to: Value): DimValue {
    UndefinedOperationError.assert(to instanceof DimConstructor);
    UndefinedOperationError.assert(this.cons.baseDims.equals(to.baseDims));
    return new DimValue((this.value * this.cons.factor) / to.factor, to);
  }
}

export class DimType extends BaseValue {
  constructor(readonly cons: DimConstructor) {
    super();
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

  override negate(): DimType {
    return this;
  }

  override power(power: number): DimType {
    return new DimType(this.cons.power(power));
  }

  override plus(other: Value): DimType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return this;
  }

  override minus(other: Value): DimType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return this;
  }

  override times(other: Value): DimType {
    if (other instanceof DimValue) {
      UndefinedOperationError.assert(other.cons.dims.isScalar);
      return new DimType(this.cons.times(other));
    }

    if (other instanceof DimType) {
      return new DimType(this.cons.times(other.cons));
    }

    throw new UndefinedOperationError();
  }

  override divide(other: Value): DimType {
    if (other instanceof DimValue) {
      UndefinedOperationError.assert(other.cons.dims.isScalar);
      return new DimType(this.cons.divide(other.cons));
    }

    if (other instanceof DimType) {
      return new DimType(this.cons.divide(other.cons));
    }

    throw new UndefinedOperationError();
  }

  override modulo(other: Value): DimType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.isScalar);
    UndefinedOperationError.assert(other.cons.dims.isScalar);
    return this;
  }

  override equals(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanType();
  }

  override doesNotEqual(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanType();
  }

  override lessThan(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanType();
  }

  override lessThanOrEqual(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanType();
  }

  override greaterThan(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanType();
  }

  override greaterThanOrEqual(other: Value): BooleanType {
    UndefinedOperationError.assert(other instanceof DimType);
    UndefinedOperationError.assert(this.cons.dims.equals(other.cons.dims));
    return new BooleanType();
  }

  override ascribe(cons: Value): DimType {
    UndefinedOperationError.assert(cons instanceof DimConstructor);
    UndefinedOperationError.assert(this.cons.dims.isScalar);
    return new DimType(cons);
  }

  override convert(to: Value): DimType {
    UndefinedOperationError.assert(to instanceof DimConstructor);
    UndefinedOperationError.assert(this.cons.baseDims.equals(to.baseDims));
    return new DimType(to);
  }
}

export class DimConstructor extends BaseValue {
  constructor(
    readonly dims: Dimensions,
    readonly baseDims: Dimensions = dims,
    readonly factor: number = 1
  ) {
    super();
  }

  toExpression(): ast.Expression<{}> {
    if (this.dims.isScalar) {
      return factory.makeTypeLiteral("scalar", {});
    }

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

  toTypeExpression(): never {
    throw new UndefinedOperationError();
  }

  getType(): DimConstructor {
    return this;
  }

  override power(power: number): DimConstructor {
    return new DimConstructor(
      this.dims.power(power),
      this.baseDims.power(power),
      this.factor ** power
    );
  }

  override times(other: Value): DimConstructor {
    if (other instanceof DimValue) {
      UndefinedOperationError.assert(other.cons.dims.isScalar);
      return new DimConstructor(this.dims, this.baseDims, this.factor * other.value);
    }

    if (other instanceof DimConstructor) {
      return new DimConstructor(
        this.dims.times(other.dims),
        this.baseDims.times(other.baseDims),
        this.factor * other.factor
      );
    }

    throw new UndefinedOperationError();
  }

  override divide(other: Value): DimConstructor {
    if (other instanceof DimValue) {
      UndefinedOperationError.assert(other.cons.dims.isScalar);
      return new DimConstructor(this.dims, this.baseDims, this.factor / other.value);
    }

    if (other instanceof DimConstructor) {
      return new DimConstructor(
        this.dims.divide(other.dims),
        this.baseDims.divide(other.baseDims),
        this.factor / other.factor
      );
    }

    throw new UndefinedOperationError();
  }
}
