import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";

/**
 * AI Assistant — Chat endpoint using Vercel AI SDK.
 * Dynamically supports OpenRouter or standard OpenAI.
 */
export async function POST(request: Request) {
  const { messages } = await request.json();

  const supabase = await createClient();

  // Fetch pet context for the AI
  const [petsResult, eventsResult] = await Promise.all([
    supabase.from("pets").select("name, species, breed, birth_date, weight_kg"),
    supabase
      .from("pet_events")
      .select("event_type, severity, confidence, created_at, pets(name)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const pets = petsResult.data ?? [];
  const recentEvents = eventsResult.data ?? [];

  const systemPrompt = `You are Compawion AI, an intelligent pet care assistant. You have deep knowledge about pet health, behavior, nutrition, and training.

CURRENT PETS:
${pets.map((p) => `- ${p.name} (${p.species}, ${p.breed ?? "unknown breed"}, ${p.weight_kg ? `${p.weight_kg}kg` : "unknown weight"})`).join("\n") || "No pets registered yet."}

RECENT EVENTS (last 20):
${recentEvents.map((e) => {
  const pet = (e as Record<string, unknown>).pets as { name: string } | null;
  return `- [${e.severity}] ${e.event_type} (${pet?.name ?? "?"}) — confidence: ${Math.round(e.confidence * 100)}% — ${e.created_at}`;
}).join("\n") || "No events recorded yet."}

GUIDELINES:
- Be warm, caring, and knowledgeable
- Reference the specific pets by name when relevant
- When discussing health concerns, always recommend consulting a veterinarian for serious issues
- Use the event data to provide contextual insights
- Be concise but thorough
- Use emojis sparingly to keep a friendly tone`;

  // Use OpenRouter if key is present, otherwise fallback to OpenAI
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
    // OpenRouter model format
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
