"use client";

import { courses, userProgress } from "@/db/schema";
import { Card } from "./card";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { upsertUserProgress } from "@/actions/user-progress";
import { toast } from "sonner";
import { AssessmentStarter } from "../learn/ai/AssessmentStarter";

type Props = {
  courses: (typeof courses.$inferSelect)[];
  activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
};

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [pending, startTransistion] = useTransition();
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState({
    id: 1,
    language: "Spanish",
  });

  const onClick = (id: number, title: string) => {
    if (pending) return;

    if (id === activeCourseId) {
      setShowAssessment(true);
      setSelectedCourse({ id: activeCourseId, language: title });
      // return router.push("/learn");
    }
    startTransistion(() => {
      upsertUserProgress(id).catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4 ">
        {courses.map((course) => (
          <Card
            key={course.id}
            id={course.id}
            title={course.title}
            imageSrc={course.imgSrc}
            onClick={onClick}
            disabled={pending}
            active={course.id === activeCourseId}
          />
        ))}
      </div>
      {showAssessment && (
        <AssessmentStarter
          courseId={selectedCourse.id}
          language={selectedCourse.language}
          onAssessmentCreated={(data) => {
            window.location.href = `/lesson/${data.lessonId}`;
          }}
        />
      )}
    </div>
  );
};
