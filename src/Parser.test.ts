import { Parser } from 'src/Parser';
import { Scanner } from 'src/Scanner';
import { Expr, BinaryExpr, GroupingExpr, LiteralExpr, UnaryExpr } from 'src/Expr';
import { printAst } from 'src/AstPrinter';
import { ExpressionStmt } from 'src/Stmt';

function parseExpression(source: string): Expr {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse();

  if (statements.length !== 1) {
    throw new Error('Expected a single expression statement');
  }

  const stmt = statements[0];
  if (stmt.type !== 'expression') {
    throw new Error('Expected an expression statement');
  }

  return (stmt as ExpressionStmt).expression;
}

describe('Parser', () => {
  describe('literal expressions', () => {
    it('parses number literals', () => {
      const expr = parseExpression('42;');
      expect(expr.type).toBe('literal');
      expect((expr as LiteralExpr).value).toBe(42);
    });

    it('parses string literals', () => {
      const expr = parseExpression('"hello";');
      expect(expr.type).toBe('literal');
      expect((expr as LiteralExpr).value).toBe('hello');
    });

    it('parses boolean literals', () => {
      const trueExpr = parseExpression('true;');
      expect(trueExpr.type).toBe('literal');
      expect((trueExpr as LiteralExpr).value).toBe(true);

      const falseExpr = parseExpression('false;');
      expect(falseExpr.type).toBe('literal');
      expect((falseExpr as LiteralExpr).value).toBe(false);
    });

    it('parses nil literal', () => {
      const expr = parseExpression('nil;');
      expect(expr.type).toBe('literal');
      expect((expr as LiteralExpr).value).toBe(null);
    });
  });

  describe('grouping expressions', () => {
    it('parses parenthesized expressions', () => {
      const expr = parseExpression('(42);');
      expect(expr.type).toBe('grouping');

      const innerExpr = (expr as GroupingExpr).expression;
      expect(innerExpr.type).toBe('literal');
      expect((innerExpr as LiteralExpr).value).toBe(42);
    });

    it('parses nested parenthesized expressions', () => {
      const expr = parseExpression('((42));');
      expect(expr.type).toBe('grouping');

      const innerExpr = (expr as GroupingExpr).expression;
      expect(innerExpr.type).toBe('grouping');

      const innerInnerExpr = (innerExpr as GroupingExpr).expression;
      expect(innerInnerExpr.type).toBe('literal');
      expect((innerInnerExpr as LiteralExpr).value).toBe(42);
    });
  });

  describe('unary expressions', () => {
    it('parses negation expressions', () => {
      const expr = parseExpression('-42;');
      expect(expr.type).toBe('unary');

      const unaryExpr = expr as UnaryExpr;
      expect(unaryExpr.operator.lexeme).toBe('-');
      expect(unaryExpr.right.type).toBe('literal');
      expect((unaryExpr.right as LiteralExpr).value).toBe(42);
    });

    it('parses not expressions', () => {
      const expr = parseExpression('!true;');
      expect(expr.type).toBe('unary');

      const unaryExpr = expr as UnaryExpr;
      expect(unaryExpr.operator.lexeme).toBe('!');
      expect(unaryExpr.right.type).toBe('literal');
      expect((unaryExpr.right as LiteralExpr).value).toBe(true);
    });

    it('parses chained unary expressions', () => {
      const expr = parseExpression('!!true;');
      expect(expr.type).toBe('unary');

      const outerUnary = expr as UnaryExpr;
      expect(outerUnary.operator.lexeme).toBe('!');

      const innerUnary = outerUnary.right as UnaryExpr;
      expect(innerUnary.type).toBe('unary');
      expect(innerUnary.operator.lexeme).toBe('!');

      const literal = innerUnary.right as LiteralExpr;
      expect(literal.type).toBe('literal');
      expect(literal.value).toBe(true);
    });
  });

  describe('binary expressions', () => {
    it('parses addition expressions', () => {
      const expr = parseExpression('1 + 2;');
      expect(expr.type).toBe('binary');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('+');
      expect(binaryExpr.left.type).toBe('literal');
      expect((binaryExpr.left as LiteralExpr).value).toBe(1);
      expect(binaryExpr.right.type).toBe('literal');
      expect((binaryExpr.right as LiteralExpr).value).toBe(2);
    });

    it('parses subtraction expressions', () => {
      const expr = parseExpression('5 - 3;');
      expect(expr.type).toBe('binary');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('-');
      expect((binaryExpr.left as LiteralExpr).value).toBe(5);
      expect((binaryExpr.right as LiteralExpr).value).toBe(3);
    });

    it('parses multiplication expressions', () => {
      const expr = parseExpression('2 * 3;');
      expect(expr.type).toBe('binary');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('*');
      expect((binaryExpr.left as LiteralExpr).value).toBe(2);
      expect((binaryExpr.right as LiteralExpr).value).toBe(3);
    });

    it('parses division expressions', () => {
      const expr = parseExpression('10 / 2;');
      expect(expr.type).toBe('binary');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('/');
      expect((binaryExpr.left as LiteralExpr).value).toBe(10);
      expect((binaryExpr.right as LiteralExpr).value).toBe(2);
    });

    it('parses comparison expressions', () => {
      const expr = parseExpression('3 > 2;');
      expect(expr.type).toBe('binary');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('>');
      expect((binaryExpr.left as LiteralExpr).value).toBe(3);
      expect((binaryExpr.right as LiteralExpr).value).toBe(2);
    });

    it('parses equality expressions', () => {
      const expr = parseExpression('1 == 1;');
      expect(expr.type).toBe('binary');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('==');
      expect((binaryExpr.left as LiteralExpr).value).toBe(1);
      expect((binaryExpr.right as LiteralExpr).value).toBe(1);
    });
  });

  describe('operator precedence', () => {
    it('respects multiplication precedence over addition', () => {
      const expr = parseExpression('1 + 2 * 3;');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('+');
      expect((binaryExpr.left as LiteralExpr).value).toBe(1);

      const rightExpr = binaryExpr.right as BinaryExpr;
      expect(rightExpr.type).toBe('binary');
      expect(rightExpr.operator.lexeme).toBe('*');
      expect((rightExpr.left as LiteralExpr).value).toBe(2);
      expect((rightExpr.right as LiteralExpr).value).toBe(3);
    });

    it('respects parentheses over operator precedence', () => {
      const expr = parseExpression('(1 + 2) * 3;');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('*');

      const leftExpr = binaryExpr.left as GroupingExpr;
      expect(leftExpr.type).toBe('grouping');

      const groupContents = leftExpr.expression as BinaryExpr;
      expect(groupContents.operator.lexeme).toBe('+');
      expect((groupContents.left as LiteralExpr).value).toBe(1);
      expect((groupContents.right as LiteralExpr).value).toBe(2);

      expect((binaryExpr.right as LiteralExpr).value).toBe(3);
    });

    it('respects comparison precedence over equality', () => {
      const expr = parseExpression('1 == 2 < 3;');

      const binaryExpr = expr as BinaryExpr;
      expect(binaryExpr.operator.lexeme).toBe('==');
      expect((binaryExpr.left as LiteralExpr).value).toBe(1);

      const rightExpr = binaryExpr.right as BinaryExpr;
      expect(rightExpr.type).toBe('binary');
      expect(rightExpr.operator.lexeme).toBe('<');
      expect((rightExpr.left as LiteralExpr).value).toBe(2);
      expect((rightExpr.right as LiteralExpr).value).toBe(3);
    });
  });

  describe('complex expressions', () => {
    it('parses complex mathematical expressions', () => {
      const expr = parseExpression('1 + 2 * 3 - 4 / -2;');

      const ast = printAst(expr);
      expect(ast).toBe('(- (+ 1 (* 2 3)) (/ 4 (- 2)))');
    });

    it('parses complex logical expressions', () => {
      const expr = parseExpression('!(true == false) != (5 >= 4);');

      const ast = printAst(expr);
      expect(ast).toBe('(!= (! (group (== true false))) (group (>= 5 4)))');
    });
  });
});
