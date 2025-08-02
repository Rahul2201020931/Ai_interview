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
      const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
      
      console.log("🔍 Vapi Configuration Check:", {
        hasToken: !!vapiToken,
        hasWorkflowId: !!workflowId,
        tokenLength: vapiToken?.length,
        workflowId: workflowId,
        tokenPrefix: vapiToken?.substring(0, 10) + "...",
        type: type
      });

      if (!vapiToken) {
        throw new Error("Vapi token is not configured. Please set NEXT_PUBLIC_VAPI_WEB_TOKEN in your environment variables.");
      }

      if (type === "generate") {
        if (!workflowId) {
          throw new Error("Vapi workflow ID is not configured. Please set NEXT_PUBLIC_VAPI_WORKFLOW_ID in your environment variables.");
        }

        console.log("🚀 Starting Vapi call with workflow:", {
          workflowId,
          userName,
          userId,
          variableValues: {
            username: userName,
            userid: userId,
          }
        });

        // Updated according to new Vapi guidelines
        await vapi.start(
          undefined,
          undefined,
          undefined,
          workflowId,
          {
            variableValues: {
              username: userName,
              userid: userId,
            },
          }
        );
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
      const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
      
      console.log("Test Configuration:", {
        token: vapiToken ? `${vapiToken.substring(0, 10)}...` : "Missing",
        workflowId: workflowId || "Missing",
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

  // Test workflow specifically
  const testWorkflow = async () => {
    try {
      console.log("🧪 Testing workflow specifically...");
      
      const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
      
      console.log("🔍 Current Workflow ID:", workflowId);
      console.log("🔍 Token available:", !!vapiToken);
      
      if (!vapiToken || !workflowId) {
        throw new Error("Missing Vapi token or workflow ID");
      }

      console.log("🔍 Testing workflow:", workflowId);
      
      await vapi.start(
        undefined,
        undefined,
        undefined,
        workflowId,
        {
          variableValues: {
            username: "Test User",
            userid: "test-user-id",
          },
        }
      );

      console.log("✅ Workflow test call initiated successfully!");
      
    } catch (error) {
      console.error("❌ Workflow test failed:", error);
      setError(`Workflow test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Display current configuration
  const showConfig = () => {
    const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
    
    console.log("🔧 Current Configuration:", {
      token: vapiToken ? `${vapiToken.substring(0, 10)}...` : "Missing",
      workflowId: workflowId || "Missing",
      tokenLength: vapiToken?.length,
      hasToken: !!vapiToken,
      hasWorkflowId: !!workflowId
    });
    
    alert(`Current Configuration:\nToken: ${vapiToken ? "✅ Set" : "❌ Missing"}\nWorkflow ID: ${workflowId || "❌ Missing"}`);
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-border">
          <div className="error-content">
            <p className="text-red-500 font-semibold">Error: {error}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>Debug Info:</p>
              <p>Token: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? "✅ Set" : "❌ Missing"}</p>
              <p>Workflow ID: {process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID ? "✅ Set" : "❌ Missing"}</p>
            </div>
            <div className="mt-2 flex gap-2">
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
              <button 
                onClick={testVapiConnection}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Test Connection
              </button>
              <button 
                onClick={testWorkflow}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Test Workflow
              </button>
              <button 
                onClick={showConfig}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Show Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      {lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className={cn("transition-opacity duration-500 animate-fadeIn")}>
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button 
            className="relative btn-call" 
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : callStatus === CallStatus.CONNECTING
                ? "Connecting..."
                : "Call"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
