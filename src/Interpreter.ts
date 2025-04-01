import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprMatcher,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  UnaryExpr,
  VariableExpr,
  matchExpr,
} from 'src/Expr';
import { RuntimeError } from 'src/Errors';
import { isTruthy, checkNumberOperand } from 'src/RuntimeChecks';
import {
  StmtMatcher,
  Stmt,
  matchStmt,
  ExpressionStmt,
  BlockStmt,
  PrintStmt,
  VarStmt,
  IfStmt,
  WhileStmt,
} from 'src/Stmt';
import { Environment } from 'src/Environment';
import { LoxCallable } from './LoxCallable';

const globalEnvironment = new Environment();
globalEnvironment.define('clock', {
  __type: 'LoxCallable',
  arity: 0,
  call: () => Date.now(),
});

export type Interpreter = (statements: Stmt[]) => void;

export function interpret(statements: Stmt[]): void {
  try {
    for (const stmt of statements) {
      executeStmt(stmt, globalEnvironment);
    }
  } catch (error) {
    if (error instanceof RuntimeError) {
      console.error(error.message);
    }
  }
}

function isExpr(node: Expr | Stmt): node is Expr {
  return ['binary', 'grouping', 'literal', 'unary', 'variable', 'assign'].includes(node.type);
}

export function evaluate(node: Expr | Stmt, env: Environment = globalEnvironment): unknown {
  if (isExpr(node)) {
    return evaluateExpr(node, env);
  } else {
    return executeStmt(node, env);
  }
}

function evaluateExpr(expr: Expr, env: Environment): unknown {
  return matchExpr(expr, createExprInterpreter(env));
}

function executeStmt(stmt: Stmt, env: Environment): unknown {
  return matchStmt(stmt, createStmtInterpreter(env));
}

// Expression evaluation functions
function literalExpr(expr: LiteralExpr): unknown {
  return expr.value;
}

function groupingExpr(expr: GroupingExpr, env: Environment): unknown {
  return evaluateExpr(expr.expression, env);
}

function unaryExpr(expr: UnaryExpr, env: Environment): unknown {
  const right = evaluateExpr(expr.right, env);

  switch (expr.operator.type) {
    case 'MINUS':
      checkNumberOperand(expr.operator, right);
      return -right;
    case 'BANG':
      return !isTruthy(right);
  }

  throw new Error(`Unexpected unary operator: ${expr.operator.type}`);
}

function binaryExpr(expr: BinaryExpr, env: Environment): unknown {
  const left = evaluateExpr(expr.left, env);
  const right = evaluateExpr(expr.right, env);

  switch (expr.operator.type) {
    case 'MINUS':
      checkNumberOperand(expr.operator, left);
      checkNumberOperand(expr.operator, right);
      return left - right;
    case 'PLUS':
      if (typeof left === 'number' && typeof right === 'number') {
        return left + right;
      }

      if (typeof left === 'string' || typeof right === 'string') {
        return String(left) + String(right);
      }

      throw new RuntimeError(expr.operator, 'Operands must be two numbers or at least one string.');
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

  throw new Error(`Unexpected binary operator: ${expr.operator.type}`);
}

function variableExpr(expr: VariableExpr, env: Environment): unknown {
  return env.get(expr.name);
}

function assignExpr(expr: AssignExpr, env: Environment): unknown {
  const value = evaluateExpr(expr.value, env);
  env.assign(expr.name, value);
  return value;
}

function logicalExpr(expr: LogicalExpr, env: Environment): unknown {
  const left = evaluateExpr(expr.left, env);

  if (expr.operator.type === 'OR') {
    if (isTruthy(left)) {
      return left;
    }
  } else {
    if (!isTruthy(left)) {
      return left;
    }
  }

  return evaluateExpr(expr.right, env);
}

function callExpr(expr: CallExpr, env: Environment): unknown {
  const callee = evaluateExpr(expr.callee, env);

  const args = expr.args.map(arg => evaluateExpr(arg, env));

  const loxCallable = callee as unknown as LoxCallable;

  if (args.length !== loxCallable.arity) {
    throw new RuntimeError(
      expr.paren,
      `Expected ${loxCallable.arity} arguments but got ${args.length}.`,
    );
  }

  return loxCallable.call(interpret, args);
}

// Statement execution functions
function executeExpressionStmt(stmt: ExpressionStmt, env: Environment): unknown {
  return evaluateExpr(stmt.expression, env);
}

function executePrintStmt(stmt: PrintStmt, env: Environment): unknown {
  const value = evaluateExpr(stmt.expression, env);
  console.log(value);
  return null;
}

function executeVarStmt(stmt: VarStmt, env: Environment): unknown {
  const value = evaluateExpr(stmt.initializer, env);
  env.define(stmt.name.lexeme, value);
  return null;
}

function executeBlockStmt(stmt: BlockStmt, env: Environment): unknown {
  const blockEnv = new Environment(env);

  for (const statement of stmt.statements) {
    executeStmt(statement, blockEnv);
  }

  return null;
}

function executeWhileStmt(stmt: WhileStmt, env: Environment): unknown {
  while (isTruthy(evaluateExpr(stmt.condition, env))) {
    executeStmt(stmt.body, env);
  }

  return null;
}

function executeIfStmt(stmt: IfStmt, env: Environment): unknown {
  if (isTruthy(evaluateExpr(stmt.condition, env))) {
    executeStmt(stmt.thenBranch, env);
  } else if (stmt.elseBranch != null) {
    executeStmt(stmt.elseBranch, env);
  }

  return null;
}

function createExprInterpreter(env: Environment): ExprMatcher<unknown> {
  return {
    literal: expr => literalExpr(expr),
    grouping: expr => groupingExpr(expr, env),
    unary: expr => unaryExpr(expr, env),
    binary: expr => binaryExpr(expr, env),
    variable: expr => variableExpr(expr, env),
    assign: expr => assignExpr(expr, env),
    logical: expr => logicalExpr(expr, env),
    call: expr => callExpr(expr, env),
  };
}

function createStmtInterpreter(env: Environment): StmtMatcher<unknown> {
  return {
    expression: stmt => executeExpressionStmt(stmt, env),
    print: stmt => executePrintStmt(stmt, env),
    var: stmt => executeVarStmt(stmt, env),
    block: stmt => executeBlockStmt(stmt, env),
    if: stmt => executeIfStmt(stmt, env),
    while: stmt => executeWhileStmt(stmt, env),
  };
}
