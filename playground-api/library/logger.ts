import chalk from "chalk";

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export function prettyLogLevel(level: LogLevel): string {
  switch (level) {
    case LogLevel.INFO:
      return chalk.blue(level);
    case LogLevel.WARN:
      return chalk.yellow(level);
    case LogLevel.ERROR:
      return chalk.red(level);
  }
}

export function log(level: LogLevel, message: string) {
  console.log(`${prettyLogLevel(level)}: ${message}`);
}

export function customLog(level: string, message: string) {
  console.log(`${chalk.magenta(level)}: ${message}`);
}