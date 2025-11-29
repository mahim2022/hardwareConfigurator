import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const result = await query("SELECT id, email, name, created_at FROM users WHERE id = $1", [
      decoded.userId,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { name, email, currentPassword, newPassword } = await req.json();

    // Fetch current user
    const userResult = await query("SELECT * FROM users WHERE id = $1", [
      decoded.userId,
    ]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];
    let updates: string[] = [];
    let params: unknown[] = [];
    let paramIndex = 1;

    // Update name if provided
    if (name !== undefined && name !== null) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    // Update email if provided (check for duplicates)
    if (email !== undefined && email !== null && email !== user.email) {
      const emailCheck = await query("SELECT id FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    // Handle password change
    if (newPassword !== undefined && newPassword !== null) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password required to change password" },
          { status: 400 }
        );
      }

      const passwordMatch = await bcryptjs.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      updates.push(`password = $${paramIndex}`);
      params.push(hashedPassword);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add userId to params for WHERE clause
    params.push(decoded.userId);

    const updateQuery = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, created_at, updated_at
    `;

    const result = await query(updateQuery, params);

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
