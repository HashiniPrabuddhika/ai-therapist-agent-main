import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  "https://ai-therapist-agent-backend.onrender.com";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    
    // ✅ GET THE AUTHORIZATION HEADER FROM THE REQUEST
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      console.error("❌ No authorization header in request");
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    console.log(`Getting chat history for session ${sessionId}`);
    console.log(`Authorization header present: ${authHeader.substring(0, 20)}...`);

    // ✅ FORWARD THE AUTHORIZATION HEADER TO BACKEND
    const response = await fetch(
      `${BACKEND_API_URL}/chat/sessions/${sessionId}/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader, // ✅ THIS IS CRITICAL
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend error:", error);
      return NextResponse.json(
        { error: error.error || "Failed to get chat history" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Chat history retrieved successfully");

    // Format the response
    const formattedMessages = data.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      metadata: msg.metadata,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error getting chat history:", error);
    return NextResponse.json(
      { error: "Failed to get chat history" },
      { status: 500 }
    );
  }
}