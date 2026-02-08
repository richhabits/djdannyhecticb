/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

/**
 * Enterprise Error Management
 * 
 * Features:
 * - RFC 7807 compliant error responses (Problem Details)
 * - Centralized logging with context
 * - Development vs Production leak prevention
 */

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code: string = 'INTERNAL_ERROR',
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Global Express Error Handler
 */
export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const isProd = process.env.NODE_ENV === 'production';

    const errorResponse = {
        type: `https://djdannyhecticb.com/errors/${err.code || 'internal-error'}`,
        title: err.name || 'Error',
        status: statusCode,
        detail: err.message,
        instance: req.path,
        ...(isProd ? {} : { stack: err.stack, details: err.details })
    };

    // Log the error with request context
    logger.error(`${req.method} ${req.path} failed`, {
        error: err.message,
        statusCode,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        ...(isProd ? {} : { stack: err.stack })
    });

    res.status(statusCode).json(errorResponse);
};

/**
 * Async wrapper for Express routes to catch errors automatically
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
