import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// Define the expected shape of the request body
interface InterviewRequest {
  type: string;
  role: string;
  level: string;
  techstack: string;
  amount: number;
  userid: string;
}

// POST handler
export async function POST(request: Request) {
  let body: InterviewRequest;

  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { type, role, level, techstack, amount, userid } = body;

  // Validate fields
  if (!type || !role || !level || !techstack || !amount || !userid) {
    return Response.json(
      { success: false, error: "Missing required fields." },
      { status: 400 }
    );
  }

  try {
    // Generate questions using Gemini
    const { text: questions } = await generateText({
      // FIX 1: Using the correct, standard model name
      model: google("gemini-1.5-flash-latest"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        Thank you! <3
      `,
    });

    console.log("Generated questions raw text:", questions);

    // FIX 2: Using a robust method to parse the JSON from the AI's response
    let parsedQuestions: string[];
    try {
      // Find the string that looks like an array "[...]" in the AI's response
      const jsonMatch = questions.match(/\[.*\]/s);

      if (!jsonMatch) {
        throw new Error("Could not find a valid JSON array in the AI response.");
      }

      // Parse only the matched part
      parsedQuestions = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Parsed result is not an array.");
      }
    } catch (err) {
      console.error("Failed to parse questions from AI response:", err, "Raw Response:", questions);
      return Response.json(
        { success: false, error: "Failed to process questions from AI." },
        { status: 500 }
      );
    }

    // Prepare the interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error generating interview:", error.message);
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return Response.json(
        { success: false, error: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

// GET handler
export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}