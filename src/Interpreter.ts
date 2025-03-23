import { Expr, ExprMatcher, matchExpr } from 'src/Expr';
import { RuntimeError } from 'src/Errors';
import { isTruthy, checkNumberOperand } from 'src/RuntimeChecks';

export function interpret(expr: Expr): unknown {
  try {
    const value = matchExpr(expr, interpreter);
    console.log(value);
    return value;
  } catch (error) {
    if (error instanceof RuntimeError) {
      console.error(error.message);
    }
  }
}

function evaluate(expr: Expr): unknown {
  return matchExpr(expr, interpreter);
}

const interpreter: ExprMatcher<unknown> = {
  literal: expr => expr.value,
  grouping: expr => evaluate(expr.expression),
  unary: expr => {
    const right = evaluate(expr.right);

    switch (expr.operator.type) {
      case 'MINUS':
        checkNumberOperand(expr.operator, right);
        return -right;
      case 'BANG':
        return !isTruthy(right);
    }

    // unreachable
    return null;
  },
  binary: expr => {
    const left = evaluate(expr.left);
    const right = evaluate(expr.right);

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
        break;
      case 'SLASH':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return (left as number) / (right as number);
      case 'STAR':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return (left as number) * (right as number);
      case 'GREATER':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return (left as number) > (right as number);
      case 'GREATER_EQUAL':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return (left as number) >= (right as number);
      case 'LESS':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return (left as number) < (right as number);
      case 'LESS_EQUAL':
        checkNumberOperand(expr.operator, left);
        checkNumberOperand(expr.operator, right);
        return (left as number) <= (right as number);
      case 'BANG_EQUAL':
        return left !== right;
      case 'EQUAL_EQUAL':
        return left === right;
    }

    // unreachable
    return null;
  },
};
