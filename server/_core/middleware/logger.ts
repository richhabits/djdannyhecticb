import { Request, Response, NextFunction } from "express";
import { RequestWithId } from "./requestId";

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, path, ip } = req;
    const requestId = (req as RequestWithId).id;

    // Track the finish event
    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;

        const logData = {
            timestamp: new Date().toISOString(),
            reqId: requestId,
            method,
            path,
            status,
            duration: `${duration}ms`,
            ip,
            userAgent: req.headers["user-agent"],
            userId: (req as any).user?.id || null,
        };

        if (status >= 500) {
            console.error(JSON.stringify({ ...logData, level: "error" }));
        } else if (status >= 400) {
            console.warn(JSON.stringify({ ...logData, level: "warn" }));
        } else {
            console.log(JSON.stringify({ ...logData, level: "info" }));
        }
    });

    next();
}
