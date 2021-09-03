import * as pegjs from "pegjs";

import * as ast from "../ast";

export function parse(
  input: string,
  options: { startRule: "Start_ReplStatement" }
): ast.Statement<ast.LocationMeta>;

export function parse(
  input: string,
  options: { startRule: "Start_Statement" }
): ast.Statement<ast.LocationMeta>;

export function parse(
  input: string,
  options: { startRule: "Start_Expression" }
): ast.Expression<ast.LocationMeta>;
