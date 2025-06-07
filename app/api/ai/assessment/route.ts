// app/api/ai/assessment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { lessonGenerator } from "@/lib/lesson-generator";

export async function POST(req: NextRequest) {
  try {
    console.log("inside API")
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, language } = await req.json();

    if (!courseId || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await lessonGenerator.createAssessmentLesson(
      courseId,
      language
    );
    return NextResponse.json({
      success: true,
      message: "Assessment lesson created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Assessment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create assessment lesson" },
      { status: 500 }
    );
  }
}
