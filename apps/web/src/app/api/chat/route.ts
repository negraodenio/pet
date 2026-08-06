import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { TimelineService } from "@/lib/services/TimelineService";
import { LivingCompanionModelService } from "@/lib/services/LivingCompanionModelService";
import { CognitiveReasoningEngine } from "@/lib/services/CognitiveReasoningEngine";

/**
 * AI Assistant — Chat endpoint using Vercel AI SDK.
 * Grounded in 3 Layers: Cognitive Timeline + LCM Runtime + CRE Reasoning Results.
 */
export async function POST(request: Request) {
  const { messages } = await request.json();

  const supabase = await createClient();

  // Fetch pet context, LCM states, CRE reasoning results, and Timeline events
  const [petsResult, timelineEvents, topInsights] = await Promise.all([
    supabase.from("pets").select("id, name, species, breed, birth_date, weight_kg"),
    TimelineService.getLatestEvents(20).catch(() => []),
    CognitiveReasoningEngine.getTopHouseholdInsights(5).catch(() => []),
  ]);

  const pets = petsResult.data ?? [];
  let lcmSummaries = "";

  if (pets.length > 0) {
    const lcmStates = await Promise.all(
      pets.map((p) => LivingCompanionModelService.getCurrentState(p.id).catch(() => null)),
    );
    lcmSummaries = lcmStates
      .filter(Boolean)
      .map((lcm) => `- ${lcm?.pets?.name}: ${lcm?.current_summary} (Behavior: ${lcm?.current_behavior}, Room: ${lcm?.current_room}, Vitality: ${lcm?.vitality_score}%, Stress: ${lcm?.stress_score}%)`)
      .join("\n");
  }

  const creReasoningText = topInsights
    .map(
      (r) =>
        `- [${r.priority.toUpperCase()}] ${r.title}: ${r.summary} | Evidence: ${Array.isArray(r.evidence) ? (r.evidence as string[]).join("; ") : "N/A"} | Recommendation: ${r.recommendation ?? "None"} | Confidence: ${Math.round(r.confidence * 100)}%`,
    )
    .join("\n");

  const systemPrompt = `You are Compawion AI, the cognitive reasoning intelligence layer of Compawion OS.
You MUST ground 100% of your responses in real observations from 3 deterministic layers:
1. Cognitive Timeline Engine ("WHAT HAPPENED")
2. Living Companion Model Runtime ("WHAT IS HAPPENING NOW")
3. Cognitive Reasoning Engine ("WHY, PREDICTIONS & RECOMMENDATIONS")

REGISTERED COMPANIONS:
${pets.map((p) => `- ${p.name} (${p.species}, ${p.breed ?? "unknown breed"}, ${p.weight_kg ? `${p.weight_kg}kg` : "unknown weight"})`).join("\n") || "No pets registered yet."}

REAL-TIME LIVING COMPANION MODEL (LCM STATE — "NOW"):
${lcmSummaries || "Initializing baseline LCM states..."}

COGNITIVE REASONING ENGINE (CRE INSIGHTS & EXPLANATIONS — "WHY"):
${creReasoningText || "Zero active alerts or anomalies."}

COGNITIVE TIMELINE EVENTS (HISTORY — "WHAT HAPPENED"):
${timelineEvents.map((e) => `- [${e.source.toUpperCase()}/${e.category.toUpperCase()}] [${e.severity}] ${e.title ?? e.event_type} (${e.pets?.name ?? "Companion"}) — confidence: ${Math.round(e.confidence * 100)}% — ${e.created_at}`).join("\n") || "No events recorded in timeline yet."}

GUIDELINES:
- Be warm, caring, highly observant, and deeply knowledgeable
- Ground your answers strictly in the 3 layers above (Timeline + LCM + CRE Reasoning)
- Never invent unobserved facts
- Explain evidence behind recommendations
- Always include clinical disclaimers to consult a licensed veterinarian for medical issues
- Be concise, structured, and empathetic`;

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
