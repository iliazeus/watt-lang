#!/usr/bin/env node

import * as readline from "readline";

import * as watt from "./index";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "watt> ",
});

rl.once("SIGINT", () => rl.close());

rl.on("line", (input) => {
  try {
    const expr = watt.parser.parseExpression(input);
    const value = watt.interpreter.expression.evaluate({}, expr);
    console.log(value);
  } catch (error) {
    console.log(String(error));
  } finally {
    rl.prompt();
  }
});

rl.prompt();
