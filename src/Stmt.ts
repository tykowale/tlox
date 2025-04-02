import { Expr } from 'src/Expr';
import { Token } from 'src/Token';

export interface StmtVisitor<R> {
  visitBlockStmt(stmt: Block): R;
  visitExpressionStmt(stmt: Expression): R;
  visitLFunctionStmt(stmt: LFunction): R;
  visitIfStmt(stmt: If): R;
  visitPrintStmt(stmt: Print): R;
  visitReturnStmt(stmt: Return): R;
  visitVarStmt(stmt: Var): R;
  visitWhileStmt(stmt: While): R;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class Block extends Stmt {
  constructor(public readonly statements: Stmt[]) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
}

export class Expression extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}

export class LFunction extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly params: Token[],
    public readonly body: Stmt[],
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitLFunctionStmt(this);
  }
}

export class If extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly thenBranch: Stmt,
    public readonly elseBranch: Stmt | null,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}

export class Print extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}

export class Return extends Stmt {
  constructor(
    public readonly keyword: Token,
    public readonly value: Expr,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitReturnStmt(this);
  }
}

export class Var extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly initializer: Expr,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitVarStmt(this);
  }
}

export class While extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly body: Stmt,
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}
