import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 });
    }

    let decoded: { userId: number };
    try {
      decoded = jwt.verify(token, process.env.AUTH_SECRET || "secret") as unknown as { userId: number };
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decoded.userId;
    // `params` may be a Promise in Next.js — await it before accessing properties
    const resolvedParams = await context.params;
    const id = Number(resolvedParams.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const sql = `
      SELECT
        id,
        requirements,
        best_fit_configuration AS "bestFitConfiguration",
        unit_price AS "unitPrice",
        bulk_scaling AS "bulkScaling",
        used_ai AS "usedAi",
        created_at AS "createdAt"
      FROM configurations
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `;

    const result = await query(sql, [id, userId]);
    if (!result.rows.length) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, configuration: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Configuration detail fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.AUTH_SECRET || "secret");
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Determine user_type by querying users table using decoded.userId
    const tokenUserId = decoded?.userId;
    if (!tokenUserId) {
      return NextResponse.json({ error: "Invalid token: missing userId" }, { status: 401 });
    }

    const userResult = await query("SELECT user_type FROM users WHERE id = $1", [tokenUserId]);
    if (!userResult.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userType = userResult.rows[0].user_type;
    if (userType !== "admin") {
      return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
    }

    const resolvedParams = await context.params;
    const id = Number(resolvedParams.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    let { status } = body;
    if (typeof status !== "string") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    status = status.toLowerCase();
    // Only allow approved/rejected
    const allowed = ["approved", "rejected"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update configuration status (admin-only)
    // Skip updating `updated_at` because some DB schemas may not have this column.
    const updateSql = `
      UPDATE configurations
      SET status = $1
      WHERE id = $2
      RETURNING id, status
    `;

    const result = await query(updateSql, [status, id]);
    if (!result.rows.length) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, configuration: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Configuration update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
