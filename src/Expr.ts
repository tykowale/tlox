import { Token } from 'src/Token';

export type Expr = BinaryExpr | GroupingExpr | LiteralExpr | UnaryExpr;

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

export interface UnaryExpr {
  type: 'unary';
  operator: Token;
  right: Expr;
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

export function createUnary(operator: Token, right: Expr): UnaryExpr {
  return {
    type: 'unary',
    operator,
    right,
  };
}

export type ExprMatcher<R> = {
  binary: (b: BinaryExpr) => R;
  grouping: (g: GroupingExpr) => R;
  literal: (l: LiteralExpr) => R;
  unary: (u: UnaryExpr) => R;
};

export function matchExpr<R>(expr: Expr, matcher: ExprMatcher<R>): R {
  switch (expr.type) {
    case 'binary':
      return matcher.binary(expr as BinaryExpr);
    case 'grouping':
      return matcher.grouping(expr as GroupingExpr);
    case 'literal':
      return matcher.literal(expr as LiteralExpr);
    case 'unary':
      return matcher.unary(expr as UnaryExpr);
  }
}
