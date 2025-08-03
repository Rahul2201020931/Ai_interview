"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  ERROR = "ERROR",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface Message {
  type: string;
  role: "user" | "system" | "assistant";
  transcript: string;
  transcriptType: "final" | "interim";
}

interface VapiError {
  action?: string;
  errorMsg?: string;
  error?: {
    type?: string;
    msg?: string;
  };
  callClientId?: string;
  message?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onCallStart = () => {
      console.log("Call started successfully");
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call ended normally");
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      console.log("Received message:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
    };

    const onError = (err: unknown) => {
      const vapiError = err as VapiError;
      
      console.error("Call Error Details:", {
        action: vapiError?.action,
        errorMsg: vapiError?.errorMsg,
        error: vapiError?.error,
        callClientId: vapiError?.callClientId,
        fullError: err
      });
      
      console.error("Full Vapi Error Object:", JSON.stringify(err, null, 2));
      
      let errorMessage = "An error occurred during the call";
      
      if (vapiError?.errorMsg) {
        errorMessage = vapiError.errorMsg;
      } else if (vapiError?.error?.msg) {
        errorMessage = vapiError.error.msg;
      } else if (vapiError?.error?.type) {
        errorMessage = `Error type: ${vapiError.error.type}`;
      } else if (vapiError?.message) {
        errorMessage = vapiError.message;
      }
      
      setError(errorMessage);
      setCallStatus(CallStatus.ERROR);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // Handle message updates & post-call actions
  const handleGenerateFeedback = useCallback(async () => {
    if (!interviewId || !userId) return;
    
    const { success, feedbackId: newId } = await createFeedback({
      interviewId,
      userId,
      transcript: messages,
      feedbackId,
    });

    router.push(success && newId
      ? `/interview/${interviewId}/feedback`
      : "/"
    );
  }, [messages, interviewId, userId, feedbackId, router]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback();
      }
    }
  }, [messages, callStatus, type, router, handleGenerateFeedback]);

  const handleCall = async () => {
    try {
      setError(null);
      setCallStatus(CallStatus.CONNECTING);

      // Check for media permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Microphone permission granted");
        stream.getTracks().forEach(track => track.stop()); // Clean up
      } catch (mediaError) {
        console.error("❌ Microphone permission denied:", mediaError);
        throw new Error("Microphone access is required. Please allow microphone permissions and try again.");
      }

      // Validate Vapi configuration
      const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      
      console.log("🔍 Vapi Configuration Check:", {
        hasToken: !!vapiToken,
        tokenLength: vapiToken?.length,
        tokenPrefix: vapiToken?.substring(0, 10) + "...",
        type: type
      });

      if (!vapiToken) {
        throw new Error("Vapi token is not configured. Please set NEXT_PUBLIC_VAPI_WEB_TOKEN in your environment variables.");
      }

      if (type === "generate") {
        // For generate type, we'll use the interviewer with a different prompt
        console.log("🚀 Starting Vapi call for interview generation");

        await vapi.start(interviewer as CreateAssistantDTO, {
          variableValues: {
            questions: "Please help me collect information for creating a personalized interview. Ask me for my role (frontend, backend, fullstack), experience level (entry, mid, senior), interview type (technical, behavioral, mixed), tech stack, and number of questions I want.",
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        console.log("🚀 Starting Vapi call with assistant:", {
          questions: formattedQuestions
        });

        await vapi.start(interviewer as CreateAssistantDTO, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (err) {
      console.error("❌ Failed to start call:", err);
      setError(err instanceof Error ? err.message : "Failed to start the call");
      setCallStatus(CallStatus.ERROR);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const handleUserResponse = (response: string) => {
    // For now, just log the response
    console.log("User response:", response);
    // In a real implementation, this would send the response to the AI
  };

  // Reset error and try again
  const handleRetry = () => {
    setError(null);
    setCallStatus(CallStatus.INACTIVE);
  };

  // Test Vapi connection
  const testVapiConnection = async () => {
    try {
      console.log("🧪 Testing Vapi connection...");
      
      const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      
      console.log("Test Configuration:", {
        token: vapiToken ? `${vapiToken.substring(0, 10)}...` : "Missing",
        tokenLength: vapiToken?.length
      });

      if (!vapiToken) {
        throw new Error("Vapi token is missing");
      }

      console.log("✅ Configuration looks good, attempting test call...");

      console.log("🤖 Testing with assistant...");
      
      await vapi.start(interviewer as CreateAssistantDTO, {
        variableValues: { 
          questions: "What is React?\nHow does state work?\nExplain components."
        },
      });

      console.log("✅ Test call initiated successfully!");
      
    } catch (error) {
      console.error("❌ Test call failed:", error);
      setError(`Test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Test assistant specifically
  const testAssistant = async () => {
    try {
      console.log("🧪 Testing assistant specifically...");
      
      const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      
      console.log("🔍 Token available:", !!vapiToken);
      
      if (!vapiToken) {
        throw new Error("Missing Vapi token");
      }

      console.log("🔍 Testing assistant...");
      
      await vapi.start(interviewer as CreateAssistantDTO, {
        variableValues: {
          questions: "Test question 1\nTest question 2\nTest question 3",
          username: "Test User",
          userid: "test-user-id",
        },
      });

      console.log("✅ Assistant test call initiated successfully!");
      
    } catch (error) {
      console.error("❌ Assistant test failed:", error);
      setError(`Assistant test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Display current configuration
  const showConfig = () => {
    const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    
    console.log("🔧 Current Configuration:", {
      token: vapiToken ? `${vapiToken.substring(0, 10)}...` : "Missing",
      tokenLength: vapiToken?.length,
      hasToken: !!vapiToken,
    });
    
    alert(`Current Configuration:\nToken: ${vapiToken ? "✅ Set" : "❌ Missing"}`);
  };

  return (
    <>
      <div className="call-view animate-fadeIn">
        {/* AI Interviewer Card */}
        <div className="card-interviewer animate-slideUp">
          <div className="avatar group">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover transition-all duration-300 group-hover:scale-110"
            />
            {isSpeaking && <span className="animate-speak" />}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="gradient-text">AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="card-content">
            <div className="relative group">
              <Image
                src="/user-avatar.png"
                alt="profile-image"
                width={539}
                height={539}
                className="rounded-full object-cover size-[120px] transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="gradient-text">{userName}</h3>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-border animate-fadeIn">
          <div className="error-content glass">
            <p className="text-red-500 font-semibold">Error: {error}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>Debug Info:</p>
              <p>Token: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? "✅ Set" : "❌ Missing"}</p>
            </div>
            <div className="mt-2 flex gap-2">
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </button>
              <button 
                onClick={testVapiConnection}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
              >
                Test Connection
              </button>
              <button 
                onClick={testAssistant}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Test Assistant
              </button>
              <button 
                onClick={showConfig}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
              >
                Show Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      {lastMessage && (
        <div className="transcript-border animate-fadeIn">
          <div className="transcript">
            <p className={cn("transition-opacity duration-500 animate-fadeIn shimmer")}>
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Quick Response Buttons */}
      {callStatus === CallStatus.ACTIVE && lastMessage && (
        <div className="flex flex-wrap gap-2 justify-center animate-fadeIn mt-6">
          <button 
            onClick={() => handleUserResponse("Hello AI!")}
            className="px-4 py-2 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm"
          >
            Hello AI!
          </button>
          <button 
            onClick={() => handleUserResponse("I'm ready!")}
            className="px-4 py-2 bg-green-500/20 text-green-200 rounded-lg hover:bg-green-500/30 transition-all duration-300 text-sm"
          >
            I'm ready!
          </button>
          <button 
            onClick={() => handleUserResponse("Thank you!")}
            className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-all duration-300 text-sm"
          >
            Thank you!
          </button>
        </div>
      )}

      {/* Call Controls */}
      <div className="w-full flex justify-center animate-slideUp mt-8" style={{ animationDelay: '0.4s' }}>
        {callStatus !== CallStatus.ACTIVE ? (
          <button 
            className="relative btn-call group" 
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span className="relative flex items-center gap-2">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : callStatus === CallStatus.CONNECTING
                ? "Connecting..."
                : "Call"}
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
          </button>
        ) : (
          <button className="btn-disconnect group" onClick={handleDisconnect}>
            <span className="flex items-center gap-2">
              End
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
