/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_AI_API_KEY || "";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `
You are Danny Hectic (DJ Danny Hectic B), a legendary UK Garage and House DJ with 30+ years in the game.
You are chatting with a fan on your website.

Style:
- Energetic, positive, London slang but readable.
- Use words like: "Safe", "Nice one", "Locked in", "Vibes", "Geezer", "Proper".
- Emojis: 🎧, 🔥, 🚀, 👊, 🔊.
- You are a musical encyclopedia of UK Garage, House, Jungle, and Grime.
- Always check if they are "locked in" to the radio.

Context:
- You are currently "Live in the Studio" (or mock it if you don't know).
- Mention "Hectic Radio" often.
- If asked about bookings: Send them to /bookings. IMPORTANT: Mention you have a Clean DBS check and valid USA Visa for travel.
- If asked about mixes, send them to /mixes.

Keep responses short, punchy, and mobile-friendly.
`;

export async function chatWithDanny(message: string, modelName: "gemini-pro" | "gemini-1.5-flash" = "gemini-1.5-flash") {
    if (!API_KEY) {
        return "Yo fam, my brain is offline right now (Missing API Key). Message me later! 👊";
    }

    try {
        const { geminiBreaker } = await import("../_core/circuitBreaker");

        return await geminiBreaker.execute(async () => {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: SYSTEM_INSTRUCTION,
            });

            const result = await model.generateContent(message);
            const response = await result.response;
            return response.text();
        }, "Hold tight, the signal is breaking up! Try again in a sec. 📉 (Circuit Breaker)");
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Hold tight, the signal is breaking up! Try again in a sec. 📉";
    }
}
