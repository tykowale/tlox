import type { Interpreter } from 'src/Interpreter';

export interface LoxCallable {
  __type: 'LoxCallable';
  arity: number;
  call(interpreter: Interpreter, args: unknown[]): unknown;
}
