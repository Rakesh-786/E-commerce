import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  debug(message: string, data?: any): void {
    this.log(LogLevel.Debug, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.Info, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.Warn, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.Error, message, data);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging based on environment
    if (!environment.production || level >= LogLevel.Warn) {
      this.logToConsole(logEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const message = `[${timestamp}] ${entry.message}`;

    switch (entry.level) {
      case LogLevel.Debug:
        console.debug(message, entry.data);
        break;
      case LogLevel.Info:
        console.info(message, entry.data);
        break;
      case LogLevel.Warn:
        console.warn(message, entry.data);
        break;
      case LogLevel.Error:
        console.error(message, entry.data);
        break;
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
