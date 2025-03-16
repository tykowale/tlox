const path = require('path');
const fs = require('fs');
const PrintWriter = require('./PrintWriter.cjs');

/**
 * Generates the Expr.ts file in the src directory.
 * 
 * Usage: node scripts/generate-ast.cjs
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
function defineUnionType(writer) {
  writer.writeln(`export type Expr = ${exprDefinitions
    .map(def => `${def.className}Expr`)
    .join(' | ')};`);
  writer.writeln('');
}

function defineInterface(writer, className, fieldList) {
  writer.writeln(`export interface ${className}Expr {`);
  writer.writeln(`  type: '${className.toLowerCase()}';`);
  
  for (const field of fieldList) {
    writer.writeln(`  ${field.name}: ${field.type};`);
  }
  
  writer.writeln('}');
  writer.writeln('');
}

function defineFactory(writer, className, fieldList) {
  const params = fieldList
    .map(field => `${field.name}: ${field.type}`)
    .join(', ');
  
  writer.writeln(`export function create${className}(${params}): ${className}Expr {`);
  writer.writeln('  return {');
  writer.writeln(`    type: '${className.toLowerCase()}',`);
  
  for (const field of fieldList) {
    writer.writeln(`    ${field.name},`);
  }
  
  writer.writeln('  };');
  writer.writeln('}');
  writer.writeln('');
}

function defineMatcher(writer) {
  writer.writeln('export type ExprMatcher<R> = {');
  
  for (const expr of exprDefinitions) {
    const typeName = expr.className.toLowerCase();
    writer.writeln(`  ${typeName}: (expr: ${expr.className}Expr) => R;`);
  }
  
  writer.writeln('};');
  writer.writeln('');
}

function defineMatchFunction(writer) {
  writer.writeln('export function matchExpr<R>(expr: Expr, matcher: ExprMatcher<R>): R {');
  writer.writeln('  switch (expr.type) {');
  
  for (const expr of exprDefinitions) {
    const typeName = expr.className.toLowerCase();
    writer.writeln(`    case '${typeName}':`);
    writer.writeln(`      return matcher.${typeName}(expr as ${expr.className}Expr);`);
  }
  
  writer.writeln('  }');
  writer.writeln('}');
}

function generateAst() {
  const outputPath = path.join(__dirname, '..', 'src', 'Expr.ts');
  const writer = new PrintWriter(outputPath);

  writer.writeln(`import { Token } from 'src/Token';`);
  writer.writeln('');

  defineUnionType(writer);
  
  for (const expr of exprDefinitions) {
    defineInterface(writer, expr.className, expr.args);
  }
  
  for (const expr of exprDefinitions) {
    defineFactory(writer, expr.className, expr.args);
  }
  
  defineMatcher(writer);
  
  defineMatchFunction(writer);
  
  writer.close();
  console.log(`Generated ${outputPath}`);
}

//------------------------------------------------------------------------------
// Main Execution
//------------------------------------------------------------------------------
generateAst();
