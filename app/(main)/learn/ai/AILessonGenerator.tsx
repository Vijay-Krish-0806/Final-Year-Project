// components/admin/AILessonGenerator.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
}

interface Props {
  courses: Course[];
}

export const AILessonGenerator = ({ courses }: Props) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [lessonCount, setLessonCount] = useState<string>("3");
  const [difficulty, setDifficulty] = useState<string>("beginner");
  const [topics, setTopics] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLessons = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/generate-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: parseInt(selectedCourse),
          lessonCount: parseInt(lessonCount),
          difficulty,
          topics: topics
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Generated ${data.unitsCreated} units with ${data.lessonsCreated} lessons!`
        );
        setTopics("");
      } else {
        toast.error(data.error || "Failed to generate lessons");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🤖 AI Lesson Generator</CardTitle>
        <CardDescription>
          Generate lessons automatically using AI for any language course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lessons">Number of Units</Label>
          <Input
            id="lessons"
            type="number"
            min="1"
            max="10"
            value={lessonCount}
            onChange={(e) => setLessonCount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topics">Topics (comma-separated, optional)</Label>
          <Textarea
            id="topics"
            placeholder="e.g., colors, numbers, family, food, greetings"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
          />
        </div>

        <Button
          onClick={generateLessons}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? "Generating Lessons..." : "Generate AI Lessons"}
        </Button>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">Note:</h4>
          <p className="text-sm text-yellow-800">
            AI-generated lessons will be automatically added to the selected
            course. Review and edit them as needed after generation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
