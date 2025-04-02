import { LoxCallable } from 'src/LoxCallable';
import { Environment } from 'src/Environment';
import { LFunction } from 'src/Stmt';
import type { IInterpreter } from 'src/types';
import { ReturnError } from 'src/Errors';

export class LoxFunction implements LoxCallable {
  constructor(private readonly declaration: LFunction) {}

  get arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: IInterpreter, args: unknown[]): unknown {
    const environment = new Environment(interpreter.globals);

    this.declaration.params.forEach((param, index) => {
      environment.define(param.lexeme, args[index]);
    });

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (error) {
      if (error instanceof ReturnError) {
        return error.value;
      }

      throw error;
    }

    return null;
  }
}
