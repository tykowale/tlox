type SingleCharTokenType =
  | 'LEFT_PAREN'
  | 'RIGHT_PAREN'
  | 'LEFT_BRACE'
  | 'RIGHT_BRACE'
  | 'COMMA'
  | 'DOT'
  | 'MINUS'
  | 'PLUS'
  | 'SEMICOLON'
  | 'SLASH'
  | 'STAR';

type OneOrTwoCharTokenType =
  | 'BANG'
  | 'BANG_EQUAL'
  | 'EQUAL'
  | 'EQUAL_EQUAL'
  | 'GREATER'
  | 'GREATER_EQUAL'
  | 'LESS'
  | 'LESS_EQUAL';

type LiteralTokenType = 'IDENTIFIER' | 'STRING' | 'NUMBER';

type KeywordTokenType =
  | 'AND'
  | 'CLASS'
  | 'ELSE'
  | 'FALSE'
  | 'FUN'
  | 'FOR'
  | 'IF'
  | 'NIL'
  | 'OR'
  | 'PRINT'
  | 'RETURN'
  | 'SUPER'
  | 'THIS'
  | 'TRUE'
  | 'VAR'
  | 'WHILE';

export type TokenType =
  | SingleCharTokenType
  | OneOrTwoCharTokenType
  | LiteralTokenType
  | KeywordTokenType
  | 'EOF';
