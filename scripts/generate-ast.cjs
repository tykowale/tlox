const path = require('path');
const fs = require('fs');
const PrintWriter = require('./PrintWriter.cjs');

/**
 * Usage: node scripts/generate-ast.cjs ./src
 */
//------------------------------------------------------------------------------
// AST Type Definitions
//------------------------------------------------------------------------------
const exprDefinitions = [
  {
    className: 'Binary',
    args: [
      { type: 'Expr', name: 'left' },
      { type: 'Token', name: 'operator' },
      { type: 'Expr', name: 'right' },
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
    className: 'Unary',
    args: [
      { type: 'Token', name: 'operator' },
      { type: 'Expr', name: 'right' },
    ],
  },
];

//------------------------------------------------------------------------------
// Code Generation Functions
//------------------------------------------------------------------------------
function defineVisitor(writer) {
  writer.writeln('');
  writer.writeln(`export interface Visitor<R> {`);

  for (const expr of exprDefinitions) {
    writer.writeln(`  visit${expr.className}Expr(expr: ${expr.className}): R;`);
  }

  writer.writeln('}');
}

function defineType(writer, baseName, className, fieldList) {
  writer.writeln('');
  writer.writeln(`export class ${className} implements ${baseName} {`);

  writer.writeln(`  constructor(`);

  for (const field of fieldList) {
    writer.writeln(`    public readonly ${field.name}: ${field.type},`);
  }

  writer.writeln(`  ) {}`);

  writer.writeln('');
  writer.writeln('  accept<R>(visitor: Visitor<R>): R {');
  writer.writeln(`    return visitor.visit${className}Expr(this);`);
  writer.writeln('  }');
  writer.writeln('}');
}

function defineAst(outputDir, baseName) {
  const outputPath = path.join(outputDir, `${baseName}.ts`);
  const writer = new PrintWriter(outputPath);
  
  writer.writeln(`import { Token } from 'src/Token';`);
  writer.writeln('');
  
  defineVisitor(writer);
  writer.writeln('');

  writer.writeln(`export interface ${baseName} {`);
  writer.writeln('  accept<R>(visitor: Visitor<R>): R;');
  writer.writeln('}');

  for (const expr of exprDefinitions) {
    defineType(writer, baseName, expr.className, expr.args);
  }

  writer.close();
  console.log(`Generated ${outputPath}`);
}

//------------------------------------------------------------------------------
// Main Execution
//------------------------------------------------------------------------------
function main(args) {
  if (args.length !== 1) {
    console.error('Usage: node scripts/generate-ast.cjs <output directory>');
    process.exit(64);
  }

  const outputDir = args[0];
  defineAst(outputDir, 'Expr');
}

main(process.argv.slice(2));
