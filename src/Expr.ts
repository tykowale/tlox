import { Token } from 'src/Token';

export type Expr = AssignExpr | BinaryExpr | GroupingExpr | LiteralExpr | LogicalExpr | UnaryExpr | VariableExpr;

export interface AssignExpr {
  type: 'assign';
  name: Token;
  value: Expr;
}

export interface BinaryExpr {
  type: 'binary';
  left: Expr;
  operator: Token;
  right: Expr;
}

export interface GroupingExpr {
  type: 'grouping';
  expression: Expr;
}

export interface LiteralExpr {
  type: 'literal';
  value: unknown;
}

export interface LogicalExpr {
  type: 'logical';
  left: Expr;
  operator: Token;
  right: Expr;
}

export interface UnaryExpr {
  type: 'unary';
  operator: Token;
  right: Expr;
}

export interface VariableExpr {
  type: 'variable';
  name: Token;
}

export function createAssign(name: Token, value: Expr): AssignExpr {
  return {
    type: 'assign',
    name,
    value,
  };
}

export function createBinary(left: Expr, operator: Token, right: Expr): BinaryExpr {
  return {
    type: 'binary',
    left,
    operator,
    right,
  };
}

export function createGrouping(expression: Expr): GroupingExpr {
  return {
    type: 'grouping',
    expression,
  };
}

export function createLiteral(value: unknown): LiteralExpr {
  return {
    type: 'literal',
    value,
  };
}

export function createLogical(left: Expr, operator: Token, right: Expr): LogicalExpr {
  return {
    type: 'logical',
    left,
    operator,
    right,
  };
}

export function createUnary(operator: Token, right: Expr): UnaryExpr {
  return {
    type: 'unary',
    operator,
    right,
  };
}

export function createVariable(name: Token): VariableExpr {
  return {
    type: 'variable',
    name,
  };
}

export type ExprMatcher<R> = {
  assign: (a: AssignExpr) => R;
  binary: (b: BinaryExpr) => R;
  grouping: (g: GroupingExpr) => R;
  literal: (l: LiteralExpr) => R;
  logical: (l: LogicalExpr) => R;
  unary: (u: UnaryExpr) => R;
  variable: (v: VariableExpr) => R;
};

export function matchExpr<R>(expr: Expr, matcher: ExprMatcher<R>): R {
  switch (expr.type) {
    case 'assign':
      return matcher.assign(expr as AssignExpr);
    case 'binary':
      return matcher.binary(expr as BinaryExpr);
    case 'grouping':
      return matcher.grouping(expr as GroupingExpr);
    case 'literal':
      return matcher.literal(expr as LiteralExpr);
    case 'logical':
      return matcher.logical(expr as LogicalExpr);
    case 'unary':
      return matcher.unary(expr as UnaryExpr);
    case 'variable':
      return matcher.variable(expr as VariableExpr);
  }
}
