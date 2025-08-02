import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  // Redirect if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animate-fadeIn">
        <h1 className="text-2xl font-bold mb-4 gradient-text">Please sign in to continue</h1>
        <Link href="/sign-in" className="btn-primary animate-pulse-glow">
          Sign In
        </Link>
      </div>
    );
  }

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <>
      <section className="card-cta animate-fadeIn">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="gradient-text">Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg shimmer">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full animate-float">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8 animate-slideUp">
        <h2 className="gradient-text">Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview, index) => (
              <div 
                key={interview.id} 
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <InterviewCard
                  userId={user.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              </div>
            ))
          ) : (
            <div className="glass rounded-2xl p-8 text-center animate-fadeIn">
              <Image 
                src="/file.svg" 
                alt="No interviews" 
                width={64} 
                height={64} 
                className="mx-auto mb-4 opacity-50"
              />
              <p className="text-lg">You haven&apos;t taken any interviews yet</p>
              <p className="text-sm text-light-400 mt-2">Start your first interview to see your progress here</p>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8 animate-slideUp">
        <h2 className="gradient-text">Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview, index) => (
              <div 
                key={interview.id} 
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <InterviewCard
                  userId={user.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              </div>
            ))
          ) : (
            <div className="glass rounded-2xl p-8 text-center animate-fadeIn">
              <Image 
                src="/calendar.svg" 
                alt="No interviews" 
                width={64} 
                height={64} 
                className="mx-auto mb-4 opacity-50"
              />
              <p className="text-lg">There are no interviews available</p>
              <p className="text-sm text-light-400 mt-2">Check back later for new interview opportunities</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
