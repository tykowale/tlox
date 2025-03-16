import { Token } from 'src/Token';

export interface Expr {}

export class Binary implements Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: Token,
    public readonly right: Expr,
  ) {}
}

export class Grouping implements Expr {
  constructor(public readonly expression: Expr) {}
}

export class Literal implements Expr {
  constructor(public readonly value: unknown) {}
}

export class Unary implements Expr {
  constructor(
    public readonly operator: Token,
    public readonly right: Expr,
  ) {}
}
