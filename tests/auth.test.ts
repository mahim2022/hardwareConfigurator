import jwt from "jsonwebtoken";
import { expect, test } from "vitest";
import { verifyToken } from "../lib/auth";

test("verifyToken returns decoded payload for valid token", () => {
  process.env.AUTH_SECRET = "test-secret";

  const payload = { userId: 42, email: "test@example.com" };
  const token = jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: "1h" });

  const decoded = verifyToken(token);

  expect(decoded).not.toBeNull();
  expect(decoded?.userId).toBe(42);
  expect(decoded?.email).toBe("test@example.com");
});
