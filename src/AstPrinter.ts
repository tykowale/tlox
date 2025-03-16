import { Expr, ExprMatcher, matchExpr } from 'src/Expr';

export function printAst(expr: Expr): string {
  return matchExpr(expr, astPrinterMatcher);
}

function parenthesize(name: string, ...exprs: Expr[]): string {
  let result = `(${name}`;

  for (const expr of exprs) {
    result += ` ${printAst(expr)}`;
  }

  result += ')';
  return result;
}

const astPrinterMatcher: ExprMatcher<string> = {
  binary: expr => parenthesize(expr.operator.lexeme, expr.left, expr.right),
  grouping: expr => parenthesize('group', expr.expression),
  literal: expr => String(expr.value),
  unary: expr => parenthesize(expr.operator.lexeme, expr.right),
};
