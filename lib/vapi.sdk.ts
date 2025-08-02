import Vapi from "@vapi-ai/web";

// Validate that the Vapi token exists
const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (!vapiToken) {
  console.warn("NEXT_PUBLIC_VAPI_WEB_TOKEN is not set. Vapi functionality will be limited.");
}

// Initialize Vapi with better error handling
let vapi: Vapi;

try {
  vapi = new Vapi(vapiToken || "");
  console.log("Vapi SDK initialized successfully");
} catch (error) {
  console.error("Failed to initialize Vapi SDK:", error);
  // Create a dummy instance to prevent crashes
  vapi = new Vapi("");
}

export { vapi };

// Add error handling for Vapi initialization
export const initializeVapi = () => {
  if (!vapiToken) {
    throw new Error("Vapi token is not configured. Please set NEXT_PUBLIC_VAPI_WEB_TOKEN in your environment variables.");
  }
  return vapi;
};
