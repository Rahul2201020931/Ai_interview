export async function POST(request: Request) {
  console.log("🧪 Simple test API called");
  
  try {
    const body = await request.json();
    console.log("📦 Received data:", body);
    
    return Response.json({
      success: true,
      message: "Simple test successful",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return Response.json({
      success: false,
      error: "Failed to parse request"
    }, { status: 400 });
  }
}

export async function GET() {
  return Response.json({
    success: true,
    message: "Simple test endpoint is working"
  });
} 