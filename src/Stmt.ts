import { Expr } from 'src/Expr';
import { Token } from 'src/Token';

export type Stmt = ExpressionStmt | PrintStmt | VarStmt | BlockStmt;

export interface ExpressionStmt {
  type: 'expression';
  expression: Expr;
}

export interface PrintStmt {
  type: 'print';
  expression: Expr;
}

export interface VarStmt {
  type: 'var';
  name: Token;
  initializer: Expr | null;
}

export interface BlockStmt {
  type: 'block';
  statements: (Stmt | null)[];
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

export function createVar(name: Token, initializer: Expr | null): VarStmt {
  return {
    type: 'var',
    name,
    initializer,
  };
}

export function createBlock(statements: (Stmt | null)[]): BlockStmt {
  return {
    type: 'block',
    statements,
  };
}

export type StmtMatcher<R> = {
  expression: (e: ExpressionStmt) => R;
  print: (p: PrintStmt) => R;
  var: (v: VarStmt) => R;
  block: (b: BlockStmt) => R;
};

export function matchStmt<R>(stmt: Stmt, matcher: StmtMatcher<R>): R {
  switch (stmt.type) {
    case 'expression':
      return matcher.expression(stmt);
    case 'print':
      return matcher.print(stmt);
    case 'var':
      return matcher.var(stmt);
    case 'block':
      return matcher.block(stmt);
  }
}
