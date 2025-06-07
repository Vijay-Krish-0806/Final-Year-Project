// components/ai/CurriculumGenerator.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Trophy, TrendingUp } from "lucide-react";

interface AssessmentResult {
  challengeId: number;
  correct: boolean;
  timeSpent: number;
}

interface CurriculumGeneratorProps {
  courseId: number;
  language: string;
  assessmentResults: AssessmentResult[];
  onCurriculumGenerated: (data: any) => void;
}

export const CurriculumGenerator = ({
  courseId,
  language,
  assessmentResults,
  onCurriculumGenerated,
}: CurriculumGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCurriculum = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      setCurrentStep("Analyzing your performance...");
      setProgress(20);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentStep("Identifying strengths and weaknesses...");
      setProgress(40);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentStep("Generating personalized units...");
      setProgress(60);

      const response = await fetch("/api/ai/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, language, assessmentResults }),
      });

      setProgress(80);
      setCurrentStep("Creating lessons and challenges...");

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate curriculum");
      }

      setProgress(100);
      setCurrentStep("Curriculum ready!");

      onCurriculumGenerated(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const correctAnswers = assessmentResults.filter((r) => r.correct).length;
  const score = Math.round((correctAnswers / assessmentResults.length) * 100);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Assessment Complete!</CardTitle>
        <CardDescription>
          You scored {score}% ({correctAnswers}/{assessmentResults.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{score}%</div>
          <Progress value={score} className="w-full" />
        </div>

        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              {currentStep}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>5 personalized learning units</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Adaptive difficulty based on your performance</span>
          </div>
        </div>

        <Button
          onClick={handleGenerateCurriculum}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Your Curriculum...
            </>
          ) : (
            "Generate My Learning Path"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
