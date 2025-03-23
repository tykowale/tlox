import { RuntimeError } from 'src/Errors';
import { Token } from 'src/Token';

// false and null/undefined are falsy, everything else is truthy
export function isTruthy(obj: unknown): boolean {
  if (obj == null) {
    return false;
  }

  if (typeof obj === 'boolean') {
    return obj;
  }

  return true;
}

export function checkNumberOperand(operator: Token, operand: unknown): asserts operand is number {
  if (typeof operand === 'number') {
    return;
  }

  throw new RuntimeError(operator, 'Operand must be a number.');
}
