export type Tone = "Serious" | "Comedic" | "Suspenseful" | "Romantic" | "Dark" | "Lighthearted";
export type Genre = "Action" | "Drama" | "Thriller" | "Sci-Fi" | "Fantasy" | "Horror" | "Romance" | "Comedy";

export interface ScriptInput {
  summary: string;
  duration: 60 | 90 | 120 | 150;
  tone: Tone;
  genre: Genre;
}

export function generateScript({ summary, duration, tone, genre }: ScriptInput): string {
  // Approx: 1 page per minute. We'll produce a compact sample for demo.
  const pages = duration;
  const scenes = Math.max(8, Math.floor(pages / 5));

  const header = `Title: Untitled ${genre} Project\nWritten by: StudioScript AI\n\n`;
  const intro = `INT. BLACK SCREEN\n\nSUPER: \"${tone.toUpperCase()} ${genre.toUpperCase()}\"\n\nFADE IN:\n\n`; 
  const premise = `VOICE OVER\n${summary.trim().replace(/\n+/g, " ")}\n\n`;

  let body = "";
  for (let i = 1; i <= scenes; i++) {
    body += `INT./EXT. LOCATION ${i} - DAY\n\n`;
    body += `Character ${i}\n(quietly)\nWe move the story forward, beat by beat.\n\n`;
    body += `A moment of action, decision, or reversal. The ${tone.toLowerCase()} tone colors the scene.\n\nCUT TO:\n\n`;
  }
  const ending = `\nFADE OUT.\n\nTHE END\n`;

  const note = `\n[Demo preview: Generated ${scenes} scenes for ${duration} minutes. Expand in editor or connect live AI.]`;

  return header + intro + premise + body + ending + note;
}
