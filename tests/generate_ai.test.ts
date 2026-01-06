import jwt from "jsonwebtoken";
import { expect, test, vi } from "vitest";

// Mock cookies to return our token
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => ({ value: (global as any).TEST_AUTH_TOKEN }),
  }),
}));

// Mock AI to return a valid summary
vi.mock("@/lib/openrouter", () => ({
  getOpenRouterSummary: async (normalized: any) => ({
    cpu: "ai-cpu",
    gpu: "ai-gpu",
    ram: "32GB",
    storage: "1TB",
    unitPrice: 900,
    bulkScaling: "AI scaling notes",
    cpuCores: 8,
    cpuThreads: 16,
  }),
}));

// Keep deriveBaselineSpec in place (not used when AI succeeds)
vi.mock("@/lib/rules", () => ({
  deriveBaselineSpec: (normalized: any) => ({
    cpu: "baseline-cpu",
    gpu: "baseline-gpu",
    ram: "8GB",
    storage: "256GB",
    estimatedUnitPrice: 500,
  }),
}));

// Mock DB to return an inserted configuration
vi.mock("@/lib/db", () => ({
  query: async (text: string, params?: any[]) => ({
    rows: [{ id: 2, user_id: params ? params[0] : 42 }],
    rowCount: 1,
  }),
  initDB: async () => {},
}));

import { POST } from "../app/api/generate/route";

test("POST /api/generate uses AI when available and returns usedAI=true", async () => {
  process.env.AUTH_SECRET = "test-secret";

  const payload = {
    usageType: "office",
    budgetRange: "500-1000",
    quantity: 1,
    formFactor: "desktop",
    requiredSoftware: ["office"],
    brandConstraints: "none",
    performancePriority: "balanced",
  };

  const token = jwt.sign({ userId: 99, email: "ai@test" }, process.env.AUTH_SECRET as string);
  (global as any).TEST_AUTH_TOKEN = token;

  const req = { json: async () => payload } as unknown as Request;

  const res = await POST(req as any);

  expect((res as Response).status).toBe(201);
  const body = await (res as Response).json();
  expect(body).toBeDefined();
  expect(body.usedAI).toBe(true);
  expect(body.aiSummary).toBeDefined();
  expect(body.aiSummary.cpu).toBe("ai-cpu");
  expect(body.configuration).toBeDefined();
});
