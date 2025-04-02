import { Token } from 'src/Token';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export class RuntimeError extends Error {
  constructor(
    public readonly token: Token,
    message: string,
  ) {
    super(message);
    this.name = 'RuntimeError';
  }
}

export class ReturnError {
  constructor(public readonly value: unknown) {}
}
