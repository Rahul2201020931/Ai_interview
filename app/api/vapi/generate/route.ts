import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";


// Allow usage with the App Router on Vercel's Edge runtime
//export const runtime = "edge";
export const runtime = "nodejs"; 

// Define the shape of the request body
interface InterviewRequest {
  type: string;
  role: string;
  level: string;
  techstack: string | string[];
  amount: number;
  userid: string;
}

// POST /api/vapi/generate
export async function POST(request: Request) {
  console.log("🚀 API Route: Received POST request to /api/vapi/generate");
  console.log("📡 Request headers:", Object.fromEntries(request.headers.entries()));
  
  // Add a simple test response first
  try {
    const body = await request.json();
    console.log("📦 API Route: Request body:", body);
    
    // If we get here, the API is being called
    console.log("✅ API Route: Successfully received request from Vapi");
    
    // Return a simple success response for testing
    return Response.json({ 
      success: true, 
      message: "API is working",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ API Route: Failed to parse JSON:", error);
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
}

// Optional GET handler for testing
export async function GET() {
  console.log("API Route: Received GET request to /api/vapi/generate");
  return Response.json({ success: true, message: "API is live 🚀" }, { status: 200 });
}
  