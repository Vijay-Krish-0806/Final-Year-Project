"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressData {
  skillLevel: "beginner" | "intermediate" | "advanced";
  completedLessons: number;
  totalLessons: number;
  strengths: string[];
  weakAreas: string[];
  streak: number;
}

interface Props {
  userId: string;
  courseId: number;
}

export const LearningProgress = ({ userId, courseId }: Props) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [userId, courseId]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `/api/ai/progress?userId=${userId}&courseId=${courseId}`
      );
      const data = await response.json();

      if (data.success) {
        setProgressData(data.progress);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  }

  if (!progressData) {
    return null;
  }

  const progressPercentage =
    (progressData.completedLessons / progressData.totalLessons) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Your Learning Progress
          <Badge
            variant={
              progressData.skillLevel === "beginner"
                ? "secondary"
                : progressData.skillLevel === "intermediate"
                ? "default"
                : "destructive"
            }
          >
            {progressData.skillLevel}
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-powered insights into your language learning journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Lessons Completed</span>
            <span>
              {progressData.completedLessons}/{progressData.totalLessons}
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-700">💪 Strengths</h4>
            <div className="space-y-1">
              {progressData.strengths.map((strength, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-green-700 border-green-300"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-orange-700">🎯 Focus Areas</h4>
            <div className="space-y-1">
              {progressData.weakAreas.map((area, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-orange-700 border-orange-300"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold">Current Streak</p>
              <p className="text-sm text-gray-600">Keep it up!</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {progressData.streak} days
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
