#!/usr/bin/env node

import * as readline from "readline";

import { value as v, parser, interpreter, printer } from "./index";

const ctx: interpreter.Context = {};

ctx["m"] = new v.DimConstructor(v.Dimensions.fromUnit("m"));
ctx["km"] = new v.DimConstructor(v.Dimensions.fromUnit("km"), ctx["m"].baseDims, 1000);

ctx["s"] = new v.DimConstructor(v.Dimensions.fromUnit("s"));
ctx["min"] = new v.DimConstructor(v.Dimensions.fromUnit("min"), ctx["s"].baseDims, 60);
ctx["h"] = new v.DimConstructor(v.Dimensions.fromUnit("h"), ctx["s"].baseDims, 3600);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "watt> ",
});

rl.once("SIGINT", () => rl.close());

rl.on("line", (input) => {
  try {
    const expr = parser.parseExpression(input);
    const evaluated = interpreter.evaluateExpression(ctx, expr);
    const output = printer.printExpression(evaluated.meta.value.toExpression());
    console.log(output);
  } catch (error) {
    console.log(String(error));
  } finally {
    rl.prompt();
  }
});

rl.prompt();
