import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.BACKEND_API_URL ||
  "https://ai-therapist-agent-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const token = req.headers.get("Authorization");
    
    if (!token) {
      console.log("No token provided in request");
      return NextResponse.json(
        { message: "No token provided" }, 
        { status: 401 }
      );
    }

    console.log("Fetching activities from backend...");

    // Forward request to backend
    const response = await fetch(`${API_URL}/api/activities/today`, {
      method: "GET",
      headers: { 
        Authorization: token,
        "Content-Type": "application/json"
      },
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: "Failed to fetch today's activities" 
      }));
      console.error("Backend error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch today's activities" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully fetched activities:", data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}