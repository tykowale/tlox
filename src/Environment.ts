import { RuntimeError } from 'src/Errors';
import { Token } from 'src/Token';

export class Environment {
  private values: Map<string, unknown>;

  constructor() {
    this.values = new Map();
  }

  define(name: string, value: unknown) {
    this.values.set(name, value);
  }

  get(name: Token): unknown {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
