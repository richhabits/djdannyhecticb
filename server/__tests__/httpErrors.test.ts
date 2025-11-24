import { describe, expect, it } from "vitest";
import {
  BadRequestError,
  ForbiddenError,
  HttpError,
  NotFoundError,
  UnauthorizedError,
} from "@shared/_core/errors";

describe("HttpError helper constructors", () => {
  it("preserves status code and message", () => {
    const error = new HttpError(418, "I'm a teapot");

    expect(error.statusCode).toBe(418);
    expect(error.message).toBe("I'm a teapot");
    expect(error.name).toBe("HttpError");
  });

  it("creates typed helpers with matching status codes", () => {
    expect(BadRequestError("bad").statusCode).toBe(400);
    expect(UnauthorizedError("nope").statusCode).toBe(401);
    expect(ForbiddenError("stop").statusCode).toBe(403);
    expect(NotFoundError("missing").statusCode).toBe(404);
  });
});
