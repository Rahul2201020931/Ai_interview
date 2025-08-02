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
  
  let body: InterviewRequest;

  try {
    body = await request.json();
    console.log("📦 API Route: Request body:", body);
  } catch (error) {
    console.error("❌ API Route: Failed to parse JSON:", error);
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { type, role, level, techstack, amount, userid } = body;

  // Check for required fields
  if (!type || !role || !level || !techstack || !amount || !userid) {
    console.error("❌ API Route: Missing required fields:", { type, role, level, techstack, amount, userid });
    return Response.json(
      { success: false, error: "Missing required fields." },
      { status: 400 }
    );
  }

  console.log("✅ API Route: All required fields present, processing...");

  try {
    // Normalize techstack into array
    const techstackArray =
      typeof techstack === "string"
        ? techstack.split(",").map((t) => t.trim())
        : Array.isArray(techstack)
        ? techstack.map((t) => t.trim())
        : [];

    console.log("🔧 API Route: Generating questions with params:", {
      role,
      level,
      techstack: techstackArray,
      type,
      amount,
      userid
    });

    // Generate AI questions using Gemini model
    console.log("🤖 API Route: Calling Gemini AI...");
    
    // Check if Google AI API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("❌ API Route: Google AI API key is missing");
      return Response.json(
        { success: false, error: "Google AI API key is not configured" },
        { status: 500 }
      );
    }
    
    const { text: questions } = await generateText({
      model: google("gemini-1.5-flash-latest"),
      prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstackArray.join(", ")}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text or formatting.
The questions are going to be read by a voice assistant, so avoid special characters like "/" or "*".
Return the result in this format:
["Question 1", "Question 2", "Question 3"]
Thanks!`,
    });

    console.log("🤖 API Route: AI raw response:", questions);

    // Try to extract valid JSON array from the AI response
    let parsedQuestions: string[];
    try {
      const jsonMatch = questions.match(/\[.*\]/s);
      if (!jsonMatch) throw new Error("No JSON array found.");
      parsedQuestions = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error("AI response is not an array.");
      }
    } catch (parseError) {
      console.error("❌ API Route: Parsing error:", parseError, "\nRaw response:", questions);
      return Response.json(
        { success: false, error: "Could not parse questions from AI response." },
        { status: 500 }
      );
    }

    console.log("✅ API Route: Successfully parsed questions:", parsedQuestions);

    // Prepare interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstackArray,
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save interview in Firestore
    console.log("💾 API Route: Saving to Firestore...");
    await db.collection("interviews").add(interview);
    console.log("✅ API Route: Interview saved to Firestore");

    console.log("🎉 API Route: Success! Returning response");
    return Response.json({ success: true, questions: parsedQuestions }, { status: 200 });
  } catch (error) {
    console.error("❌ API Route: Generation error:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Optional GET handler for testing
export async function GET() {
  console.log("API Route: Received GET request to /api/vapi/generate");
  return Response.json({ success: true, message: "API is live 🚀" }, { status: 200 });
}
  