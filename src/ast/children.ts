import * as ast from "./ast";
import { isExpression, isStatement } from "./is";

export function forEachChild<M>(node: ast.Node<M>, fn: (child: ast.Node<M>) => void): ast.Node<M> {
  switch (node.type) {
    case "EmptyStatement":
      return node;

    case "BlockStatement":
      return node.body.forEach(fn), node;

    case "LetStatement":
    case "ExpressionStatement":
      return fn(node.expression), node;

    case "Unit":
    case "Identifier":
    case "Literal":
    case "SpecialLiteral":
      return node;

    case "Parentheses":
    case "PrefixExpression":
    case "PowerExpression":
      return fn(node.argument), node;

    case "BinaryExpression":
    case "LogicalExpression":
    case "AscriptionExpression":
    case "ConversionExpression":
      return fn(node.left), fn(node.right), node;
  }
}

function assert(cond: boolean): asserts cond {
  if (!cond) throw new Error("assertion error");
}

export function mapChildren<M, MM>(
  node: ast.Node<M>,
  fn: (node: ast.Node<M>) => ast.Node<MM>
): ast.Node<M, MM> {
  switch (node.type) {
    case "EmptyStatement":
      return node;

    case "BlockStatement": {
      const body = node.body.map(fn);
      assert(body.every(isStatement));
      return { ...node, body };
    }

    case "LetStatement":
    case "ExpressionStatement": {
      const expression = fn(node.expression);
      assert(isExpression(expression));
      return { ...node, expression };
    }

    case "Unit":
    case "Identifier":
    case "Literal":
    case "SpecialLiteral":
      return node;

    case "Parentheses":
    case "PrefixExpression":
    case "PowerExpression": {
      const argument = fn(node.argument);
      assert(isExpression(argument));
      return { ...node, argument };
    }

    case "BinaryExpression":
    case "LogicalExpression":
    case "AscriptionExpression":
    case "ConversionExpression": {
      const left = fn(node.left),
        right = fn(node.right);
      assert(isExpression(left) && isExpression(right));
      return { ...node, left, right };
    }
  }
}
