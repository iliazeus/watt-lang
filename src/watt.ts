#!/usr/bin/env node

import * as readline from "readline";

import * as watt from "./index";

const context: watt.interpreter.Context = {};

context["m"] = watt.interpreter.Value.fromUnit("m", 1);
context["km"] = watt.interpreter.Value.fromUnit("km", 1000);

context["s"] = watt.interpreter.Value.fromUnit("s", 1);
context["min"] = watt.interpreter.Value.fromUnit("min", 60);
context["h"] = watt.interpreter.Value.fromUnit("h", 3600);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "watt> ",
});

rl.once("SIGINT", () => rl.close());

rl.on("line", (input) => {
  try {
    const expr = watt.parser.parseExpression(input);
    const value = watt.interpreter.expression.evaluate(context, expr);
    const output = watt.printer.printExpression(value.toExpression());
    console.log(output);
  } catch (error) {
    console.log(String(error));
  } finally {
    rl.prompt();
  }
});

rl.prompt();
