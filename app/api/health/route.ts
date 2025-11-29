import { NextResponse } from "next/server";
import { query, initDB } from "@/lib/db";

export async function GET() {
  try {
    console.log("Testing database connection...");

    // Initialize the database
    await initDB();

    // Test query
    const result = await query("SELECT NOW() as current_time");

    if (result.rows.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Database connection successful!",
          timestamp: result.rows[0].current_time,
          rowCount: result.rowCount,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Query executed but no data returned",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
