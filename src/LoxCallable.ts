import type { IInterpreter } from 'src/types';

export interface LoxCallable {
  arity: number;
  call(interpreter: IInterpreter, args: unknown[]): unknown;
}

export function isLoxCallable(value: unknown): value is LoxCallable {
  return (
    typeof value === 'object' &&
    value !== null &&
    'arity' in value &&
    'call' in value &&
    typeof (value as any).call === 'function'
  );
}
