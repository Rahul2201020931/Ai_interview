import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96 hover-lift">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg transition-all duration-300 hover:scale-110",
              badgeColor
            )}
          >
            <p className="badge-text">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <div className="relative group">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={90}
              height={90}
              className="rounded-full object-fit size-[90px] transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Interview Role */}
          <h3 className="mt-5 capitalize gradient-text">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2 items-center hover:scale-105 transition-transform duration-200">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
                className="transition-all duration-300 hover:rotate-12"
              />
              <p className="text-sm">{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center hover:scale-105 transition-transform duration-200">
              <Image 
                src="/star.svg" 
                width={22} 
                height={22} 
                alt="star" 
                className="transition-all duration-300 hover:rotate-12"
              />
              <p className="text-sm font-semibold">
                {feedback?.totalScore || "---"}/100
              </p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <div className="mt-5 p-3 rounded-lg glass">
            <p className="line-clamp-2 text-sm leading-relaxed">
              {feedback?.finalAssessment ||
                "You haven't taken this interview yet. Take it now to improve your skills."}
            </p>
          </div>
        </div>

        <div className="flex flex-row justify-between items-end">
          <DisplayTechIcons techStack={techstack} />

          <Button className="btn-primary group">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
              className="flex items-center gap-2"
            >
              {feedback ? "Check Feedback" : "View Interview"}
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
