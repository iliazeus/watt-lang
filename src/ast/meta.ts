import * as ast from "./ast";

export function annotate<M, A, MM>(node: ast.Node<M, MM>, meta: A): ast.Node<M & A, MM> {
  return { ...node, meta: { ...node.meta, ...meta } };
}

export function eraseAnnotation<M, K extends keyof M, MM>(
  node: ast.Node<M, MM>,
  key: K
): ast.Node<Omit<M, K>, MM> {
  const { [key]: value, ...meta } = node.meta;
  return { ...node, meta };
}

export type LocationMeta = { location: Location };

export interface Location {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export function stringifyLocation(loc: Location): string {
  return `${loc.start.line}:${loc.start.column} - ${loc.end.line}:${loc.end.column}`;
}
