/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Structured Logger
 * Industry-standard logging with levels and metadata
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    private format(level: LogLevel, message: string, meta?: any) {
        const timestamp = new Date().toISOString();
        return {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...(meta && { metadata: meta }),
        };
    }

    info(message: string, meta?: any) {
        const log = this.format('info', message, meta);
        console.log(JSON.stringify(log));
    }

    warn(message: string, meta?: any) {
        const log = this.format('warn', message, meta);
        console.warn(JSON.stringify(log));
    }

    error(message: string, meta?: any) {
        const log = this.format('error', message, meta);
        console.error(JSON.stringify(log));
    }

    debug(message: string, meta?: any) {
        if (!this.isProduction) {
            const log = this.format('debug', message, meta);
            console.debug(JSON.stringify(log));
        }
    }
}

export const logger = new Logger();
