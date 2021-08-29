import * as pegjs from "pegjs";

import { Expression } from "../ast";

export function parse(
  input: string,
  options: { startRule: "Start_Expression" }
): Expression<pegjs.LocationRange>;
