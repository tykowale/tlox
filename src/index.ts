import fs from 'fs';
import readline from 'readline';
import { Scanner } from 'src/Scanner';

export class Lox {
  protected static hadError: boolean = false;

  public static runFile(path: string): void {
    try {
      const buffer = fs.readFileSync(path);
      Lox.run(buffer.toString('utf8'));

      if (Lox.hadError) {
        process.exit(65);
      }
    } catch (e) {
      const err = e as Error;
      console.error('Error reading file:', err.message);
      process.exit(74);
    }
  }

  public static runPrompt(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.setPrompt('> ');
    rl.prompt();

    rl.on('line', (line: string) => {
      Lox.run(line);
      Lox.hadError = false;
      rl.prompt();
    });

    rl.on('close', () => {
      process.exit(0);
    });
  }

  protected static run(source: string): void {
    const scanner = new Scanner(source);
    scanner.scanTokens();
  }

  public static error(line: number, message: string): void {
    Lox.report(line, '', message);
  }

  protected static report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    Lox.hadError = true;
  }
}

function main(args: string[]): void {
  if (args.length > 1) {
    console.log('Usage: tlox [script]');
    process.exit(64);
  } else if (args.length === 1) {
    Lox.runFile(args[0]);
  } else {
    Lox.runPrompt();
  }
}

// Node provides arguments in process.argv
// First argument is the node executable path
// Second argument is the script file path
// Actual program arguments start from index 2
main(process.argv.slice(2));
