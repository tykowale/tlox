import { Token } from 'src/Token';
import { Expr, createBinary, createGrouping, createLiteral, createUnary } from 'src/Expr';
import { TokenType } from 'src/TokenType';
import { Lox } from 'src/index';
import { ParseError } from 'src/Errors';
import { createExpression, createPrint, Stmt } from 'src/Stmt';

export class Parser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  public parse(): Stmt[] {
    const statements = [];

    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }

    return statements;
  }

  // statement → exprStmt | printStmt ;
  private statement(): Stmt {
    if (this.match('PRINT')) {
      return this.printStatement();
    }

    return this.expressionStatement();
  }

  // expression → equality ;
  private expression(): Expr {
    return this.equality();
  }

  //equality → comparison ( ( "!=" | "==" ) comparison )* ;
  private equality(): Expr {
    let expr = this.comparison();

    while (this.match('BANG_EQUAL', 'EQUAL_EQUAL')) {
      const operator = this.previous();
      const right = this.comparison();

      expr = createBinary(expr, operator, right);
    }

    return expr;
  }

  // comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
  private comparison(): Expr {
    let expr = this.term();

    while (this.match('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL')) {
      const operator = this.previous();
      const right = this.term();

      expr = createBinary(expr, operator, right);
    }

    return expr;
  }

  // term → factor ( ( "-" | "+" ) factor )* ;
  private term(): Expr {
    let expr = this.factor();

    while (this.match('MINUS', 'PLUS')) {
      const operator = this.previous();
      const right = this.factor();

      expr = createBinary(expr, operator, right);
    }

    return expr;
  }

  // factor → unary ( ( "/" | "*" ) unary )* ;
  private factor(): Expr {
    let expr = this.unary();

    while (this.match('SLASH', 'STAR')) {
      const operator = this.previous();
      const right = this.unary();

      expr = createBinary(expr, operator, right);
    }

    return expr;
  }

  // unary → ( "!" | "-" ) unary | primary ;
  private unary(): Expr {
    if (this.match('BANG', 'MINUS')) {
      const operator = this.previous();
      const right = this.unary();

      return createUnary(operator, right);
    }

    return this.primary();
  }

  // primary → NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" ;
  private primary(): Expr {
    if (this.match('FALSE')) {
      return createLiteral(false);
    }

    if (this.match('TRUE')) {
      return createLiteral(true);
    }

    if (this.match('NIL')) {
      return createLiteral(null);
    }
    if (this.match('NUMBER', 'STRING')) {
      return createLiteral(this.previous().literal);
    }

    if (this.match('LEFT_PAREN')) {
      const expr = this.expression();
      this.consume('RIGHT_PAREN', 'Expect ")" after expression.');

      return createGrouping(expr);
    }

    throw this.error(this.peek(), 'Expect expression.');
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParseError {
    Lox.tokenError(token, message);
    return new ParseError(message);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }

    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private printStatement(): Stmt {
    const value = this.expression();
    this.consume('SEMICOLON', 'Expect ";" after value.');

    return createPrint(value);
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume('SEMICOLON', 'Expect ";" after expression.');

    return createExpression(expr);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === 'SEMICOLON') {
        return;
      }

      switch (this.peek().type) {
        case 'CLASS':
        case 'FUN':
        case 'VAR':
        case 'FOR':
        case 'IF':
        case 'WHILE':
        case 'PRINT':
        case 'RETURN':
          return;
      }

      this.advance();
    }
  }
}
