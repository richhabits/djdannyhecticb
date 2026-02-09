/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Secret management for API keys and sensitive config.
 * Uses AES-256-GCM with a master key from environment.
 */
export class SecretsManager {
    private static devKeyWarned = false;

    private static getMasterKey(): Buffer {
        const key = process.env.INTEGRATIONS_MASTER_KEY;
        if (!key) {
            // Fallback for development only - in production this MUST be set
            if (process.env.NODE_ENV === 'production') {
                throw new Error("CRITICAL: INTEGRATIONS_MASTER_KEY not set in production");
            }

            // Warn once in development
            if (!this.devKeyWarned) {
                console.warn("[SecretsManager] WARNING: Using development fallback key. Set INTEGRATIONS_MASTER_KEY for production.");
                this.devKeyWarned = true;
            }

            // Use a deterministic dev key (32 bytes for AES-256)
            return Buffer.from("hectic-empire-dev-master-key!!", "utf8").subarray(0, 32);
        }
        return Buffer.from(key, 'base64');
    }

    static encrypt(plaintext: string): string {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, this.getMasterKey(), iv);

        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        const tag = cipher.getAuthTag();

        // Return combined string: iv:tag:ciphertext
        return `${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext}`;
    }

    static decrypt(blob: string): string {
        const [ivHex, tagHex, ciphertextHex] = blob.split(':');
        if (!ivHex || !tagHex || !ciphertextHex) {
            throw new Error("Invalid encrypted blob format");
        }

        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, this.getMasterKey(), iv);

        decipher.setAuthTag(tag);

        let plaintext = decipher.update(ciphertextHex, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        return plaintext;
    }
}
