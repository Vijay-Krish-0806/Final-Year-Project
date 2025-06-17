// app/api/ai/analyze-assessment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GeminiLessonGenerator } from "@/lib/gemini";
import db from "@/db/drizzle";
import { challengeProgress, challenges } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, courseId } = await req.json();

    // Get all challenge progress for the assessment lesson
    const progressData = await db.query.challengeProgress.findMany({
      where: eq(challengeProgress.userId, userId),
      with: {
        challenge: true,
      },
    });

    // Filter for assessment lesson challenges
    const lessonChallenges = await db.query.challenges.findMany({
      where: eq(challenges.lessonId, lessonId),
    });

    const challengeIds = lessonChallenges.map((c) => c.id);
    const assessmentProgress = progressData.filter((p) =>
      challengeIds.includes(p.challengeId)
    );

    // Map results with topics (simplified topic extraction)
    const results = assessmentProgress.map((progress) => ({
      challengeId: progress.challengeId,
      correct: progress.completed,
      //@ts-ignore
      topic: extractTopicFromQuestion(progress.challenge.question),
    }));

    const generator = new GeminiLessonGenerator();
    const assessmentResult = await generator.analyzeAssessmentResults(
      userId,
      courseId,
      results
    );

    // Store assessment result (you might want to create a table for this)
    // For now, we'll return it directly

    return NextResponse.json({
      success: true,
      assessmentResult,
    });
  } catch (error) {
    console.error("Error analyzing assessment:", error);
    return NextResponse.json(
      { error: "Failed to analyze assessment" },
      { status: 500 }
    );
  }
}

// Helper function to extract topic from question
function extractTopicFromQuestion(question: string): string {
  // Simple keyword matching - you can make this more sophisticated
  const topicKeywords = {
    color: ["color", "colour", "red", "blue", "green", "yellow"],
    numbers: ["one", "two", "three", "number", "count"],
    family: ["father", "mother", "brother", "sister", "family"],
    greetings: ["hello", "goodbye", "good morning", "good evening"],
    verbs: ["is", "am", "are", "have", "do", "go", "come"],
    objects: ["table", "chair", "book", "car", "house"],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((keyword) => question.toLowerCase().includes(keyword))) {
      return topic;
    }
  }
  return "general";
}
