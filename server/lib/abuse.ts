/**
 * Simple profanity and link filter for public shouting
 */

const BANNED_KEYWORDS = [
    "spam", "crypto", "buy", "sell", "cheap", "casino", "porn", "xxx",
    "cialis", "viagra", "pills", "drugs", "whatsapp", // common spam keywords
];

const LINK_REGEX = /https?:\/\/[^\s]+/gi;

export function filterAbuse(content: string): {
    filtered: string;
    hasAbuse: boolean;
    reasons: string[]
} {
    const reasons: string[] = [];
    let filtered = content;

    // 1. Link blocking
    if (LINK_REGEX.test(content)) {
        reasons.push("contains_links");
        filtered = filtered.replace(LINK_REGEX, "[LINK REMOVED]");
    }

    // 2. Keyword check
    const contentLower = content.toLowerCase();
    for (const keyword of BANNED_KEYWORDS) {
        if (contentLower.includes(keyword)) {
            reasons.push(`keyword:${keyword}`);
        }
    }

    return {
        filtered,
        hasAbuse: reasons.length > 0,
        reasons,
    };
}

export function isSpammy(content: string): boolean {
    // Simple deduplication or entropy check could go here
    if (content.length < 2) return true;

    // Repeated characters check
    if (/(.)\1{10,}/.test(content)) return true;

    return false;
}
