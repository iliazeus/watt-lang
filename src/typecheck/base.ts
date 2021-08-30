import { Value } from "../value";
import { Location, locationToString } from "../util/location";

export type Context = { [name: string]: Value };

export class TypeError extends Error {
  override name = "RuntimeError";

  constructor(readonly location: Location, message: string) {
    super(`${locationToString(location)} - ${message}`);
  }

  static assert(location: Location, cond: boolean, message: string): asserts cond {
    if (!cond) throw new TypeError(location, message);
  }
}
