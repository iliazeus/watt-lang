import { Location, locationToString } from "../util/location";

import { Value } from "./value";

export type Context = { [name: string]: Value };

export class RuntimeError extends Error {
  override name = "RuntimeError";
  location: Location;

  constructor(location: Location, message: string) {
    super(`${locationToString(location)} - ${message}`);
    this.location = location;
  }
}
