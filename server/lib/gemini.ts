/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { aiProvider } from "../_core/aiProvider";

export async function chatWithDanny(message: string, providerName = "auto") {
    try {
        const { geminiBreaker } = await import("../_core/circuitBreaker");

        return await geminiBreaker.execute(async () => {
            const response = await aiProvider.chat(message, providerName);
            if (response.success && response.text) {
                return response.text;
            }
            return `Yo fam, something went wrong: ${response.error}. Try again! 👊`;
        }, "Hold tight, the signal is breaking up! Try again in a sec. 📉 (Circuit Breaker)");
    } catch (error) {
        console.error("AI Chat Error:", error);
        return "Hold tight, the signal is breaking up! Try again in a sec. 📉";
    }
}
