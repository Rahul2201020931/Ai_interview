export async function GET() {
  const envCheck = {
    vapiToken: !!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN,
    vapiWorkflowId: !!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
    firebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
    firebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    googleApiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  };

  return Response.json({
    success: true,
    environment: envCheck,
    message: "Environment variables check"
  });
} 