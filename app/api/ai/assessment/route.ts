// app/api/ai/assessment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GeminiLessonGenerator } from "@/lib/gemini";
import db from "@/db/drizzle";
import {
  courses,
  units,
  lessons,
  challenges,
  challengeOptions,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    // Get course details
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const generator = new GeminiLessonGenerator();
    const assessmentLesson = await generator.generateAssessmentLesson(
      course.title
    );

    // Create assessment unit if it doesn't exist
    let assessmentUnit = await db.query.units.findFirst({
      where: eq(units.courseId, courseId) && eq(units.title, "Assessment"),
    });
    
    if (!assessmentUnit) {
      const [newUnit] = await db
        .insert(units)
        .values({
          courseId,
          title: "Assessment",
          description: "Initial assessment to determine your skill level",
          order: 0,
        })
        .returning();
      assessmentUnit = newUnit;
    }

    // Create assessment lesson
    const [newLesson] = await db
      .insert(lessons)
      .values({
        unitId: assessmentUnit.id,
        title: assessmentLesson.title,
        order: 1,
      })
      .returning();

    // Create challenges and options
    for (let i = 0; i < assessmentLesson.challenges.length; i++) {
      const challenge = assessmentLesson.challenges[i];

      const [newChallenge] = await db
        .insert(challenges)
        .values({
          lessonId: newLesson.id,
          type: challenge.type,
          question: challenge.question,
          order: i + 1,
        })
        .returning();

      // Create challenge options
      for (const option of challenge.options) {
        await db.insert(challengeOptions).values({
          challengeId: newChallenge.id,
          text: option.text,
          correct: option.correct,
          imageSrc: option.imageSrc,
          audioSrc: option.audioSrc,
        });
      }
    }

    return NextResponse.json({
      success: true,
      lessonId: newLesson.id,
      message: "Assessment lesson created successfully",
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment lesson" },
      { status: 500 }
    );
  }
}
