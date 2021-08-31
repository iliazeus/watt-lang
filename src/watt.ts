#!/usr/bin/env node

import * as readline from "readline";

import { value as v, parser, typecheck, interpreter, printer, util } from "./index";

const ctx: interpreter.Context = {};

ctx["m"] = new v.DimConstructor(v.Dimensions.fromUnit("m"));
ctx["km"] = new v.DimConstructor(v.Dimensions.fromUnit("km"), ctx["m"].baseDims, 1000);

ctx["_m"] = new v.Hole("_m", new v.DimType(ctx["m"]));
ctx["_km"] = new v.Hole("_km", new v.DimType(ctx["km"]));

ctx["s"] = new v.DimConstructor(v.Dimensions.fromUnit("s"));
ctx["min"] = new v.DimConstructor(v.Dimensions.fromUnit("min"), ctx["s"].baseDims, 60);
ctx["h"] = new v.DimConstructor(v.Dimensions.fromUnit("h"), ctx["s"].baseDims, 3600);

ctx["_s"] = new v.Hole("_s", new v.DimType(ctx["s"]));
ctx["_min"] = new v.Hole("_min", new v.DimType(ctx["min"]));
ctx["_h"] = new v.Hole("_h", new v.DimType(ctx["h"]));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "watt> ",
});

rl.once("SIGINT", () => rl.close());

rl.on("line", (input) => {
  try {
    if (input.match(/^\s*$/)) return;

    const match = input.match(/^\s*([.]\w+)(.*)/);
    const command = match?.[1] ?? ".eval";
    input = match?.[2] ?? input;

    if (command === ".ast") {
      const expr = parser.parseExpression(input);
      console.log(JSON.stringify(expr, undefined, 2));
      return;
    }

    if (command === ".parens") {
      const expr = parser.parseExpression(input);
      const parens = util.parenthesizeExpression(expr);
      const output = printer.printExpression(parens);
      console.log(output);
      return;
    }

    if (command === ".type") {
      const expr = parser.parseExpression(input);
      const typed = typecheck.inferTypesInExpression(ctx, expr);
      const typeOutput = printer.printExpression(typed.meta.type.toTypeExpression());
      console.log(typeOutput);
      return;
    }

    if (command == ".eval") {
      const expr = parser.parseExpression(input);
      const typed = typecheck.inferTypesInExpression(ctx, expr);
      const evaluated = interpreter.evaluateExpression(ctx, typed);
      const valueOutput = printer.printExpression(evaluated.meta.value.toExpression());
      console.log(valueOutput);
      return;
    }

    throw Error(`unknown interpreter command: ${command}`);
  } catch (error) {
    // console.log(error);
    console.log(String(error));
  } finally {
    rl.prompt();
  }
});

rl.prompt();
