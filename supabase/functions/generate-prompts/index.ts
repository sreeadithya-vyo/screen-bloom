import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratePromptsRequest {
  screenplay: string;
}

interface ScenePrompt {
  scene_number: number;
  title: string;
  prompt: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Partial<GeneratePromptsRequest>;
    const screenplay = (body?.screenplay || "").toString();

    if (!screenplay.trim()) {
      return new Response(JSON.stringify({ error: "Missing 'screenplay' in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system =
      "You are a senior film prompt engineer. Parse a screenplay written in Fountain format and produce extremely detailed, production-ready visual prompts per scene.";

    const user =
      `From the following screenplay in Fountain format, extract all scenes and return ONLY a valid JSON object with this shape:\n\n` +
      `{"scenes":[{"scene_number":1,"title":"string","prompt":"string"}]}` +
      `\n\nGuidelines:\n` +
      `- Infer scene titles from scene headings (e.g., INT./EXT., location, time).\n` +
      `- The 'prompt' must be 120-200 words and cover: environment, time of day, lighting, camera and lens, composition and framing, character descriptions (attire, age, posture, expression), actions, props, mood, color palette, weather/atmosphere, and style references.\n` +
      `- Do NOT include fountain markup, scene numbers, or screenplay formatting in the prompt text. Focus on cinematic visuals.\n` +
      `- Return ONLY a minified JSON object without code fences.\n\n` +
      `SCREENPLAY:\n` + screenplay;

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Title": "StudioScript AI - Scene Prompts",
      },
      body: JSON.stringify({
        model: "z-ai/glm-4.5-air:free",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error("OpenRouter error:", resp.status, errText);
      return new Response(JSON.stringify({ error: `OpenRouter failed: ${resp.status}`, details: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;

    const tryParse = (text: string): { scenes?: ScenePrompt[]; raw?: string } => {
      const trim = text.trim();
      const strip = trim.replace(/^```json\n?|```$/g, "");
      const candidate = strip;
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && Array.isArray(parsed.scenes)) return { scenes: parsed.scenes };
      } catch (_) {
        // attempt to extract first {...}
        const first = candidate.indexOf("{");
        const last = candidate.lastIndexOf("}");
        if (first >= 0 && last > first) {
          try {
            const parsed = JSON.parse(candidate.slice(first, last + 1));
            if (parsed && Array.isArray(parsed.scenes)) return { scenes: parsed.scenes };
          } catch (_) {}
        }
      }
      return { raw: text };
    };

    const result = content ? tryParse(content) : { raw: "" };

    return new Response(
      JSON.stringify({
        ...result,
        model: data?.model ?? "z-ai/glm-4.5-air:free",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-prompts error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
