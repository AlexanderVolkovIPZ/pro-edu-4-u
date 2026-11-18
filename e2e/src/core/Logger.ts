// Core Layer: a simple logger. Every test has its own instance,
// and after the test the whole log is attached to the Allure report.
type Level = 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  private readonly lines: string[] = [];

  constructor(private readonly scope: string) {}

  info(message: string): void { this.write('INFO', message); }
  warn(message: string): void { this.write('WARN', message); }
  error(message: string): void { this.write('ERROR', message); }

  dump(): string { return this.lines.join('\n'); }

  private write(level: Level, message: string): void {
    const line = `${new Date().toISOString()} [${level}] [${this.scope}] ${message}`;
    this.lines.push(line);
    if (level === 'ERROR') console.error(line);
  }
}
