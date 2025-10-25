import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  "https://ai-therapist-agent-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    // ✅ GET THE AUTHORIZATION HEADER
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      console.error("❌ No authorization header in GET /api/chat/sessions");
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    console.log("Fetching all chat sessions from backend");

    // ✅ FORWARD THE AUTHORIZATION HEADER
    const response = await fetch(`${BACKEND_API_URL}/chat/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader, // ✅ CRITICAL
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend error:", error);
      return NextResponse.json(
        { error: error.error || "Failed to fetch sessions" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/chat/sessions error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ GET THE AUTHORIZATION HEADER
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    console.log("Creating new chat session");

    // ✅ FORWARD THE AUTHORIZATION HEADER
    const response = await fetch(`${BACKEND_API_URL}/chat/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader, // ✅ CRITICAL
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend error:", error);
      return NextResponse.json(
        { error: error.error || "Failed to create chat session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/chat/sessions error:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}