import {
  Assign,
  Binary,
  Call,
  Expr,
  ExprVisitor,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from 'src/Expr';
import { RuntimeError } from 'src/Errors';
import { isTruthy, checkNumberOperand } from 'src/RuntimeChecks';
import { Block, Expression, If, Print, Stmt, StmtVisitor, Var, While } from 'src/Stmt';
import { Environment } from 'src/Environment';

// Forward declare to avoid circular dependency
interface LoxCallable {
  __type: 'LoxCallable';
  arity: number;
  // Using 'any' to avoid circular dependency with Interpreter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call(interpreter: any, args: unknown[]): unknown;
}

export class Interpreter implements ExprVisitor<unknown>, StmtVisitor<void> {
  private globals = new Environment();
  private environment = this.globals;

  constructor() {
    this.globals.define('clock', {
      __type: 'LoxCallable',
      arity: 0,
      call: () => Date.now(),
    });
  }

  interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        console.error(error.message);
      }
    }
  }

  visitLiteralExpr(expr: Literal): unknown {
    return expr.value;
  }

  visitGroupingExpr(expr: Grouping): unknown {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Unary): unknown {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case 'MINUS':
        checkNumberOperand(expr.operator, right);
        return -Number(right);
      case 'BANG':
        return !isTruthy(right);
    }

    // Unreachable
    return null;
  }

  visitBinaryExpr(expr: Binary): unknown {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case 'MINUS':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return Number(left) - Number(right);
      case 'PLUS':
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }

        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }

        throw new RuntimeError(
          expr.operator,
          'Operands must be two numbers or at least one string.',
        );
      case 'SLASH':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return Number(left) / Number(right);
      case 'STAR':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return Number(left) * Number(right);
      case 'GREATER':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return Number(left) > Number(right);
      case 'GREATER_EQUAL':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return Number(left) >= Number(right);
      case 'LESS':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return Number(left) < Number(right);
      case 'LESS_EQUAL':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return Number(left) <= Number(right);
      case 'BANG_EQUAL':
        return left !== right;
      case 'EQUAL_EQUAL':
        return left === right;
    }

    // Unreachable
    return null;
  }

  visitVariableExpr(expr: Variable): unknown {
    return this.environment.get(expr.name);
  }

  visitAssignExpr(expr: Assign): unknown {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitLogicalExpr(expr: Logical): unknown {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === 'OR') {
      if (isTruthy(left)) return left;
    } else {
      if (!isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitCallExpr(expr: Call): unknown {
    const callee = this.evaluate(expr.callee);

    const args: unknown[] = [];
    for (const argument of expr.args) {
      args.push(this.evaluate(argument));
    }

    if (!this.isCallable(callee)) {
      throw new RuntimeError(expr.paren, 'Can only call functions and classes.');
    }

    const loxCallable = callee as LoxCallable;

    if (args.length !== loxCallable.arity) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${loxCallable.arity} arguments but got ${args.length}.`,
      );
    }

    return loxCallable.call(this, args);
  }

  private isCallable(callee: unknown): callee is LoxCallable {
    return (
      typeof callee === 'object' &&
      callee !== null &&
      '__type' in callee &&
      (callee as any).__type === 'LoxCallable'
    );
  }

  visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(value);
  }

  visitVarStmt(stmt: Var): void {
    let value = null;
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitIfStmt(stmt: If): void {
    if (isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
  }

  visitWhileStmt(stmt: While): void {
    while (isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  private evaluate(expr: Expr): unknown {
    return expr.accept(this);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  executeBlock(statements: Stmt[], environment: Environment): void {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }
}

// Create and export a singleton instance
const interpreter = new Interpreter();
export { interpreter };

// Export a function to match the previous API
export function interpret(statements: Stmt[]): void {
  interpreter.interpret(statements);
}
