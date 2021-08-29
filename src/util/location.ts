export interface Position {
  line: number;
  column: number;
  offset: number;
}

export function positionToString(pos: Position): string {
  return `${pos.line}:${pos.column}`;
}

export interface Location {
  start: Position;
  end: Position;
}

export function locationToString(loc: Location): string {
  return `${positionToString(loc.start)} - ${positionToString(loc.end)}`;
}
