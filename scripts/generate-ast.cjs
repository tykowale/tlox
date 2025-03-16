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

function defineAst(outputDir, baseName) {
  const outputPath = path.join(outputDir, `${baseName}.ts`);
  const writer = new PrintWriter(outputPath);
  writer.writeln(`import { Token } from 'src/Token';`);
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
