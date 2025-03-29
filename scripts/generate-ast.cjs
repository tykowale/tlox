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
  {
    className: 'Variable',
    args: [{ type: 'Token', name: 'name' }],
  },
];

const stmtDefinitions = [
  {
    className: 'Expression',
    args: [{ type: 'Expr', name: 'expression' }],
  },
  {
    className: 'Print',
    args: [{ type: 'Expr', name: 'expression' }],
  },
  {
    className: 'Var',
    args: [
      { type: 'Token', name: 'name' },
      { type: 'Expr', name: 'initializer' },
    ],
  },
  {
    className: 'Block',
    args: [{ type: 'Stmt[]', name: 'statements' }],
  },
];

//------------------------------------------------------------------------------
// Code Generation Functions
//------------------------------------------------------------------------------
function defineUnionType(writer, baseName, definitions) {
  writer.writeln(
    `export type ${baseName} = ${definitions
      .map(def => `${def.className}${baseName}`)
      .join(' | ')};`,
  );
  writer.writeln('');
}

function defineInterface(writer, baseName, className, fieldList) {
  writer.writeln(`export interface ${className}${baseName} {`);
  writer.writeln(`  type: '${className.toLowerCase()}';`);

  for (const field of fieldList) {
    const optionalMarker = field.optional ? '?' : '';
    writer.writeln(`  ${field.name}${optionalMarker}: ${field.type};`);
  }

  writer.writeln('}');
  writer.writeln('');
}

function defineFactory(writer, baseName, className, fieldList) {
  // Prepare parameters list
  const params = fieldList
    .map(field => {
      const optionalMarker = field.optional ? '?' : '';
      return `${field.name}${optionalMarker}: ${field.type}`;
    })
    .join(', ');

  writer.writeln(`export function create${className}(${params}): ${className}${baseName} {`);
  writer.writeln('  return {');
  writer.writeln(`    type: '${className.toLowerCase()}',`);

  for (const field of fieldList) {
    writer.writeln(`    ${field.name},`);
  }

  writer.writeln('  };');
  writer.writeln('}');
  writer.writeln('');
}

function defineMatcher(writer, baseName, definitions) {
  writer.writeln(`export type ${baseName}Matcher<R> = {`);

  for (const def of definitions) {
    const typeName = def.className.toLowerCase();
    writer.writeln(`  ${typeName}: (${typeName.charAt(0)}: ${def.className}${baseName}) => R;`);
  }

  writer.writeln('};');
  writer.writeln('');
}

function defineMatchFunction(writer, baseName, definitions) {
  writer.writeln(
    `export function match${baseName}<R>(${baseName.toLowerCase()}: ${baseName}, matcher: ${baseName}Matcher<R>): R {`,
  );
  writer.writeln(`  switch (${baseName.toLowerCase()}.type) {`);

  for (const def of definitions) {
    const typeName = def.className.toLowerCase();
    writer.writeln(`    case '${typeName}':`);
    writer.writeln(
      `      return matcher.${typeName}(${baseName.toLowerCase()} as ${def.className}${baseName});`,
    );
  }

  writer.writeln('  }');
  writer.writeln('}');
}

function generateAst(outputDir, baseName, definitions) {
  const outputPath = path.join(outputDir, `${baseName}.ts`);
  const writer = new PrintWriter(outputPath);

  // Write imports
  if (baseName === 'Stmt') {
    writer.writeln(`import { Expr } from 'src/Expr';`);
    writer.writeln(`import { Token } from 'src/Token';`);
  } else {
    writer.writeln(`import { Token } from 'src/Token';`);
  }
  writer.writeln('');

  defineUnionType(writer, baseName, definitions);

  for (const def of definitions) {
    defineInterface(writer, baseName, def.className, def.args);
  }

  for (const def of definitions) {
    defineFactory(writer, baseName, def.className, def.args);
  }

  defineMatcher(writer, baseName, definitions);

  defineMatchFunction(writer, baseName, definitions);

  writer.close();
  console.log(`Generated ${outputPath}`);
}

//------------------------------------------------------------------------------
// Main Execution
//------------------------------------------------------------------------------
const outputDir = path.join(__dirname, '..', 'src');
generateAst(outputDir, 'Expr', exprDefinitions);
generateAst(outputDir, 'Stmt', stmtDefinitions);
