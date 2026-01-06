import jwt from "jsonwebtoken";
import { expect, test, vi } from "vitest";

// Mock Next.js cookies to return our test token via a global var
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => ({ value: (global as any).TEST_AUTH_TOKEN }),
  }),
}));

// Mock external dependencies used by the generate handler
vi.mock("@/lib/openrouter", () => ({
  getOpenRouterSummary: async () => {
    throw new Error("AI unavailable in test");
  },
}));

vi.mock("@/lib/rules", () => ({
  deriveBaselineSpec: (normalized: any) => ({
    cpu: "baseline-cpu",
    gpu: "baseline-gpu",
    ram: "8GB",
    storage: "256GB",
    estimatedUnitPrice: 500,
  }),
}));

vi.mock("@/lib/db", () => ({
  query: async (text: string, params?: any[]) => ({
    rows: [{ id: 1, user_id: params ? params[0] : 42 }],
    rowCount: 1,
  }),
  initDB: async () => {},
}));

// Import the handler after mocks so imports resolve to mocks
import { POST } from "../app/api/generate/route";

test("POST /api/generate returns 201 and success true with minimal payload", async () => {
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

  const token = jwt.sign({ userId: 42, email: "test@example.com" }, process.env.AUTH_SECRET as string);
  (global as any).TEST_AUTH_TOKEN = token;

  // Minimal fake Request object with json() method
  const req = { json: async () => payload } as unknown as Request;

  const res = await POST(req as any);

  // Response should be a NextResponse / Fetch Response
  // Check status and body
  expect((res as Response).status).toBe(201);
  const body = await (res as Response).json();
  expect(body).toBeDefined();
  expect(body.success).toBe(true);
  expect(body.configuration).toBeDefined();
});
