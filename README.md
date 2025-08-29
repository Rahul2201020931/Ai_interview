# AI Mock Interview Platform

A modern, AI-powered mock interview platform built with Next.js, React, and Vapi.ai for real-time voice interactions. Practice technical and behavioral interviews with AI feedback.

👉 **Live Demo**: [AI Mock Interview Platform](https://ai-interview-vw1b-fxg0hqmvd-rahuls-projects-e7eba359.vercel.app/)

## 🚀 Features

- **Real-time Voice Interviews**: Conduct interviews using Vapi.ai's voice technology
- **AI-Powered Feedback**: Get detailed feedback on your interview performance
- **Multiple Interview Types**: Technical, behavioral, and mixed interviews
- **Customizable Questions**: Generate personalized interview questions
- **User Authentication**: Secure Firebase authentication
- **Interview History**: Track your past interviews and progress
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Voice AI**: Vapi.ai
- **AI Models**: OpenAI GPT-4, Google Gemini
- **Deployment**: Vercel

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Firebase project set up
- A Vapi.ai account
- A Google Cloud account (for Gemini AI)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Rahul2201020931/Ai_interview.git
cd Ai_interview
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Vapi.ai Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_public_token_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Google AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Setup Guide

### Vapi.ai Setup

1. **Create a Vapi Account**
   - Go to [Vapi.ai](https://vapi.ai)
   - Sign up for an account

2. **Get Your Public Token**
   - Navigate to your Vapi dashboard
   - Go to Settings → API Keys
   - Copy your Public API Key
   - Add it to `NEXT_PUBLIC_VAPI_WEB_TOKEN`

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password authentication

3. **Set up Firestore**
   - Go to Firestore Database
   - Create a database in production mode
   - Set up security rules

4. **Get Service Account Key**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the values for your environment variables

### Google AI Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project

2. **Enable Generative AI API**
   - Go to APIs & Services → Library
   - Search for "Generative Language API"
   - Enable it

3. **Create API Key**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key to `GOOGLE_GENERATIVE_AI_API_KEY`

## 📁 Project Structure

```
ai_mock_interview/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   ├── Agent.tsx         # Voice interview component
│   └── ...
├── constants/            # Application constants
├── firebase/             # Firebase configuration
├── lib/                  # Utility functions and actions
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🎯 Usage

### Starting an Interview

1. **Sign In**: Create an account or sign in
2. **Generate Interview**: Click "Start an Interview" to create a new interview
3. **Voice Call**: Use the voice interface to conduct the interview
4. **Get Feedback**: Review detailed feedback after the interview

### Interview Types

- **Technical**: Focus on technical skills and problem-solving
- **Behavioral**: Assess soft skills and cultural fit
- **Mixed**: Combination of technical and behavioral questions

## 🔍 Troubleshooting

### Common Issues

#### 1. "Assistant or Squad must be provided" Error
- **Cause**: Incorrect Vapi configuration
- **Solution**: Ensure `NEXT_PUBLIC_VAPI_WEB_TOKEN` is set correctly

#### 2. Microphone Permission Issues
- **Cause**: Browser blocking microphone access
- **Solution**: Allow microphone permissions and use HTTPS

#### 3. Firebase Connection Errors
- **Cause**: Incorrect Firebase configuration
- **Solution**: Verify all Firebase environment variables are set correctly

#### 4. Voice Call Ejection
- **Cause**: Vapi configuration or network issues
- **Solution**: Check Vapi token and network connectivity

### Debug Tools

The application includes debug buttons to help troubleshoot:

- **Show Config**: Displays current environment variable status
- **Test Connection**: Tests basic Vapi functionality
- **Test Assistant**: Tests the interview assistant specifically

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Set Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure they match your local `.env.local` file

3. **Deploy**
   - Vercel will automatically deploy on push to main branch

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_public_token
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
```

## 🤝 Contributing

We welcome contributions to make this platform even better!  

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m 'Add amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request 🚀  

## 🙏 Acknowledgments

Special thanks to the amazing tools and platforms that power this project:  

- [Vapi.ai](https://vapi.ai) – Voice AI technology  
- [Firebase](https://firebase.google.com) – Backend services  
- [Next.js](https://nextjs.org) – React framework  
- [Tailwind CSS](https://tailwindcss.com) – Styling  


✨ **Happy Interviewing & Keep Practicing! 🎤🚀**  
