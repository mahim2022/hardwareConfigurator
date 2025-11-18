import { NextResponse } from "next/server";

import { deriveBaselineSpec, type RequirementsPayload } from "@/lib/rules";
import { getOpenRouterSummary } from "@/lib/openrouter";

const REQUIRED_FIELDS: (keyof RequirementsPayload)[] = [
  "usageType",
  "budgetRange",
  "quantity",
  "formFactor",
  "requiredSoftware",
  "brandConstraints",
  "performancePriority",
];

const normalizeBody = (body: unknown): RequirementsPayload => {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request payload");
  }

  const source = body as Record<string, unknown>;

  const normalized: RequirementsPayload = {
    usageType: source.usageType as RequirementsPayload["usageType"],
    budgetRange: String(source.budgetRange ?? ""),
    quantity: source.quantity as RequirementsPayload["quantity"],
    formFactor: source.formFactor as RequirementsPayload["formFactor"],
    requiredSoftware: Array.isArray(source.requiredSoftware)
      ? (source.requiredSoftware as string[])
      : typeof source.requiredSoftware === "string" && source.requiredSoftware.length > 0
        ? source.requiredSoftware.split(",").map((item: string) => item.trim())
        : [],
    brandConstraints: String(source.brandConstraints ?? ""),
    performancePriority: source.performancePriority as RequirementsPayload["performancePriority"],
    storageRequirements: String(source.storageRequirements ?? ""),
    networkingNeeds: String(source.networkingNeeds ?? ""),
    durabilityNeeds: String(source.durabilityNeeds ?? ""),
    warrantyPreferences: String(source.warrantyPreferences ?? ""),
    powerPreferences: String(source.powerPreferences ?? ""),
    complianceNotes: String(source.complianceNotes ?? ""),
  };

  return normalized;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const normalized = normalizeBody(body);

    for (const field of REQUIRED_FIELDS) {
      if (
        normalized[field] === undefined ||
        normalized[field] === null ||
        (typeof normalized[field] === "string" && normalized[field].trim().length === 0) ||
        (Array.isArray(normalized[field]) && normalized[field].length === 0)
      ) {
        return NextResponse.json(
          { error: `Missing required field: ${String(field)}` },
          { status: 400 }
        );
      }
    }

    const baselineSpec = deriveBaselineSpec(normalized);

    let aiSummary = null;
    try {
      aiSummary = await getOpenRouterSummary(normalized, baselineSpec);
    } catch (error) {
      console.error("OpenRouter summary failed", error);
    }

    return NextResponse.json({
      requirements: normalized,
      baselineSpec,
      aiSummary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Configuration generation failed", error);
    return NextResponse.json(
      { error: "Unable to process request", details: String(error) },
      { status: 500 }
    );
  }
}

