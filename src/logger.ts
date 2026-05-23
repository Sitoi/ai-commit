import * as vscode from 'vscode';

const API_KEY_PATTERNS: RegExp[] = [
  /sk-ant-[A-Za-z0-9_-]{20,}/g,
  /sk-[A-Za-z0-9_-]{20,}/g,
  /AIza[A-Za-z0-9_-]{30,}/g,
  /gsk_[A-Za-z0-9]{20,}/g,
  /xai-[A-Za-z0-9]{20,}/g
];

export function redactSecrets(text: string): string {
  let result = text;
  for (const pattern of API_KEY_PATTERNS) {
    result = result.replace(pattern, (match) => {
      const tail = match.slice(-4);
      return `***${tail}`;
    });
  }
  return result;
}

export class Logger {
  private static outputChannel: vscode.OutputChannel | undefined;

  static initialize() {
    this.outputChannel = vscode.window.createOutputChannel('AI Commit');
  }

  static info(message: string, ...args: unknown[]) {
    this.log('INFO', message, ...args);
  }

  static warn(message: string, ...args: unknown[]) {
    this.log('WARN', message, ...args);
  }

  static error(message: string, ...args: unknown[]) {
    this.log('ERROR', message, ...args);
  }

  private static log(level: string, message: string, ...args: unknown[]) {
    if (!this.outputChannel) return;
    const timestamp = new Date().toISOString();
    const head = `[${timestamp}] [${level}] ${message}`;
    const body =
      args.length > 0
        ? `${head} ${args.map((a) => this.formatArg(a)).join(' ')}`
        : head;
    this.outputChannel.appendLine(redactSecrets(body));
  }

  private static formatArg(a: unknown): string {
    if (a instanceof Error) {
      const stackLines = (a.stack ?? '').split('\n').slice(0, 6).join('\n');
      return `${a.message}\n${stackLines}`;
    }
    if (typeof a === 'object' && a !== null) {
      try {
        return JSON.stringify(a, null, 2);
      } catch {
        return String(a);
      }
    }
    return String(a);
  }

  static show() {
    this.outputChannel?.show(true);
  }

  static dispose() {
    this.outputChannel?.dispose();
  }
}
