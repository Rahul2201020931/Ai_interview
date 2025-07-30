// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to PrepWise</h1>
      <p className="mb-6">Practice real interview questions & get instant feedback</p>
      <Link href="/auth/sign-in">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
          Start an Interview
        </button>
      </Link>
    </main>
  );
}
