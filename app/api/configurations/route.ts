import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const token = (await cookies()).get("auth_token")?.value;
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

    // Check if user is admin
    const userResult = await query(
      "SELECT user_type FROM users WHERE id = $1",
      [userId]
    );
    const isAdmin = userResult.rows[0]?.user_type === "admin";

    const sql = `
      SELECT
        c.id,
        c.requirements,
        c.best_fit_configuration AS "bestFitConfiguration",
        c.unit_price AS "unitPrice",
        c.bulk_scaling AS "bulkScaling",
        c.used_ai AS "usedAi",
        c.status,
        c.created_at AS "createdAt",
        u.email AS "userEmail"
      FROM configurations c
      JOIN users u ON c.user_id = u.id
      ${isAdmin ? "" : "WHERE c.user_id = $1"}
      ORDER BY c.created_at DESC
    `;

    const result = await query(sql, isAdmin ? [] : [userId]);
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
