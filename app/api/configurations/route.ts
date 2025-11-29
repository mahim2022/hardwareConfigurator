import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    console.log("Auth token:", token);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token" },
        { status: 401 }
      );
    }

    let decoded: { userId: number };
    try {
      decoded = jwt.verify(
        token,
        process.env.AUTH_SECRET || "secret"
      ) as unknown as { userId: number };
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    // console.log("Fetching configurations for user ID:", userId);

    const sql = `
      SELECT
        id,
        requirements,
        best_fit_configuration AS "bestFitConfiguration",
        price_estimate AS "priceEstimate",
        unit_price AS "unitPrice",
        total_price AS "totalPrice",
        reasoning,
        bulk_scaling AS "bulkScaling",
        used_ai AS "usedAi",
        created_at AS "createdAt"
      FROM configurations
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await query(sql, [userId]);
    // console.log(result.rows);
    return NextResponse.json(
      {
        success: true,
        configurations: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Configuration fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
