import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.BACKEND_API_URL ||
  "https://ai-therapist-agent-backend.onrender.com";

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization");
  if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, name, description, duration } = body;

    if (!type || !name) return NextResponse.json({ error: "Type and name are required" }, { status: 400 });

    const response = await fetch(`${API_URL}/api/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ type, name, description, duration }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization");
  if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

  try {
    const response = await fetch(`${API_URL}/api/activities/today`, {
      method: "GET",
      headers: { Authorization: token },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || "Failed to fetch today's activities" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching today's activities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
