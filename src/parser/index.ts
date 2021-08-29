import * as parser from "./parser";

import { Expression } from "../ast";
import { Location } from "../util/location";

export function parseExpression(input: string): Expression<Location> {
  return parser.parse(input, { startRule: "Start_Expression" });
}
