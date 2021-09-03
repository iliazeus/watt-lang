import * as ast from "../ast";

import * as parser from "./parser";

export function parseReplStatement(input: string): ast.Statement<ast.LocationMeta> {
  return parser.parse(input + "\n", { startRule: "Start_ReplStatement" });
}

export function parseStatement(input: string): ast.Statement<ast.LocationMeta> {
  return parser.parse(input + "\n", { startRule: "Start_Statement" });
}

export function parseExpression(input: string): ast.Expression<ast.LocationMeta> {
  return parser.parse(input + "\n", { startRule: "Start_Expression" });
}
