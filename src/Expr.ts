import { Token } from 'src/Token';

abstract class Expr {}

class Binary extends Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {
    super();
  }
}
