import fs from 'fs';
import readline from 'readline';
import { Scanner } from 'src/Scanner';

class Lox {
  private hadError: boolean = false;

  public runFile(path: string): void {
    try {
      const buffer = fs.readFileSync(path);
      this.run(buffer.toString('utf8'));

      if (this.hadError) {
        process.exit(65);
      }
    } catch (e) {
      const err = e as Error;
      console.error('Error reading file:', err.message);
      process.exit(74);
    }
  }

  public runPrompt(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.setPrompt('> ');
    rl.prompt();

    rl.on('line', (line: string) => {
      this.run(line);
      this.hadError = false;
      rl.prompt();
    });

    rl.on('close', () => {
      process.exit(0);
    });
  }

  private run(source: string): void {
    const scanner = new Scanner(source);
    scanner.scanTokens();
  }

  public error(line: number, message: string): void {
    this.report(line, '', message);
  }

  private report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}

function main(args: string[]): void {
  const lox = new Lox();

  if (args.length > 1) {
    console.log('Usage: tlox [script]');
    process.exit(64);
  } else if (args.length === 1) {
    lox.runFile(args[0]);
  } else {
    lox.runPrompt();
  }
}

// Node provides arguments in process.argv
// First argument is the node executable path
// Second argument is the script file path
// Actual program arguments start from index 2
main(process.argv.slice(2));
