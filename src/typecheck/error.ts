import * as ast from "../ast";
import * as v from "../value";
import * as printer from "../simple-printer";

const show = (val: v.Value) => printer.print(val.toTypeExpression());

export class TypeError extends Error {
  override name = "TypeError";

  private constructor(readonly location: ast.Location, message: string) {
    super(`${ast.stringifyLocation(location)} - ${message}`);
  }

  static from(node: ast.Node<ast.LocationMeta>, error: unknown): TypeError {
    return new TypeError(node.meta.location, String(error));
  }

  static BaseDimensionsMustMatch(
    node: ast.Node<ast.LocationMeta>,
    left: v.Value,
    right: v.Value
  ): TypeError {
    return new TypeError(
      node.meta.location,
      `base dimensions do not match of '${show(left)}' and '${show(right)}'`
    );
  }

  static TypeMismatch(node: ast.Node<ast.LocationMeta>, left: v.Value, right: v.Value): TypeError {
    return new TypeError(node.meta.location, `type mismatch: '${show(left)}' and '${show(right)}'`);
  }

  static NameIsNotDefined(node: ast.Node<ast.LocationMeta>, name: string): TypeError {
    return new TypeError(node.meta.location, `'${name}' is not defined`);
  }

  static NotABoolean(node: ast.Node<ast.LocationMeta>, type: v.Value): TypeError {
    return new TypeError(node.meta.location, `not a boolean: '${show(type)}'`);
  }

  static NotANumber(node: ast.Node<ast.LocationMeta>, type: v.Value): TypeError {
    return new TypeError(node.meta.location, `not a number: ${show(type)}`);
  }

  static NotANumberOrUnit(node: ast.Node<ast.LocationMeta>, type: v.Value): TypeError {
    return new TypeError(node.meta.location, `not a number or unit: '${show(type)}'`);
  }

  static NotAScalar(node: ast.Node<ast.LocationMeta>, type: v.Value): TypeError {
    return new TypeError(node.meta.location, `not a scalar: '${show(type)}'`);
  }

  static NotAUnit(node: ast.Node<ast.LocationMeta>, type: v.Value): TypeError {
    return new TypeError(node.meta.location, `not a unit: ${show(type)}`);
  }

  static OperationIsNotDefinedForTypes(
    node: ast.Node<ast.LocationMeta>,
    op: string,
    left: v.Value,
    right: v.Value
  ): TypeError {
    return new TypeError(
      node.meta.location,
      `'${op}' is not defined for types '${show(left)}' and '${show(right)}'`
    );
  }

  static VarMustHaveTypeOrValue(node: ast.Node<ast.LocationMeta>): TypeError {
    return new TypeError(
      node.meta.location,
      `'var' bindings must either have a type annotation, or an initial value`
    );
  }
}
