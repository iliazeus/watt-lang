import * as ast from "../ast";
import * as factory from "../factory";

export class Value {
  constructor(
    readonly value: number,
    readonly factor: number,
    readonly dims: ReadonlyMap<string, number>,
    readonly isUnit: boolean
  ) {}

  get isScalar(): boolean {
    return this.dims.size === 0;
  }

  static fromScalar(scalar: number): Value {
    return new Value(scalar, 1, new Map(), false);
  }

  get isBoolean(): boolean {
    return this.dims.size === 1 && this.dims.get("boolean") === 1;
  }

  static fromBoolean(value: boolean): Value {
    return new Value(value ? 1 : 0, 1, new Map([["boolean", 1]]), false);
  }

  static fromUnit(label: string, factor: number): Value {
    return new Value(1, factor, new Map([[label, 1]]), true);
  }

  toExpression(): ast.Expression<{}> {
    if (this.isScalar) return factory.makeLiteral(this.value, {});

    if (this.isBoolean) {
      return factory.makeLiteral(Boolean(this.value), {});
    }

    let result = [...this.dims]
      .map<ast.Expression<{}>>(([k, v]) => {
        const id = factory.makeIdentifier(k, {});
        if (v === 1) return id;
        return factory.makePowerExpression(id, v, {});
      })
      .reduce((l, r) => factory.makeBinaryExpression(l, "*", r, {}));

    result = factory.makeAscriptionExpression(factory.makeLiteral(this.value, {}), result, {});

    return result;
  }

  not(): Value {
    return Value.fromBoolean(this.value ? false : true);
  }

  unaryPlus(): Value {
    return this;
  }

  unaryMinus(): Value {
    return new Value(-this.value, this.factor, this.dims, this.isUnit);
  }

  power(power: number): Value {
    return new Value(
      this.value ** power,
      this.factor ** power,
      new Map([...this.dims].map(([k, v]) => [k, v * power])),
      this.isUnit
    );
  }

  plus(other: Value): Value {
    return new Value(this.value + other.value, this.factor, this.dims, false);
  }

  minus(other: Value): Value {
    return new Value(this.value - other.value, this.factor, this.dims, false);
  }

  times(other: Value): Value {
    const newDims = new Map(this.dims);
    for (const [k, v] of other.dims) newDims.set(k, (newDims.get(k) ?? 0) + v);

    return new Value(
      this.value * other.value,
      this.factor * other.factor,
      newDims,
      this.isUnit || other.isUnit
    );
  }

  divide(other: Value): Value {
    const newDims = new Map(this.dims);
    for (const [k, v] of other.dims) newDims.set(k, (newDims.get(k) ?? 0) - v);

    return new Value(
      this.value / other.value,
      this.factor / other.factor,
      newDims,
      this.isUnit || other.isUnit
    );
  }

  modulo(other: Value): Value {
    return new Value(this.value % other.value, this.factor, this.dims, false);
  }

  equals(other: Value): Value {
    return Value.fromBoolean(this.value === other.value);
  }

  notEquals(other: Value): Value {
    return Value.fromBoolean(this.value !== other.value);
  }

  lessThan(other: Value): Value {
    return Value.fromBoolean(this.value < other.value);
  }

  lessThanOrEqual(other: Value): Value {
    return Value.fromBoolean(this.value <= other.value);
  }

  greaterThan(other: Value): Value {
    return Value.fromBoolean(this.value > other.value);
  }

  greaterThanOrEqual(other: Value): Value {
    return Value.fromBoolean(this.value >= other.value);
  }

  and(other: Value): Value {
    return this.value ? other : this;
  }

  or(other: Value): Value {
    return this.value ? this : other;
  }

  as(other: Value): Value {
    return new Value(
      this.value * (this.factor / other.factor),
      other.factor,
      other.dims,
      this.isUnit && other.isUnit
    );
  }
}
