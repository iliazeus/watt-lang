#!/usr/bin/env node

import * as readline from "readline";

import { value as v, parser, typecheck, interpreter, printer, util } from "./index";

let ctx = new v.Context();

{
  const m = new v.DimConstructor(v.Dimensions.fromUnit("m"));
  ctx = ctx.addType("m", m).addValue("m", m).addType("_m", new v.DimType(m));

  const km = new v.DimConstructor(v.Dimensions.fromUnit("km"), m.baseDims, 1000);
  ctx = ctx.addType("km", km).addValue("km", km).addType("_km", new v.DimType(m));

  const s = new v.DimConstructor(v.Dimensions.fromUnit("s"));
  ctx = ctx.addType("s", s).addValue("s", s).addType("_s", new v.DimType(s));

  const min = new v.DimConstructor(v.Dimensions.fromUnit("min"), s.baseDims, 60);
  ctx = ctx.addType("min", min).addValue("min", min).addType("_min", new v.DimType(min));

  const h = new v.DimConstructor(v.Dimensions.fromUnit("h"), s.baseDims, 3600);
  ctx = ctx.addType("h", h).addValue("h", h).addType("_h", new v.DimType(h));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "watt> ",
});

rl.once("SIGINT", () => rl.close());
rl.once("close", () => console.log());

rl.on("line", (input) => {
  try {
    if (input.match(/^\s*$/)) return;

    const match = input.match(/^\s*([.]\w+)\s*(.*)/);
    const command = match?.[1];
    input = match?.[2] ?? input;

    if (command === ".help") {
      console.log(".help           show this message");
      console.log(".exit           exit the REPL");
      console.log(".clear          clear the screen");
      console.log(".ast <expr>     show the AST");
      console.log(".parens <epxr>  fully parenthesize an expression");
      console.log(".type <expr>    show type of expression");
      console.log(".undef <name>   remove the binding");
      return;
    }

    if (command === ".exit") {
      rl.setPrompt("");
      setImmediate(() => rl.close());
      return;
    }

    if (command === ".clear") {
      console.clear();
      return;
    }

    if (command === ".ast") {
      const expr = parser.parseExpression(input);
      console.dir(expr, { depth: null });
      return;
    }

    if (command === ".parens") {
      const expr = parser.parseExpression(input);
      const parens = util.parenthesize(expr);
      const output = printer.print(parens);
      console.log(output);
      return;
    }

    if (command === ".type") {
      const expr = parser.parseExpression(input);
      const [typed, typectx] = typecheck.inferTypes(ctx, expr);
      ctx = typectx;
      const output = printer.print(typed.meta.type.toTypeExpression());
      console.log(output);
      return;
    }

    if (command === ".undef") {
      const name = input.trim();
      ctx = ctx.deleteType(name).deleteValue(name);
      return;
    }

    if (command === undefined) {
      const stmt = parser.parseReplStatement(input);
      const [typed, typectx] = typecheck.inferTypes(ctx, stmt);
      const [value, valuectx] = interpreter.evaluate(typectx, typed);
      ctx = valuectx;
      const output = printer.print(value.toExpression());
      console.log(output);
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
