import request from "supertest";
import { buildApp } from "../src/infrastructure/app.js";

describe("app routes", () => {
  const app = buildApp();

  it("returns health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns validation error for invalid payload", async () => {
    const response = await request(app).post("/api/cards/generate").send({ method: "INVALID" });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("VALIDATION_ERROR");
  });
});
