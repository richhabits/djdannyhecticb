import { describe, expect, it } from "vitest";
import type { InvokeResult } from "../llm";
import {
  createSystemMessage,
  flattenAssistantText,
  sanitizeChatMessages,
} from "./chat";

const baseResult = (content: InvokeResult["choices"][number]["message"]["content"]): InvokeResult => ({
  id: "test",
  created: Date.now(),
  model: "gemini-test",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content,
      },
      finish_reason: "stop",
    },
  ],
});

describe("createSystemMessage", () => {
  it("injects personalization when user context exists", () => {
    const message = createSystemMessage({
      userName: "Ari",
      userEmail: "ari@example.com",
    });

    expect(message.role).toBe("system");
    expect(message.content).toContain("Ari");
    expect(message.content).toContain("ari@example.com");
  });
});

describe("sanitizeChatMessages", () => {
  it("trims whitespace and drops empty messages", () => {
    const result = sanitizeChatMessages([
      { role: "user", content: "  First " },
      { role: "assistant", content: "   " },
    ]);

    expect(result).toEqual([{ role: "user", content: "First" }]);
  });
});

describe("flattenAssistantText", () => {
  it("returns plain strings untouched", () => {
    const text = flattenAssistantText(baseResult("Hello world"));
    expect(text).toBe("Hello world");
  });

  it("concatenates structured parts", () => {
    const text = flattenAssistantText(
      baseResult([
        { type: "text", text: "Line 1" },
        { type: "image_url", image_url: { url: "https://example.com" } },
        { type: "file_url", file_url: { url: "https://example.com/sample.pdf" } },
      ])
    );

    expect(text).toContain("Line 1");
    expect(text).toContain("image attachment omitted");
    expect(text).toContain("file attachment omitted");
  });

  it("returns null when no assistant content is available", () => {
    const empty = flattenAssistantText({
      ...baseResult(""),
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "" },
          finish_reason: "stop",
        },
      ],
    });

    expect(empty).toBeNull();
  });
});
