import * as ast from "../ast";
import * as printer from "../simple-printer";
import * as v from "../value";

const show = (val: v.Value) => printer.print(val.toExpression());

export class RuntimeError extends Error {
  override name = "RuntimeError";

  private constructor(readonly location: ast.Location, message: string) {
    super(`${ast.stringifyLocation(location)} - ${message}`);
  }

  static from(node: ast.Node<ast.LocationMeta>, error: unknown): RuntimeError {
    return new RuntimeError(node.meta.location, String(error));
  }

  static BaseDimensionsDoNotMatch(
    node: ast.Node<ast.LocationMeta>,
    left: v.Value,
    right: v.Value
  ): RuntimeError {
    return new RuntimeError(
      node.meta.location,
      `base dimensions do not match of '${show(left)}' and '${show(right)}'`
    );
  }

  static NameIsNotDefined(node: ast.Node<ast.LocationMeta>, name: string): RuntimeError {
    return new RuntimeError(node.meta.location, `'${name}' is not defined`);
  }

  static NotABoolean(node: ast.Node<ast.LocationMeta>, val: v.Value): RuntimeError {
    return new RuntimeError(node.meta.location, `'${show(val)}' is not a boolean`);
  }

  static NotANumber(node: ast.Node<ast.LocationMeta>, val: v.Value): RuntimeError {
    return new RuntimeError(node.meta.location, `'${show(val)}' is not a number`);
  }

  static NotANumberOrAUnit(node: ast.Node<ast.LocationMeta>, val: v.Value): RuntimeError {
    return new RuntimeError(node.meta.location, `'${show(val)}' is not a number or a unit`);
  }

  static NotAScalar(node: ast.Node<ast.LocationMeta>, val: v.Value): RuntimeError {
    return new RuntimeError(node.meta.location, `'${show(val)}' is not a scalar`);
  }

  static NotAUnit(node: ast.Node<ast.LocationMeta>, val: v.Value): RuntimeError {
    return new RuntimeError(node.meta.location, `'${show(val)}' is not a unit`);
  }

  static OperationNotDefined(
    node: ast.Node<ast.LocationMeta>,
    op: string,
    left: v.Value,
    right: v.Value
  ): RuntimeError {
    return new RuntimeError(
      node.meta.location,
      `'${op}' is not defined for '${show(left)}' and '${show(right)}'`
    );
  }
}
