import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// Define the expected shape of the request body, now with optional fields
interface InterviewRequest {
  type?: string;
  role?: string;
  level?: string;
  techstack?: string;
  amount?: number;
  userid?: string;
}

// POST handler
export async function POST(request: Request) {
  let body: InterviewRequest;

  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // --- START OF EDITS ---
  // If a field is missing from the request body, provide a default value.
  const finalBody = {
    type: body.type || "mixed",
    role: body.role || "Software Engineer",
    level: body.level || "entry",
    techstack: body.techstack || "React, Next.js",
    amount: body.amount || 5,
    userid: body.userid || "hgOmE7d7eONqP4cSB3a1qfVqgfe2",
  };
  // --- END OF EDITS ---

  try {
    // Generate questions using Gemini with the final values
    const { text: questions } = await generateText({
      model: google("gemini-1.5-flash-latest"),
      prompt: `Prepare questions for a job interview.
        The job role is ${finalBody.role}.
        The job experience level is ${finalBody.level}.
        The tech stack used in the job is: ${finalBody.techstack}.
        The focus between behavioural and technical questions should lean towards: ${finalBody.type}.
        The amount of questions required is: ${finalBody.amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        Thank you! <3
      `,
    });

    console.log("Generated questions raw text:", questions);

    let parsedQuestions: string[];
    try {
      const jsonMatch = questions.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error("Could not find a valid JSON array in the AI response.");
      }
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

    // Prepare the interview object using the final values
    const interview = {
      role: finalBody.role,
      type: finalBody.type,
      level: finalBody.level,
      techstack: finalBody.techstack.split(",").map((t) => t.trim()),
      questions: parsedQuestions,
      userId: finalBody.userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    await db.collection("interviews").add(interview);

    // Also return the generated questions, which is useful for testing
    return Response.json({ success: true, questions: parsedQuestions }, { status: 200 });

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