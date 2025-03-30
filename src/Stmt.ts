import { Expr } from 'src/Expr';
import { Token } from 'src/Token';

export type Stmt = ExpressionStmt | IfStmt | PrintStmt | VarStmt | BlockStmt;

export interface ExpressionStmt {
  type: 'expression';
  expression: Expr;
}

export interface IfStmt {
  type: 'if';
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt | null;
}

export interface PrintStmt {
  type: 'print';
  expression: Expr;
}

export interface VarStmt {
  type: 'var';
  name: Token;
  initializer: Expr;
}

export interface BlockStmt {
  type: 'block';
  statements: Stmt[];
}

export function createExpression(expression: Expr): ExpressionStmt {
  return {
    type: 'expression',
    expression,
  };
}

export function createIf(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null): IfStmt {
  return {
    type: 'if',
    condition,
    thenBranch,
    elseBranch,
  };
}

export function createPrint(expression: Expr): PrintStmt {
  return {
    type: 'print',
    expression,
  };
}

export function createVar(name: Token, initializer: Expr): VarStmt {
  return {
    type: 'var',
    name,
    initializer,
  };
}

export function createBlock(statements: Stmt[]): BlockStmt {
  return {
    type: 'block',
    statements,
  };
}

export type StmtMatcher<R> = {
  expression: (e: ExpressionStmt) => R;
  if: (i: IfStmt) => R;
  print: (p: PrintStmt) => R;
  var: (v: VarStmt) => R;
  block: (b: BlockStmt) => R;
};

export function matchStmt<R>(stmt: Stmt, matcher: StmtMatcher<R>): R {
  switch (stmt.type) {
    case 'expression':
      return matcher.expression(stmt as ExpressionStmt);
    case 'if':
      return matcher.if(stmt as IfStmt);
    case 'print':
      return matcher.print(stmt as PrintStmt);
    case 'var':
      return matcher.var(stmt as VarStmt);
    case 'block':
      return matcher.block(stmt as BlockStmt);
  }
}
