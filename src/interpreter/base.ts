import { Location, locationToString } from "../util/location";

export type Context = { [name: string]: Value };

export type Value = boolean | number;

export class RuntimeError extends Error {
  override name = "RuntimeError";
  location: Location;

  constructor(location: Location, message: string) {
    super(`${locationToString(location)} - ${message}`);
    this.location = location;
  }
}
