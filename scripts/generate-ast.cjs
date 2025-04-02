const path = require('path');
const fs = require('fs');
const PrintWriter = require('./PrintWriter.cjs');

/**
 * Generates the Expr.ts and Stmt.ts files in the src directory.
 *
 * Usage: node scripts/generate-ast.cjs
 */
//------------------------------------------------------------------------------
// AST Type Definitions
//------------------------------------------------------------------------------
const exprDefinitions = [
  {
    className: 'Assign',
    args: [
      { type: 'Token', name: 'name' },
      { type: 'Expr', name: 'value' },
    ],
  },
  {
    className: 'Binary',
    args: [
      { type: 'Expr', name: 'left' },
      { type: 'Token', name: 'operator' },
      { type: 'Expr', name: 'right' },
    ],
  },
  {
    className: 'Call',
    args: [
      { type: 'Expr', name: 'callee' },
      { type: 'Token', name: 'paren' },
      { type: 'Expr[]', name: 'args' },
    ],
  },
  {
    className: 'Grouping',
    args: [{ type: 'Expr', name: 'expression' }],
  },
  {
    className: 'Literal',
    args: [{ type: 'unknown', name: 'value' }],
  },
  {
    className: 'Logical',
    args: [
      { type: 'Expr', name: 'left' },
      { type: 'Token', name: 'operator' },
      { type: 'Expr', name: 'right' },
    ],
  },
  {
    className: 'Unary',
    args: [
      { type: 'Token', name: 'operator' },
      { type: 'Expr', name: 'right' },
    ],
  },
  {
    className: 'Variable',
    args: [{ type: 'Token', name: 'name' }],
  },
];

const stmtDefinitions = [
  {
    className: 'Block',
    args: [{ type: 'Stmt[]', name: 'statements' }],
  },
  {
    className: 'Expression',
    args: [{ type: 'Expr', name: 'expression' }],
  },
  {
    className: 'LFunction',
    args: [
      { type: 'Token', name: 'name' },
      { type: 'Token[]', name: 'params' },
      { type: 'Stmt[]', name: 'body' },
    ],
  },
  {
    className: 'If',
    args: [
      { type: 'Expr', name: 'condition' },
      { type: 'Stmt', name: 'thenBranch' },
      { type: 'Stmt | null', name: 'elseBranch' },
    ],
  },
  {
    className: 'Print',
    args: [{ type: 'Expr', name: 'expression' }],
  },
  {
    className: 'Return',
    args: [
      { type: 'Token', name: 'keyword' },
      { type: 'Expr', name: 'value' },
    ],
  },
  {
    className: 'Var',
    args: [
      { type: 'Token', name: 'name' },
      { type: 'Expr', name: 'initializer' },
    ],
  },
  {
    className: 'While',
    args: [
      { type: 'Expr', name: 'condition' },
      { type: 'Stmt', name: 'body' },
    ],
  },
];

//------------------------------------------------------------------------------
// Code Generation Functions
//------------------------------------------------------------------------------
function defineVisitor(writer, baseName, definitions) {
  writer.writeln(`export interface ${baseName}Visitor<R> {`);

  for (const def of definitions) {
    writer.writeln(
      `  visit${def.className}${baseName}(${baseName.toLowerCase()}: ${def.className}): R;`,
    );
  }

  writer.writeln('}\n');
}

function defineBaseClass(writer, baseName) {
  writer.writeln(`export abstract class ${baseName} {`);
  writer.writeln(`  abstract accept<R>(visitor: ${baseName}Visitor<R>): R;`);
  writer.writeln('}\n');
}

function defineClass(writer, baseName, className, fieldList) {
  writer.writeln(`export class ${className} extends ${baseName} {`);

  writer.writeln(`  constructor(`);
  for (const field of fieldList) {
    writer.writeln(`    public readonly ${field.name}: ${field.type},`);
  }
  writer.writeln(`  ) {`);
  writer.writeln(`    super();`);
  writer.writeln(`  }\n`);

  writer.writeln(`  accept<R>(visitor: ${baseName}Visitor<R>): R {`);
  writer.writeln(`    return visitor.visit${className}${baseName}(this);`);
  writer.writeln(`  }`);

  writer.writeln('}\n');
}

function generateAst(outputDir, baseName, definitions) {
  const outputPath = path.join(outputDir, `${baseName}.ts`);
  const writer = new PrintWriter(outputPath);

  if (baseName === 'Stmt') {
    writer.writeln(`import { Expr } from 'src/Expr';`);
    writer.writeln(`import { Token } from 'src/Token';`);
  } else {
    writer.writeln(`import { Token } from 'src/Token';`);
  }
  writer.writeln('');

  defineVisitor(writer, baseName, definitions);

  defineBaseClass(writer, baseName);

  for (const def of definitions) {
    defineClass(writer, baseName, def.className, def.args);
  }

  writer.close();
  console.log(`Generated ${outputPath}`);
}

//------------------------------------------------------------------------------
// Main Execution
//------------------------------------------------------------------------------
const outputDir = path.join(__dirname, '..', 'src');
generateAst(outputDir, 'Expr', exprDefinitions);
generateAst(outputDir, 'Stmt', stmtDefinitions);
