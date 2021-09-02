import { Value } from "../value";

import { ListMap } from "../util";

export class Context {
  constructor(
    readonly types = ListMap.empty<string, Value>(),
    readonly values = ListMap.empty<string, Value>()
  ) {}

  getType(name: string): Value | undefined {
    return this.types.get(name);
  }

  getValue(name: string): Value | undefined {
    return this.values.get(name);
  }

  addType(name: string, value: Value): Context {
    return new Context(this.types.add(name, value), this.values);
  }

  addValue(name: string, value: Value): Context {
    return new Context(this.types, this.values.add(name, value));
  }

  setValue(name: string, value: Value): void {
    this.values.set(name, value);
  }
}
