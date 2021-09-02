import * as ast from "../ast";

export function print(node: ast.Node<unknown>): string {
  switch (node.type) {
    case "Unit":
      return `()`;

    case "Identifier":
      return node.name;

    case "Literal":
      return JSON.stringify(node.value);

    case "SpecialLiteral":
      return node.name;

    case "Parentheses":
      return `(${print(node.argument)})`;

    case "PrefixExpression":
      return `${node.operator}${print(node.argument)}`;

    case "PowerExpression":
      return `${print(node.argument)}^${node.power}`;

    case "BinaryExpression":
      return `${print(node.left)} ${node.operator} ${print(node.right)}`;

    case "LogicalExpression":
      return `${print(node.left)} ${node.operator} ${print(node.right)}`;

    case "AscriptionExpression":
      return `${print(node.left)} ${print(node.right)}`;

    case "ConversionExpression":
      return `${print(node.left)} as ${print(node.right)}`;
  }
}
