import { Stmt, StmtVisitor } from 'src/Stmt';
import { ExprVisitor } from 'src/Expr';
import { Environment } from 'src/Environment';

export interface IInterpreter extends ExprVisitor<unknown>, StmtVisitor<void> {
  globals: Environment;
  environment: Environment;
  interpret(statements: Stmt[]): void;
  executeBlock(statements: Stmt[], environment: Environment): void;
}
