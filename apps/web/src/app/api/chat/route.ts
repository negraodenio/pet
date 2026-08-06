import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { TimelineService } from "@/lib/services/TimelineService";

/**
 * AI Assistant — Chat endpoint using Vercel AI SDK.
 * Powered by Cognitive Timeline Engine events.
 */
export async function POST(request: Request) {
  const { messages } = await request.json();

  const supabase = await createClient();

  // Fetch pet context & Cognitive Timeline events for the AI
  const [petsResult, timelineEvents] = await Promise.all([
    supabase.from("pets").select("name, species, breed, birth_date, weight_kg"),
    TimelineService.getLatestEvents(20).catch(() => []),
  ]);

  const pets = petsResult.data ?? [];

  const systemPrompt = `You are Compawion AI, the cognitive intelligence layer of Compawion OS.
You answer using real-time observations from the Cognitive Timeline Engine.

CURRENT PETS:
${pets.map((p) => `- ${p.name} (${p.species}, ${p.breed ?? "unknown breed"}, ${p.weight_kg ? `${p.weight_kg}kg` : "unknown weight"})`).join("\n") || "No pets registered yet."}

COGNITIVE TIMELINE EVENTS (last 20 observations):
${timelineEvents.map((e) => `- [${e.source.toUpperCase()}/${e.category.toUpperCase()}] [${e.severity}] ${e.title ?? e.event_type} (${e.pets?.name ?? "Companion"}) — confidence: ${Math.round(e.confidence * 100)}% — ${e.created_at}`).join("\n") || "No events recorded in timeline yet."}

GUIDELINES:
- Be warm, caring, highly observant, and knowledgeable
- Ground your answers in real timeline observations first
- Reference specific pets by name when relevant
- When discussing health or critical alerts, include clinical disclaimers to consult a licensed veterinarian
- Be concise, clear, and structured`;

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let model;

  if (openrouterKey) {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openrouterKey,
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Compawion OS",
      },
    });
    model = openrouter("openai/gpt-4o-2024-11-20");
  } else {
    const openai = createOpenAI({
      apiKey: openaiKey || "dummy-key",
    });
    model = openai("gpt-4o");
  }

  const result = streamText({
    model,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
