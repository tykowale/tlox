import { Stmt } from 'src/Stmt';

export interface LoxCallable {
  __type: 'LoxCallable';
  arity: number;
  call(interpreter: (statements: Stmt[]) => void, args: unknown[]): unknown;
}
