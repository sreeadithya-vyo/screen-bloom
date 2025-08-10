import type { ScriptInput } from "./scriptGenerator";

// OpenRouter chat-completions call to generate a full screenplay in Fountain format
export async function generateScriptAI(input: ScriptInput, apiKey: string): Promise<string> {
  const system =
    "You are a professional screenwriter. Output only the screenplay in Fountain format. Match industry conventions. Scale content to the requested duration (≈1 page per minute). No preamble or explanations.";

  const user = `Create a complete, production-ready screenplay in Fountain format with the following parameters:\n\n` +
    `Summary: ${input.summary}\n` +
    `Desired Duration: ${input.duration} minutes\n` +
    `Tone: ${input.tone}\n` +
    `Genre: ${input.genre}\n\n` +
    `Requirements:\n` +
    `- Use proper scene headings, action, character, dialogue, parentheticals, and transitions.\n` +
    `- Structure acts and major beats naturally for the chosen duration.\n` +
    `- Do not include any commentary or markdown — only the screenplay text.`;

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
    "X-Title": "StudioScript AI",
  };
  if (typeof window !== "undefined") {
    headers["HTTP-Referer"] = window.location.origin;
  }

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`OpenRouter request failed: ${resp.status} ${errText}`);
  }

  const data = await resp.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content || !content.trim()) {
    throw new Error("OpenRouter returned no content");
  }
  return content.trim();
}
