import { Expr } from 'src/Expr';

export type Stmt = ExpressionStmt | PrintStmt;

export interface ExpressionStmt {
  type: 'expression';
  expression: Expr;
}

export interface PrintStmt {
  type: 'print';
  expression: Expr;
}

export function createExpression(expression: Expr): ExpressionStmt {
  return {
    type: 'expression',
    expression,
  };
}

export function createPrint(expression: Expr): PrintStmt {
  return {
    type: 'print',
    expression,
  };
}

export type StmtMatcher<R> = {
  expression: (e: ExpressionStmt) => R;
  print: (p: PrintStmt) => R;
};

export function matchStmt<R>(stmt: Stmt, matcher: StmtMatcher<R>): R {
  switch (stmt.type) {
    case 'expression':
      return matcher.expression(stmt as ExpressionStmt);
    case 'print':
      return matcher.print(stmt as PrintStmt);
  }
}
