import { Binary, Expr, Grouping, Literal, Unary, Visitor } from 'src/Expr';

export class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, [expr.left, expr.right]);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize('group', [expr.expression]);
  }

  visitLiteralExpr(expr: Literal): string {
    return this.stringify(expr.value);
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, [expr.right]);
  }

  private parenthesize(name: string, exprs: Expr[]): string {
    const builder = [];
    builder.push(`(${name}`);

    for (const expr of exprs) {
      builder.push(` ${expr.accept(this)}`);
    }

    builder.push(')');
    return builder.join('');
  }

  private stringify(value: unknown): string {
    if (value === null || value === undefined) {
      return 'nil';
    }

    if (typeof value === 'string') {
      return `"${value}"`;
    }

    if (Array.isArray(value)) {
      const items = value.map(item => this.stringify(item)).join(', ');
      return `[${items}]`;
    }

    if (typeof value === 'object' && value.constructor === Object) {
      try {
        const entries = Object.entries(value).map(([k, v]) => `${k}: ${this.stringify(v)}`);
        return `{${entries.join(', ')}}`;
      } catch (e) {
        return '[object Object]';
      }
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }
}
