import { Token } from 'src/Token';
import { TokenType } from 'src/TokenType';
import { Lox } from 'src/index';

export class Scanner {
  private static readonly keywords = new Map<string, TokenType>([
    ['and', 'AND'],
    ['class', 'CLASS'],
    ['else', 'ELSE'],
    ['false', 'FALSE'],
    ['for', 'FOR'],
    ['fun', 'FUN'],
    ['if', 'IF'],
    ['nil', 'NIL'],
    ['or', 'OR'],
    ['print', 'PRINT'],
    ['return', 'RETURN'],
    ['super', 'SUPER'],
    ['this', 'THIS'],
    ['true', 'TRUE'],
    ['var', 'VAR'],
    ['while', 'WHILE'],
  ]);

  constructor(
    private source: string,
    private tokens: Token[] = [],
    private start: number = 0,
    private current: number = 0,
    private line: number = 1,
  ) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token('EOF', '', null, this.line));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    const c = this.advance();

    switch (c) {
      case '(':
        this.addToken('LEFT_PAREN');
        break;
      case ')':
        this.addToken('RIGHT_PAREN');
        break;
      case '{':
        this.addToken('LEFT_BRACE');
        break;
      case '}':
        this.addToken('RIGHT_BRACE');
        break;
      case ',':
        this.addToken('COMMA');
        break;
      case '.':
        this.addToken('DOT');
        break;
      case '-':
        this.addToken('MINUS');
        break;
      case '+':
        this.addToken('PLUS');
        break;
      case ';':
        this.addToken('SEMICOLON');
        break;
      case '*':
        this.addToken('STAR');
        break;
      case '!':
        this.addToken(this.match('=') ? 'BANG_EQUAL' : 'BANG');
        break;
      case '=':
        this.addToken(this.match('=') ? 'EQUAL_EQUAL' : 'EQUAL');
        break;
      case '<':
        this.addToken(this.match('=') ? 'LESS_EQUAL' : 'LESS');
        break;
      case '>':
        this.addToken(this.match('=') ? 'GREATER_EQUAL' : 'GREATER');
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken('SLASH');
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        // ignore whitespace
        break;
      case '\n':
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Lox.error(this.line, 'Unexpected character.');
        }
        break;
    }
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return '\0';
    }

    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }

    return this.source.charAt(this.current + 1);
  }

  private addToken(type: TokenType, literal: unknown = null): void {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, 'Unterminated string.');
      return;
    }

    this.advance();

    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken('STRING', value);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // consume the .
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken('NUMBER', Number(this.source.slice(this.start, this.current)));
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.slice(this.start, this.current);
    let type = Scanner.keywords.get(text);

    if (type == null) {
      type = 'IDENTIFIER';
    }

    this.addToken(type);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
