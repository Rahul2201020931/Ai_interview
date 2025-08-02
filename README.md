# AI Mock Interview Platform

An AI-powered platform for preparing for mock interviews with real-time voice interaction and feedback.

## Features

- Real-time voice interviews with AI
- Instant feedback and scoring
- Multiple interview types (Technical, Behavioral, Mixed)
- Firebase authentication
- Vapi.ai integration for voice calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Vapi.ai account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Vapi Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token_here
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key_here"

# Google AI Configuration (if using Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

### How to get the required credentials:

#### Vapi.ai Setup:
1. Sign up at [vapi.ai](https://vapi.ai)
2. Get your web token from the dashboard
3. Create a workflow and get the workflow ID

#### Firebase Setup:
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Generate a service account key
4. Copy the project ID, client email, and private key

### Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

## Project Structure

```
ai_mock_interview/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Protected pages
│   └── api/               # API routes
├── components/             # React components
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
└── constants/             # App constants
```

## Troubleshooting

### Common Issues:

1. **"Meeting ended due to ejection"** - Check your Vapi configuration
2. **Firebase connection errors** - Verify your Firebase credentials
3. **Voice call not starting** - Ensure all environment variables are set

### Error Handling

The application now includes proper error handling for:
- Missing environment variables
- Vapi connection issues
- Firebase authentication errors
- Network connectivity problems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
