# TLox - TypeScript Lox Interpreter

A TypeScript implementation of the Lox programming language from the book [Crafting Interpreters](https://craftinginterpreters.com/) by Robert Nystrom. This implementation follows a mixed OOP and FP approach rather than the pure object-oriented approach used in the book.

## Running the Interpreter

TLox supports two modes: interactive mode (REPL) and file execution.

### Interactive Mode (REPL)

To start an interactive session:

```bash
npm run tlox
```

This will give you a prompt where you can enter Lox code directly and see the results:

```
> var greeting = "Hello, world!";
> print greeting;
Hello, world!
```

Press Ctrl+C or Ctrl+D to exit the REPL.

### Running Lox Files

To execute a Lox script file:

```bash
npm run tlox -- path/to/your/script.lox
```

For example:

```bash
npm run tlox -- examples/hello.lox
```

## Example Lox Code

Here's a simple Lox program to get you started:

```lox
// Variable declaration and assignment
var a = 1;
var b = 2;
print a + b;

// Variables can be reassigned
a = 10;
print a;

// Expressions
print 2 * (3 + 4);

// Strings
var message = "Hello" + " " + "Lox";
print message;
```

## Development

### Running Tests

```bash
npm test
```

### Generating AST Classes

If you modify the AST definitions in `scripts/generate-ast.cjs`, you need to regenerate the AST classes:

```bash
node scripts/generate-ast.cjs
```