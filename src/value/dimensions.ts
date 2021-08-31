export class Dimensions {
  static readonly SCALAR = new Dimensions(new Map());

  static fromUnit(label: string): Dimensions {
    return new Dimensions(new Map([[label, 1]]));
  }

  readonly map: ReadonlyMap<string, number>;

  constructor(map: ReadonlyMap<string, number>) {
    this.map = new Map([...map].filter(([_k, v]) => v !== 0));
  }

  get isScalar(): boolean {
    return this.map.size == 0;
  }

  get(label: string): number {
    return this.map.get(label) ?? 0;
  }

  set(label: string, value: number): Dimensions {
    const map = new Map(this.map);
    value === 0 ? map.delete(label) : map.set(label, value);
    return new Dimensions(map);
  }

  equals(other: Dimensions): boolean {
    for (const k of this.map.keys()) {
      if (this.get(k) !== other.get(k)) return false;
    }

    for (const k of other.map.keys()) {
      if (this.get(k) !== other.get(k)) return false;
    }

    return true;
  }

  power(power: number): Dimensions {
    const map = new Map();
    for (const [k, v] of this.map) map.set(k, v * power);
    return new Dimensions(map);
  }

  times(other: Dimensions): Dimensions {
    const map = new Map(this.map);
    for (const [k, v] of other.map) map.set(k, (map.get(k) ?? 0) + v);
    return new Dimensions(map);
  }

  divide(other: Dimensions): Dimensions {
    const map = new Map(this.map);
    for (const [k, v] of other.map) map.set(k, (map.get(k) ?? 0) - v);
    return new Dimensions(map);
  }
}
