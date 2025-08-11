import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScriptInput {
  summary: string;
  duration: 60 | 90 | 120 | 150;
  tone: string;
  genre: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY is not set in Supabase Edge Function secrets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Partial<ScriptInput> = await req.json().catch(() => ({}));
    const { summary, duration, tone, genre } = body as ScriptInput;

    if (!summary || !duration || !tone || !genre) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: summary, duration, tone, genre" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const system =
      "You are a professional screenwriter. Output only the screenplay in Fountain format. Match industry conventions. Scale content to the requested duration (≈1 page per minute). No preamble or explanations.";

    const user =
      `Create a complete, production-ready screenplay in Fountain format with the following parameters:\n\n` +
      `Summary: ${summary}\n` +
      `Desired Duration: ${duration} minutes\n` +
      `Tone: ${tone}\n` +
      `Genre: ${genre}\n\n` +
      `Requirements:\n` +
      `- Use proper scene headings, action, character, dialogue, parentheticals, and transitions.\n` +
      `- Structure acts and major beats naturally for the chosen duration.\n` +
      `- Do not include any commentary or markdown — only the screenplay text.`;

    const payload = {
      model: "z-ai/glm-4.5-air:free",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    } as const;

    const referer = req.headers.get("origin") || "https://studioscript.ai";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "X-Title": "StudioScript AI",
        "HTTP-Referer": referer,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("OpenRouter error", response.status, text);
      return new Response(
        JSON.stringify({ error: `OpenRouter request failed: ${response.status}`, details: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      return new Response(
        JSON.stringify({ error: "OpenRouter returned no content" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ screenplay: content.trim(), model: data?.model, usage: data?.usage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-script error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
