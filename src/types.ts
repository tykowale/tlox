import { Stmt, StmtVisitor } from 'src/Stmt';
import { ExprVisitor } from 'src/Expr';

export interface IInterpreter extends ExprVisitor<unknown>, StmtVisitor<void> {
  interpret(statements: Stmt[]): void;
}
