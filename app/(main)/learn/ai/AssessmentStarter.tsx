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
import { Loader2, Brain, Target } from "lucide-react";

interface AssessmentStarterProps {
  courseId: number;
  language: string;
  onAssessmentCreated: (data: { unitId: number; lessonId: number }) => void;
}

export const AssessmentStarter = ({
  courseId,
  language,
  onAssessmentCreated,
}: AssessmentStarterProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAssessment = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log("calling API")
      const response = await fetch("/api/ai/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, language }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate assessment");
      }

      onAssessmentCreated(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>AI-Powered Assessment</CardTitle>
        <CardDescription>
          Let's create a personalized learning path for your {language} journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>15 carefully crafted questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Brain className="w-4 h-4" />
            <span>AI analyzes your performance</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>Personalized curriculum generation</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          onClick={handleGenerateAssessment}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Assessment...
            </>
          ) : (
            "Start AI Assessment"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
