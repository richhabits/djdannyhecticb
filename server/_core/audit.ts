import { Request } from "express";
import * as db from "../db";

interface AuditContext {
    req: Request;
    user?: {
        id: number;
        name?: string | null;
    } | null;
}

interface AuditParams {
    action: string;
    entityType?: string;
    entityId?: number;
    metadata?: any;
    beforeSnapshot?: any;
    afterSnapshot?: any;
}

export async function auditLog(ctx: AuditContext, params: AuditParams) {
    const { req, user } = ctx;
    const { action, entityType, entityId, metadata, beforeSnapshot, afterSnapshot } = params;

    try {
        await db.createAuditLog({
            actorId: user?.id || null,
            actorName: user?.name || "System",
            action,
            entityType: entityType || null,
            entityId: entityId || null,
            ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || null,
            userAgent: req.headers["user-agent"] || null,
            beforeSnapshot: beforeSnapshot ? JSON.stringify(beforeSnapshot) : null,
            afterSnapshot: afterSnapshot ? JSON.stringify(afterSnapshot) : null,
        });
    } catch (error) {
        // We already log in db.ts, but we shouldn't crash here
        console.error(`[Audit] Error recording action ${action}:`, error);
    }
}
