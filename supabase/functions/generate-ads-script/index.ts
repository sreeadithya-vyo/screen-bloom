import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdInput {
  summary: string;
  durationSeconds: 30 | 45 | 60 | 90 | 120;
  tone: string;
  genre: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input = (await req.json()) as Partial<AdInput>;
    const { summary, durationSeconds, tone, genre } = input;

    if (!summary || !durationSeconds || !tone || !genre) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: summary, durationSeconds, tone, genre" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const system =
      "You are an award-winning advertising copywriter and director. Create a production-ready TV/web ad script. Output plain text only.";

    const user =
      `Create a complete advertising script designed for video production with the following parameters:\n\n` +
      `Summary: ${summary}\n` +
      `Desired Duration: ${durationSeconds} seconds\n` +
      `Tone: ${tone}\n` +
      `Genre/Category: ${genre}\n\n` +
      `Format requirements (STRICT):\n` +
      `- Start with an uppercase title line: AD TITLE: <Title>\n` +
      `- Include a one-line LOG LINE.\n` +
      `- Break the ad into numbered SHOTS with timestamps that sum to ~${durationSeconds}s.\n` +
      `- For each shot include: TIME RANGE (e.g., 0-3s), VISUAL DESCRIPTION, ON-SCREEN TEXT (if any), VOICE OVER (VO), DIALOGUE (if any), SFX, MUSIC.\n` +
      `- Include a clear CTA near the end with on-screen text.\n` +
      `- Keep language concise and production-ready. No markdown. No extra commentary.\n`;

    const body = {
      model: "z-ai/glm-4.5-air:free",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    } as const;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Title": "StudioScript AI - Ads",
    };

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `OpenRouter request failed: ${resp.status}`, details: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      return new Response(JSON.stringify({ error: "No content returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ script: content.trim(), model: body.model }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("generate-ads-script error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
