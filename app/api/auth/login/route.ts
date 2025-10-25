import { NextRequest, NextResponse } from "next/server";

// ✅ Use environment variable with fallback
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🔐 Login request to:", `${BACKEND_API_URL}/auth/login`);

    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Login failed:", data);
      return NextResponse.json(
        { error: data.message || "Login failed" },
        { status: response.status }
      );
    }

    console.log("✅ Login successful for:", data.user?.email);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { 
        error: "Failed to login",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}