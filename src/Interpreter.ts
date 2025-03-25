import { Expr, ExprMatcher, matchExpr } from 'src/Expr';
import { RuntimeError } from 'src/Errors';
import { isTruthy, checkNumberOperand } from 'src/RuntimeChecks';
import { StmtMatcher, Stmt, matchStmt } from 'src/Stmt';
import { Environment } from 'src/Environment';

const environment = new Environment();

export function interpret(statements: Stmt[]): void {
  try {
    for (const stmt of statements) {
      executeStmt(stmt);
    }
  } catch (error) {
    if (error instanceof RuntimeError) {
      console.error(error.message);
    }
  }
}

function isExpr(node: Expr | Stmt): node is Expr {
  return ['binary', 'grouping', 'literal', 'unary'].includes(node.type);
}

export function evaluate(node: Expr | Stmt): unknown {
  if (isExpr(node)) {
    return evaluateExpr(node);
  } else {
    return executeStmt(node);
  }
}

function evaluateExpr(expr: Expr): unknown {
  return matchExpr(expr, exprInterpreter);
}

function executeStmt(stmt: Stmt): unknown {
  return matchStmt(stmt, stmtInterpreter);
}

function literalExpr(expr: Expr & { type: 'literal' }): unknown {
  return expr.value;
}

function groupingExpr(expr: Expr & { type: 'grouping' }): unknown {
  return evaluateExpr(expr.expression);
}

function unaryExpr(expr: Expr & { type: 'unary' }): unknown {
  const right = evaluateExpr(expr.right);

  switch (expr.operator.type) {
    case 'MINUS':
      checkNumberOperand(expr.operator, right);
      return -right;
    case 'BANG':
      return !isTruthy(right);
  }

  // unreachable
  throw new Error(`Unexpected unary operator: ${expr.operator.type}`);
}

function binaryExpr(expr: Expr & { type: 'binary' }): unknown {
  const left = evaluateExpr(expr.left);
  const right = evaluateExpr(expr.right);

  switch (expr.operator.type) {
    case 'MINUS':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left - right;
    case 'PLUS':
      if (typeof left === 'number' && typeof right === 'number') {
        return left + right;
      }

      if (typeof left === 'string' && typeof right === 'string') {
        return left + right;
      }

      throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings.');
    case 'SLASH':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left / right;
    case 'STAR':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left * right;
    case 'GREATER':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left > right;
    case 'GREATER_EQUAL':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left >= right;
    case 'LESS':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left < right;
    case 'LESS_EQUAL':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left <= right;
    case 'BANG_EQUAL':
      return left !== right;
    case 'EQUAL_EQUAL':
      return left === right;
  }

  // unreachable
  throw new Error(`Unexpected binary operator: ${expr.operator.type}`);
}

function variableExpr(expr: Expr & { type: 'variable' }): unknown {
  return environment.get(expr.name);
}

function executeExpressionStmt(stmt: Stmt & { type: 'expression' }): unknown {
  return evaluateExpr(stmt.expression);
}

function executePrintStmt(stmt: Stmt & { type: 'print' }): unknown {
  const value = evaluateExpr(stmt.expression);
  console.log(value);
  return null;
}

function executeVarStmt(stmt: Stmt & { type: 'var' }): unknown {
  let value = null;

  if (stmt.initializer != null) {
    value = evaluateExpr(stmt.initializer);
  }

  environment.define(stmt.name.lexeme, value);
  return null;
}

const exprInterpreter: ExprMatcher<unknown> = {
  literal: literalExpr,
  grouping: groupingExpr,
  unary: unaryExpr,
  binary: binaryExpr,
  variable: variableExpr,
};

const stmtInterpreter: StmtMatcher<unknown> = {
  expression: executeExpressionStmt,
  print: executePrintStmt,
  var: executeVarStmt,
};
