import { validateGenerateRequest } from "../src/application/validation.js";

describe("validateGenerateRequest", () => {
  it("accepts valid request", () => {
    const result = validateGenerateRequest({ method: "MANDELBROT", seed: "seed-1" });
    expect(result.ok).toBe(true);
  });

  it("rejects unknown method", () => {
    const result = validateGenerateRequest({ method: "BAD_METHOD" });
    expect(result.ok).toBe(false);
  });
});
