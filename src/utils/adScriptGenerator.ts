export type AdDuration = 30 | 45 | 60 | 90 | 120;
import type { Tone, Genre } from "./scriptGenerator";

export interface AdScriptInput {
  summary: string;
  durationSeconds: AdDuration;
  tone: Tone;
  genre: Genre;
}

export function generateAdScript({ summary, durationSeconds, tone, genre }: AdScriptInput): string {
  const shots = Math.max(6, Math.min(18, Math.round(durationSeconds / 5)));
  const secondsPerShot = Math.max(2, Math.round(durationSeconds / shots));

  let t = 0;
  const lines: string[] = [];
  lines.push(`AD TITLE: Untitled ${genre} Spot`);
  lines.push(`LOG LINE: A ${tone.toLowerCase()} ${genre.toLowerCase()} ad in ~${durationSeconds}s.`);
  lines.push("");
  lines.push(summary.trim().replace(/\n+/g, " "));
  lines.push("");

  for (let i = 1; i <= shots; i++) {
    const start = t;
    const end = Math.min(durationSeconds, t + secondsPerShot);
    lines.push(`SHOT ${i} (${start}s–${end}s)`);
    lines.push(`VISUAL: Dynamic visuals advancing the message. Cut ${i}.`);
    lines.push(`ON-SCREEN: Key value prop or micro CTA.`);
    lines.push(`VO: Line ${i} that sells the benefit succinctly.`);
    lines.push(`SFX: Subtle whoosh / click.`);
    lines.push(`MUSIC: Modern, upbeat track continues.`);
    lines.push("");
    t = end;
  }
  lines.push(`CTA (${Math.max(0, durationSeconds - 4)}s–${durationSeconds}s)`);
  lines.push(`VISUAL: Logo lockup + URL / QR.`);
  lines.push(`ON-SCREEN: Try it free today → Brand.com`);
  lines.push(`VO: Try it free today at Brand dot com.`);
  lines.push(`SFX: Button click.`);
  lines.push(`MUSIC: Button-out sting.`);

  lines.push("");
  lines.push(`[Demo preview: Generated ${shots} shots for ~${durationSeconds}s.]`);
  return lines.join("\n");
}
