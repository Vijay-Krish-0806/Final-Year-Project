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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  courseId: number;
  courseName: string;
}

export const AssessmentStarter = ({ courseId, courseName }: Props) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessmentLessonId, setAssessmentLessonId] = useState<number | null>(
    null
  );
  const router = useRouter();

  const createAssessment = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/ai/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (data.success) {
        setAssessmentLessonId(data.lessonId);
        toast.success(
          "Assessment lesson created! Start learning to get personalized lessons."
        );
        router.push(`/lesson/${data.lessonId}`);
      } else {
        toast.error(data.error || "Failed to create assessment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const analyzeAndGenerate = async () => {
    if (!assessmentLessonId) return;

    setIsAnalyzing(true);
    try {
      // First analyze the assessment
      const analyzeResponse = await fetch("/api/ai/analyze-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: assessmentLessonId, courseId }),
      });

      const analyzeData = await analyzeResponse.json();

      if (analyzeData.success) {
        // Then generate personalized units
        const generateResponse = await fetch("/api/ai/generate-units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            assessmentResult: analyzeData.assessmentResult,
            numberOfUnits: 3,
          }),
        });

        const generateData = await generateResponse.json();

        if (generateData.success) {
          toast.success(
            `${generateData.unitsCreated} personalized units created!`
          );
          router.push("/learn");
        } else {
          toast.error(generateData.error || "Failed to generate units");
        }
      } else {
        toast.error(analyzeData.error || "Failed to analyze assessment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🤖 AI-Powered Learning for {courseName}</CardTitle>
        <CardDescription>
          Get personalized lessons based on your current knowledge level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold">Take Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Complete a 15-question assessment to determine your skill level
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your performance and identifies
                strengths/weaknesses
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold">Personalized Lessons</h3>
              <p className="text-sm text-muted-foreground">
                Get custom-generated units and lessons tailored to your needs
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!assessmentLessonId ? (
            <Button
              onClick={createAssessment}
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? "Creating Assessment..." : "Start AI Assessment"}
            </Button>
          ) : (
            <Button
              onClick={analyzeAndGenerate}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing
                ? "Generating Personalized Lessons..."
                : "Generate My Lessons"}
            </Button>
          )}

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={66} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Analyzing your performance and creating personalized content...
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            What makes this special?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Adapts to your current knowledge level</li>
            <li>• Focuses on your weak areas first</li>
            <li>• Creates unlimited practice content</li>
            <li>• Follows proven language learning methodology</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
