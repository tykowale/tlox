import { RuntimeError } from 'src/Errors';
import { Token } from 'src/Token';

export class Environment {
  private enclosing: Environment | null;
  private values: Map<string, unknown>;

  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing;
    this.values = new Map();
  }

  define(name: string, value: unknown) {
    this.values.set(name, value);
  }

  get(name: Token): unknown {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing != null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: unknown): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
