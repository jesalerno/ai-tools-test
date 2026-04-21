import { generateCard } from "../src/application/generateCardUseCase.js";

describe("generateCard", () => {
  it("returns deterministic method when provided", () => {
    const result = generateCard({ method: "JULIA", seed: "abc" });
    expect(result.selectedMethod).toBe("JULIA");
    expect(result.imageDataUri.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  it("surprise mode resolves to concrete method", () => {
    const result = generateCard({ seed: "surprise-seed" });
    expect(result.selectedMethod).toBeTruthy();
  });
});
