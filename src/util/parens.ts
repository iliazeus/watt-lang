import * as ast from "../ast";

export function parenthesize<M>(node: ast.Node<M>): ast.Node<M> {
  node = stripParentheses(node);

  node = ast.mapChildren(node, (child) => {
    if (!ast.isExpression(child)) return child;

    switch (child.type) {
      case "Identifier":
      case "Literal":
      case "SpecialLiteral":
        return child;
    }

    return ast.makeParentheses(child, child.meta);
  });

  return node;
}

export function stripParentheses<M>(node: ast.Node<M>): ast.Node<M> {
  const node1 = ast.mapChildren(node, stripParentheses);
  if (node1.type === "Parentheses") return node1.argument;
  return node1;
}
