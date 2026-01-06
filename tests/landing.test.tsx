import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi, test, expect } from "vitest";

// Mock next/link to render a plain anchor for server render
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => React.createElement("a", { href }, children),
}));

// Mock UserNav to keep the test simple
vi.mock("@/components/UserNav", () => ({
  default: () => React.createElement("div", null, "UserNavMock"),
}));

import LandingPage from "../components/LandingPage";

test("LandingPage server-render contains brand and primary CTA text", () => {
  const html = renderToStaticMarkup(React.createElement(LandingPage));

  expect(html).toContain("Rain Computers");
  expect(html).toMatch(/Start Configuring/i);
});
