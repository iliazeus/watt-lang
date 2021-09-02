import * as ast from "../ast";

import * as parser from "./parser";

export function parseExpression(input: string): ast.Expression<ast.LocationMeta> {
  return parser.parse(input, { startRule: "Start_Expression" });
}
