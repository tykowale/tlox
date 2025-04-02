import type { IInterpreter } from 'src/types';
import type { LoxCallable } from 'src/LoxCallable';

export class Clock implements LoxCallable {
  arity: number = 0;

  call(_interpreter: IInterpreter, _args: unknown[]): unknown {
    return Date.now();
  }
}
