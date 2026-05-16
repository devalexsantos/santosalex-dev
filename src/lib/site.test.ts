import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSiteUrl, absoluteUrl } from "./site";

describe("site URL helpers", () => {
  const originalEnv = process.env.APP_URL;

  beforeEach(() => {
    delete process.env.APP_URL;
  });

  afterEach(() => {
    process.env.APP_URL = originalEnv;
  });

  it("falls back to localhost when APP_URL is unset", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("strips a trailing slash so callers can safely concat /path", () => {
    process.env.APP_URL = "https://example.com/";
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("strips multiple trailing slashes", () => {
    process.env.APP_URL = "https://example.com///";
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("absoluteUrl prefixes a leading slash when caller forgot", () => {
    process.env.APP_URL = "https://example.com";
    expect(absoluteUrl("foo")).toBe("https://example.com/foo");
    expect(absoluteUrl("/foo")).toBe("https://example.com/foo");
  });

  it("absoluteUrl never produces double slashes between base and path", () => {
    process.env.APP_URL = "https://example.com/";
    expect(absoluteUrl("/foo/bar")).toBe("https://example.com/foo/bar");
  });
});
