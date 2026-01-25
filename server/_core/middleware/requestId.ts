import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

export interface RequestWithId extends Request {
    id: string;
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    const id = req.headers["x-request-id"] || nanoid(10);
    (req as RequestWithId).id = id as string;
    res.setHeader("X-Request-ID", id);
    next();
}
