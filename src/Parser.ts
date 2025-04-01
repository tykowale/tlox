import { Token } from 'src/Token';
import { Expr, Assign, Binary, Call, Grouping, Literal, Logical, Unary, Variable } from 'src/Expr';
import { TokenType } from 'src/TokenType';
import { Lox } from 'src/index';
import { ParseError } from 'src/Errors';
import { Block, Expression, If, Print, Stmt, Var, While } from 'src/Stmt';

export class Parser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  public parse(): Stmt[] {
    const statements = [];

    while (!this.isAtEnd()) {
      const stmt = this.declaration();

      if (stmt != null) {
        statements.push(stmt);
      }
    }

    return statements;
  }

  // declaration → varDecl | statement ;
  private declaration(): Stmt | null {
    try {
      if (this.match('VAR')) {
        return this.varDeclaration();
      }

      return this.statement();
    } catch (error) {
      if (error instanceof ParseError) {
        this.synchronize();
        return null;
      }

      throw error;
    }
  }

  // varDecl → "var" IDENTIFIER ( "=" expression )? ";" ;
  private varDeclaration(): Stmt {
    const name = this.consume('IDENTIFIER', 'Expect variable name.');

    let initializer: Expr = new Literal(null);

    if (this.match('EQUAL')) {
      initializer = this.expression();
    }

    this.consume('SEMICOLON', 'Expect ";" after variable declaration.');
    return new Var(name, initializer);
  }

  // statement → exprStmt | forStmt | ifStmt | printStmt | whileStmt | block;
  private statement(): Stmt {
    if (this.match('FOR')) {
      return this.forStatement();
    }

    if (this.match('IF')) {
      return this.ifStatement();
    }

    if (this.match('PRINT')) {
      return this.printStatement();
    }

    if (this.match('WHILE')) {
      return this.whileStatement();
    }

    if (this.match('LEFT_BRACE')) {
      return new Block(this.block());
    }

    return this.expressionStatement();
  }

  // forStmt → "for" "(" ( varDecl | exprStmt | ";" ) expression? ";" expression? ")" statement ;
  private forStatement(): Stmt {
    this.consume('LEFT_PAREN', "Expect '(' after 'for'.");

    let initializer: Stmt | null = null;
    if (this.match('SEMICOLON')) {
      initializer = null;
    } else if (this.match('VAR')) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr | null = null;
    if (!this.check('SEMICOLON')) {
      condition = this.expression();
    }

    this.consume('SEMICOLON', 'Expect ";" after loop condition.');

    let increment: Expr | null = null;
    if (!this.check('RIGHT_PAREN')) {
      increment = this.expression();
    }

    this.consume('RIGHT_PAREN', 'Expect ")" after for clauses.');

    let body = this.statement();

    if (increment != null) {
      body = new Block([body, new Expression(increment)]);
    }

    if (condition == null) {
      condition = new Literal(true);
    }

    body = new While(condition, body);

    if (initializer != null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  // whileStmt → "while" "(" expression ")" statement ;
  private whileStatement(): Stmt {
    this.consume('LEFT_PAREN', 'Expect "(" after "while".');
    const condition = this.expression();
    this.consume('RIGHT_PAREN', 'Expect ")" after condition.');

    const body = this.statement();

    return new While(condition, body);
  }

  // ifStmt → "if" "(" expression ")" statement ( "else" statement )? ;
  private ifStatement(): Stmt {
    this.consume('LEFT_PAREN', 'Expect "(" after "if".');
    const condition = this.expression();
    this.consume('RIGHT_PAREN', 'Expect ")" after condition.');

    const thenBranch = this.statement();
    let elseBranch: Stmt | null = null;

    if (this.match('ELSE')) {
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }

  // expression → assignment ;
  private expression(): Expr {
    return this.assignment();
  }

  // assignment → IDENTIFIER "=" assignment | logicalOr ;
  private assignment(): Expr {
    const expr = this.logicalOr();

    if (this.match('EQUAL')) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const name = expr.name;
        return new Assign(name, value);
      }

      throw this.error(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  // logicalOr → logicalAnd ( "or" logicalAnd )* ;
  private logicalOr(): Expr {
    let expr = this.logicalAnd();

    while (this.match('OR')) {
      const operator = this.previous();
      const right = this.logicalAnd();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  // logicalAnd → equality ( "and" equality )* ;
  private logicalAnd(): Expr {
    let expr = this.equality();

    while (this.match('AND')) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  // equality → comparison ( ( "!=" | "==" ) comparison )* ;
  private equality(): Expr {
    let expr = this.comparison();

    while (this.match('BANG_EQUAL', 'EQUAL_EQUAL')) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // comparison → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
  private comparison(): Expr {
    let expr = this.term();

    while (this.match('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL')) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // term → factor ( ( "-" | "+" ) factor )* ;
  private term(): Expr {
    let expr = this.factor();

    while (this.match('MINUS', 'PLUS')) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // factor → unary ( ( "/" | "*" ) unary )* ;
  private factor(): Expr {
    let expr = this.unary();

    while (this.match('SLASH', 'STAR')) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // unary → ( "!" | "-" ) unary | call ;
  private unary(): Expr {
    if (this.match('BANG', 'MINUS')) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.call();
  }

  // call → primary ( "(" arguments? ")" )* ;
  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match('LEFT_PAREN')) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  // args → expression ( "," expression )* ;
  private finishCall(callee: Expr): Expr {
    const args: Expr[] = [];

    if (!this.check('RIGHT_PAREN')) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), 'Cannot have more than 255 arguments.');
        }
        args.push(this.expression());
      } while (this.match('COMMA'));
    }

    const paren = this.consume('RIGHT_PAREN', 'Expect ")" after arguments.');

    return new Call(callee, paren, args);
  }

  // primary → NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" | IDENTIFIER ;
  private primary(): Expr {
    if (this.match('FALSE')) {
      return new Literal(false);
    }

    if (this.match('TRUE')) {
      return new Literal(true);
    }

    if (this.match('NIL')) {
      return new Literal(null);
    }

    if (this.match('NUMBER', 'STRING')) {
      return new Literal(this.previous().literal);
    }

    if (this.match('IDENTIFIER')) {
      return new Variable(this.previous());
    }

    if (this.match('LEFT_PAREN')) {
      const expr = this.expression();
      this.consume('RIGHT_PAREN', 'Expect ")" after expression.');
      return new Grouping(expr);
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
    Lox.error(token, message);
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
    return new Print(value);
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume('SEMICOLON', 'Expect ";" after expression.');
    return new Expression(expr);
  }

  private block(): Stmt[] {
    const statements: Stmt[] = [];

    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
      const statement = this.declaration();
      if (statement != null) {
        statements.push(statement);
      }
    }

    this.consume('RIGHT_BRACE', 'Expect "}" after block.');
    return statements;
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
