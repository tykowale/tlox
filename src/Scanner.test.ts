import { Scanner } from 'src/Scanner';

describe('Scanner', () => {
  describe('single character tokens', () => {
    it('scans left parenthesis', () => {
      const scanner = new Scanner('(');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(2); // Including EOF
      expect(tokens[0].type).toBe('LEFT_PAREN');
    });

    it('scans multiple single character tokens', () => {
      const scanner = new Scanner('(){},.');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(7); // Including EOF
      expect(tokens.map(t => t.type)).toEqual([
        'LEFT_PAREN',
        'RIGHT_PAREN',
        'LEFT_BRACE',
        'RIGHT_BRACE',
        'COMMA',
        'DOT',
        'EOF',
      ]);
    });
  });

  describe('one or two character tokens', () => {
    it('scans bang and bang-equal', () => {
      const scanner = new Scanner('! !=');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(3); // Including EOF
      expect(tokens.map(t => t.type)).toEqual(['BANG', 'BANG_EQUAL', 'EOF']);
    });

    it('scans all comparison operators', () => {
      const scanner = new Scanner('< <= > >= = ==');
      const tokens = scanner.scanTokens();

      expect(tokens.map(t => t.type)).toEqual([
        'LESS',
        'LESS_EQUAL',
        'GREATER',
        'GREATER_EQUAL',
        'EQUAL',
        'EQUAL_EQUAL',
        'EOF',
      ]);
    });
  });

  describe('strings', () => {
    it('scans string literals', () => {
      const scanner = new Scanner('"hello world"');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(2); // Including EOF
      expect(tokens[0].type).toBe('STRING');
      expect(tokens[0].literal).toBe('hello world');
    });

    it('handles empty strings', () => {
      const scanner = new Scanner('""');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(2); // Including EOF
      expect(tokens[0].type).toBe('STRING');
      expect(tokens[0].literal).toBe('');
    });
  });

  describe('numbers', () => {
    it('scans integer literals', () => {
      const scanner = new Scanner('123');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(2); // Including EOF
      expect(tokens[0].type).toBe('NUMBER');
      expect(tokens[0].literal).toBe(123);
    });

    it('scans decimal literals', () => {
      const scanner = new Scanner('123.456');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(2); // Including EOF
      expect(tokens[0].type).toBe('NUMBER');
      expect(tokens[0].literal).toBe(123.456);
    });
  });

  describe('keywords and identifiers', () => {
    it('recognizes all keywords', () => {
      const source =
        'and class else false fun for if nil or print return super this true var while';
      const scanner = new Scanner(source);
      const tokens = scanner.scanTokens();

      const expectedTypes = [
        'AND',
        'CLASS',
        'ELSE',
        'FALSE',
        'FUN',
        'FOR',
        'IF',
        'NIL',
        'OR',
        'PRINT',
        'RETURN',
        'SUPER',
        'THIS',
        'TRUE',
        'VAR',
        'WHILE',
        'EOF',
      ];

      expect(tokens.map(t => t.type)).toEqual(expectedTypes);
    });

    it('scans identifiers', () => {
      const scanner = new Scanner('foo bar baz');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(4); // Including EOF
      expect(tokens.map(t => t.type)).toEqual(['IDENTIFIER', 'IDENTIFIER', 'IDENTIFIER', 'EOF']);
      expect(tokens.map(t => t.lexeme)).toEqual(['foo', 'bar', 'baz', '']);
    });

    it('allows keywords as parts of identifiers', () => {
      const scanner = new Scanner('ifelse classname');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(3); // Including EOF
      expect(tokens.map(t => t.type)).toEqual(['IDENTIFIER', 'IDENTIFIER', 'EOF']);
    });
  });

  describe('whitespace handling', () => {
    it('ignores whitespace', () => {
      const scanner = new Scanner('   \t\r\n  ');
      const tokens = scanner.scanTokens();

      expect(tokens).toHaveLength(1); // Just EOF
      expect(tokens[0].type).toBe('EOF');
    });

    it('preserves newlines in line counting', () => {
      const scanner = new Scanner('\n\n()\n');
      const tokens = scanner.scanTokens();

      expect(tokens[0].line).toBe(3); // First token on line 3
      expect(tokens[1].line).toBe(3); // Second token on line 3
    });
  });
});
