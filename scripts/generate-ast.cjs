const path = require('path');
const fs = require('fs');
const PrintWriter = require('./PrintWriter.cjs');

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

function defineType(writer, baseName, className, fieldList) {
  writer.writeln('');
  writer.writeln(`export class ${className} implements ${baseName} {`);

  writer.writeln(`  constructor(`);
  for (const field of fieldList) {
    writer.writeln(`    public readonly ${field.name}: ${field.type},`);
  }

  writer.writeln(`  ) {}`);
  writer.writeln('}');
}

function defineAst(outputDir, baseName) {
  const outputPath = path.join(outputDir, `${baseName}.ts`);
  const writer = new PrintWriter(outputPath);
  writer.writeln(`import { Token } from 'src/Token';`);
  writer.writeln('');

  writer.writeln(`export interface ${baseName} {`);
  writer.writeln('}');

  for (const expr of exprDefinitions) {
    defineType(writer, baseName, expr.className, expr.args);
  }

  writer.close();
}

// to run - node scripts/generate-ast.cjs ./src/
function main(args) {
  if (args.length !== 1) {
    console.error('Usage: node/scripts/generate-ast.js <output directory>');
    process.exit(64);
  }

  const outputDir = args[0];
  defineAst(outputDir, 'Expr');
}

main(process.argv.slice(2));
