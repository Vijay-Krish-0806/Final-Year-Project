// app/api/generate-lesson/route.ts
import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { OpenAI } from "openai";
import * as schema from "@/db/schema";

type GeneratedOption = {
  id: number;
  text: string;
  correct: boolean;
  imageSrc?: string;
  audioSrc?: string;
};
type GeneratedChallenge = {
  id: number;
  type: "SELECT" | "ASSIST";
  question: string;
  order: number;
  options: GeneratedOption[];
};
type GeneratedLesson = {
  unitTitle: string;
  unitDescription: string;
  lessonTitle: string;
  lessonOrder: number;
  challenges: GeneratedChallenge[];
};

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const { userId, courseId, topic, proficiency } = await req.json();

  // 1) Build the AI prompt
  const prompt = `
You are a bilingual language-learning tutor.  
Course #${courseId} already exists with static units.  
Now generate a brand-new unit & one lesson for this user:
- Unit title and short description.
- One lesson title, with an integer "order".
- Three challenges: each with id (1..3), type SELECT or ASSIST, a question, and order.
- For each challenge, generate 3 options: text, boolean correct, optionally imageSrc/audioSrc.

Return valid JSON matching this TypeScript type:

type GeneratedLesson = {
  unitTitle: string;
  unitDescription: string;
  lessonTitle: string;
  lessonOrder: number;
  challenges: GeneratedChallenge[];
};

type GeneratedChallenge = {
  id: number;
  type: "SELECT" | "ASSIST";
  question: string;
  order: number;
  options: GeneratedOption[];
};

type GeneratedOption = {
  id: number;
  text: string;
  correct: boolean;
  imageSrc?: string;
  audioSrc?: string;
};
`;

  // 2) Call the LLM
  const completion = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You generate structured lessons." },
      { role: "user", content: prompt },
    ],
  });
  const raw = completion.choices[0].message.content!;
  let gen: GeneratedLesson;
  try {
    gen = JSON.parse(raw);
  } catch (err) {
    return NextResponse.json(
      { error: "AI returned invalid JSON", raw },
      { status: 500 }
    );
  }

  // 3) Persist via Drizzle
  // 3.a Insert unit
  const [unitRow] = await db
    .insert(schema.units)
    .values({
      title: gen.unitTitle,
      description: gen.unitDescription,
      courseId,
      order: gen.lessonOrder,
    })
    .returning({ id: schema.units.id });

  // 3.b Insert lesson
  const [lessonRow] = await db
    .insert(schema.lessons)
    .values({
      title: gen.lessonTitle,
      unitId: unitRow.id,
      order: gen.lessonOrder,
    })
    .returning({ id: schema.lessons.id });

  // 3.c Insert challenges & options
  for (const c of gen.challenges) {
    const [chalRow] = await db
      .insert(schema.challenges)
      .values({
        lessonId: lessonRow.id,
        type: c.type,
        question: c.question,
        order: c.order,
      })
      .returning({ id: schema.challenges.id });

    const opts = c.options.map((o) => ({
      challengeId: chalRow.id,
      text: o.text,
      correct: o.correct,
      imageSrc: o.imageSrc || null,
      audioSrc: o.audioSrc || null,
    }));
    await db.insert(schema.challengeOptions).values(opts);
  }

  // 4) Return the newly created lesson with nested challenges & options
  const inserted = await db.query.lessons.findFirst({
    where: schema.lessons.id.eq(lessonRow.id),
    with: {
      unit: true,
      challenges: {
        with: { challengeOptions: true },
      },
    },
  });

  return NextResponse.json(inserted);
}
