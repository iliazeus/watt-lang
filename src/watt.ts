#!/usr/bin/env node

import * as readline from "readline";

import * as watt from "./index";

const context: watt.interpreter.Context = {};

context["m"] = new watt.value.DimConstructor(watt.value.Dimensions.fromUnit("m"));

context["km"] = new watt.value.DimConstructor(
  watt.value.Dimensions.fromUnit("km"),
  context["m"].baseDims,
  1000
);

context["s"] = new watt.value.DimConstructor(watt.value.Dimensions.fromUnit("s"));

context["min"] = new watt.value.DimConstructor(
  watt.value.Dimensions.fromUnit("min"),
  context["s"].baseDims,
  60
);

context["h"] = new watt.value.DimConstructor(
  watt.value.Dimensions.fromUnit("h"),
  context["s"].baseDims,
  3600
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "watt> ",
});

rl.once("SIGINT", () => rl.close());

rl.on("line", (input) => {
  try {
    const expr = watt.parser.parseExpression(input);
    const value = watt.interpreter.evaluateExpression(context, expr);
    const output = watt.printer.printExpression(value.toExpression());
    console.log(output);
  } catch (error) {
    console.log(String(error));
  } finally {
    rl.prompt();
  }
});

rl.prompt();
