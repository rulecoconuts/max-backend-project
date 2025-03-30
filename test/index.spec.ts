// test/index.spec.ts
import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("Example test", () => {
  it("respond with success", async () => {
    const response = await SELF.fetch("https://example.com");
    const data = await response.json();
    expect(data).toEqual({ success: true });
  });
});
