// import { NextResponse } from "next/server";

// import { deriveBaselineSpec, type RequirementsPayload } from "@/lib/rules";
// import { getOpenRouterSummary } from "@/lib/openrouter";

// const REQUIRED_FIELDS: (keyof RequirementsPayload)[] = [
//   "usageType",
//   "budgetRange",
//   "quantity",
//   "formFactor",
//   "requiredSoftware",
//   "brandConstraints",
//   "performancePriority",
// ];

// const normalizeBody = (body: unknown): RequirementsPayload => {
//   if (!body || typeof body !== "object") {
//     throw new Error("Invalid request payload");
//   }

//   const source = body as Record<string, unknown>;

//   const normalized: RequirementsPayload = {
//     usageType: source.usageType as RequirementsPayload["usageType"],
//     budgetRange: String(source.budgetRange ?? ""),
//     quantity: source.quantity as RequirementsPayload["quantity"],
//     formFactor: source.formFactor as RequirementsPayload["formFactor"],
//     requiredSoftware: Array.isArray(source.requiredSoftware)
//       ? (source.requiredSoftware as string[])
//       : typeof source.requiredSoftware === "string" && source.requiredSoftware.length > 0
//         ? source.requiredSoftware.split(",").map((item: string) => item.trim())
//         : [],
//     brandConstraints: String(source.brandConstraints ?? ""),
//     performancePriority: source.performancePriority as RequirementsPayload["performancePriority"],
//     storageRequirements: String(source.storageRequirements ?? ""),
//     networkingNeeds: String(source.networkingNeeds ?? ""),
//     durabilityNeeds: String(source.durabilityNeeds ?? ""),
//     warrantyPreferences: String(source.warrantyPreferences ?? ""),
//     powerPreferences: String(source.powerPreferences ?? ""),
//     complianceNotes: String(source.complianceNotes ?? ""),
//   };

//   return normalized;
// };

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const normalized = normalizeBody(body);

//     for (const field of REQUIRED_FIELDS) {
//       if (
//         normalized[field] === undefined ||
//         normalized[field] === null ||
//         (typeof normalized[field] === "string" && normalized[field].trim().length === 0) ||
//         (Array.isArray(normalized[field]) && normalized[field].length === 0)
//       ) {
//         return NextResponse.json(
//           { error: `Missing required field: ${String(field)}` },
//           { status: 400 }
//         );
//       }
//     }

//     // Try AI first - if it works, use it exclusively
//     let aiSummary = null;
//     let baselineSpec = null;
//     let useBaselineFallback = false;

//     try {
//       aiSummary = await getOpenRouterSummary(normalized);
//       // AI succeeded - we'll use AI-only approach
//       console.log("Derived ai spec:", aiSummary);
//     } catch (error) {
//       console.error("OpenRouter summary failed, falling back to baseline spec", error);
//       // AI failed - fall back to baseline spec
//       useBaselineFallback = true;
//       baselineSpec = deriveBaselineSpec(normalized);
//       console.log("Derived baseline spec:", baselineSpec);
//     }

//     return NextResponse.json({
//       requirements: normalized,
//       baselineSpec: baselineSpec || null, // Only include if AI failed
//       aiSummary,
//       useBaselineFallback, // Flag to indicate which method was used
//       generatedAt: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Configuration generation failed", error);
//     return NextResponse.json(
//       { error: "Unable to process request", details: String(error) },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

import {
  deriveBaselineSpec,
  type RequirementsPayload,
} from "@/lib/rules";

import { getOpenRouterSummary } from "@/lib/openrouter";
import { cookies } from "next/headers";

const REQUIRED_FIELDS: (keyof RequirementsPayload)[] = [
  "usageType",
  "budgetRange",
  "quantity",
  "formFactor",
  "requiredSoftware",
  "brandConstraints",
  "performancePriority",
];

// Normalize incoming payload
const normalizeBody = (body: unknown): RequirementsPayload => {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request payload");
  }

  const source = body as Record<string, unknown>;

  return {
    usageType: source.usageType as RequirementsPayload["usageType"],
    budgetRange: String(source.budgetRange ?? ""),
    quantity: source.quantity as RequirementsPayload["quantity"],
    formFactor: source.formFactor as RequirementsPayload["formFactor"],
    requiredSoftware: Array.isArray(source.requiredSoftware)
      ? (source.requiredSoftware as string[])
      : typeof source.requiredSoftware === "string"
      ? source.requiredSoftware.split(",").map(item => item.trim())
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
};

export async function POST(req: Request) {
  try {
    // 🔐 Extract JWT
    // const authHeader = req.headers.get("authorization");
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
    // }

    // const token = authHeader.split(" ")[1];
    const token = (await cookies()).get("auth_token")?.value;

if (!token) {
  throw new Error("No token");
}

const decodedRaw = jwt.verify(
  token,
  process.env.AUTH_SECRET || "secret"
);

if (!decodedRaw || typeof decodedRaw !== "object" || !("userId" in decodedRaw)) {
  throw new Error("Invalid token payload");
}

const decoded = decodedRaw as { userId: number; email: string };


    // Parse & normalize incoming body
    const body = await req.json();
    const normalized = normalizeBody(body);

    // Validate required fields
    for (const field of REQUIRED_FIELDS) {
      if (
        normalized[field] === undefined ||
        normalized[field] === null ||
        (typeof normalized[field] === "string" && normalized[field].trim() === "") ||
        (Array.isArray(normalized[field]) && normalized[field].length === 0)
      ) {
        return NextResponse.json(
          { error: `Missing required field: ${String(field)}` },
          { status: 400 }
        );
      }
    }

    // ============================
    // 🧠 AI Summary Generation
    // ============================

    let aiSummary = null;
    let baselineSpec = null;
    let useBaselineFallback = false;

    try {
      aiSummary = await getOpenRouterSummary(normalized);
    } catch (err) {
      console.error("AI failed, falling back to baseline", err);
      useBaselineFallback = true;

      baselineSpec = deriveBaselineSpec(normalized);

      // 🔄 Convert baseline → AiSummary shape
      aiSummary = {
        bestFitConfiguration: `
CPU: ${baselineSpec.cpu}
GPU: ${baselineSpec.gpu}
RAM: ${baselineSpec.ram}
Storage: ${baselineSpec.storage}
Networking: ${baselineSpec.networking}
Display: ${baselineSpec.display}
Accessories: ${(baselineSpec.accessories ?? []).join(", ")}
Recommended Vendors: ${baselineSpec.recommendedVendors.join(", ")}
        `.trim(),

        priceEstimate: baselineSpec.estimatedUnitPrice,
        unitPrice: baselineSpec.estimatedUnitPrice,
        totalPrice: "Calculated based on quantity",
        reasoning: baselineSpec.notes.join(" "),
        bulkScaling: "Baseline logic — no AI scaling notes",
      };
    }

    // ============================
    // 🗄️ Store to DB
    // ============================

    const insertQuery = `
      INSERT INTO configurations (
        user_id,
        requirements,
        best_fit_configuration,
        price_estimate,
        unit_price,
        total_price,
        reasoning,
        bulk_scaling,
        used_ai
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const values = [
      decoded.userId,
      JSON.stringify(normalized),
      aiSummary.bestFitConfiguration,
      aiSummary.priceEstimate,
      aiSummary.unitPrice,
      aiSummary.totalPrice,
      aiSummary.reasoning,
      aiSummary.bulkScaling,
      !useBaselineFallback, // true = AI used, false = baseline fallback
    ];

    const result = await query(insertQuery, values);

    // Return final response
    return NextResponse.json(
      {
        success: true,
        message: "Configuration generated & stored.",
        requirements: normalized,
        baselineSpec: useBaselineFallback ? baselineSpec : null,
        aiSummary,
        usedAI: !useBaselineFallback,
        configuration: result.rows[0],
        generatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("Configuration generation failed", err);
    return NextResponse.json(
      { error: "Unable to process request", details: String(err) },
      { status: 500 }
    );
  }
}
