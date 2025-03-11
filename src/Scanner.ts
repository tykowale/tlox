import { Token } from 'src/Token';
import { TokenType } from 'src/TokenType';
import { Lox } from 'src/index';

export class Scanner {
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
        Lox.error(this.line, 'Unexpected character.');
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
}
