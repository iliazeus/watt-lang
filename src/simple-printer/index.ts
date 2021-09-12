import * as ast from "../ast";

export function print(node: ast.Node<unknown>): string {
  switch (node.type) {
    case "EmptyStatement":
      return `;`;

    case "VarStatement":
      if (!node.annotation && !node.value) return `var ${node.name};`;
      if (!node.annotation) return `var ${node.name} = ${print(node.value!)};`;
      if (!node.value) return `var ${node.name}: ${print(node.annotation)};`;
      return `var ${node.name}: ${print(node.annotation)} = ${print(node.value)};`;

    case "AssignmentStatement":
      return `${node.name} := ${print(node.value)};`;

    case "UnitStatement":
      if (!node.expression) return `unit ${node.name};`;
      return `unit ${node.name} = ${print(node.expression)};`;

    case "BlockStatement":
      return `{\n${node.body.map((s) => `  ${print(s)}`)}\n}`;

    case "IfStatement":
      if (!node.elseBody) return `if (${print(node.condition)}) ${print(node.thenBody)}`;
      return `if (${print(node.condition)}) ${print(node.thenBody)} else ${print(node.elseBody)}`;

    case "WhileStatement":
      return `while (${print(node.condition)}) ${print(node.body)}`;

    case "LetStatement":
      return `let ${node.name} = ${print(node.expression)};`;

    case "ExpressionStatement":
      return `${print(node.expression)};`;

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
