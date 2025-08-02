export async function GET() {
  return Response.json({
    success: true,
    message: "API test endpoint is working",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasVapiToken: !!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN,
      hasWorkflowId: !!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
      hasFirebaseConfig: !!process.env.FIREBASE_PROJECT_ID
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return Response.json({
      success: true,
      message: "POST test successful",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
} 