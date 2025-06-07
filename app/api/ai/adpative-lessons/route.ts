import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { lessonGenerator } from "@/lib/lesson-generator";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { unitId, language, performanceHistory } = await req.json();

    if (!unitId || !language || !performanceHistory) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await lessonGenerator.generateAdaptiveLessons(
      userId,
      unitId,
      language,
      performanceHistory
    );

    return NextResponse.json({
      success: true,
      message: "Adaptive lessons generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Adaptive lessons generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate adaptive lessons" },
      { status: 500 }
    );
  }
}
