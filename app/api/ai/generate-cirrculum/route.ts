// app/api/ai/generate-curriculum/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { lessonGenerator } from "@/lib/lesson-generator";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, language, assessmentResults } = await req.json();

    if (!courseId || !language || !assessmentResults) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await lessonGenerator.generatePersonalizedCurriculum(
      userId,
      courseId,
      language,
      assessmentResults
    );

    return NextResponse.json({
      success: true,
      message: "Personalized curriculum generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Curriculum generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate curriculum" },
      { status: 500 }
    );
  }
}
