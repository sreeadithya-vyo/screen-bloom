import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateScript, type Genre, type Tone } from "@/utils/scriptGenerator";
import { toast } from "@/components/ui/sonner";
import { generateScriptAI } from "@/utils/ai";
const Create = () => {
  const [summary, setSummary] = useState("");
  const [duration, setDuration] = useState<60 | 90 | 120 | 150>(90);
  const [tone, setTone] = useState<Tone>("Serious");
  const [genre, setGenre] = useState<Genre>("Drama");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const apiKey = localStorage.getItem("openrouter:key")?.trim();
    let screenplay: string;

    if (apiKey) {
      screenplay = await generateScriptAI({ summary, duration, tone, genre }, apiKey);
    } else {
      toast("Using offline demo generator. Add your OpenRouter key in Editor > AI Settings.");
      screenplay = generateScript({ summary, duration, tone, genre });
    }

    const payload = { screenplay, meta: { summary, duration, tone, genre } };
    localStorage.setItem("studioscript:last", JSON.stringify(payload));
    navigate("/editor", { state: payload });
  } catch (err) {
    console.error(err);
    toast("Generation failed. Falling back to demo.");
    const screenplay = generateScript({ summary, duration, tone, genre });
    const payload = { screenplay, meta: { summary, duration, tone, genre } };
    localStorage.setItem("studioscript:last", JSON.stringify(payload));
    navigate("/editor", { state: payload });
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="container py-10">
      <Helmet>
        <title>Create Screenplay | StudioScript AI</title>
        <meta name="description" content="Input your story summary, duration, tone and genre to generate a full screenplay." />
        <link rel="canonical" href="/create" />
      </Helmet>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Story Input</CardTitle>
          <CardDescription>Provide a brief summary and key parameters. We’ll generate the full script.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="summary">Story Summary</Label>
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="2–5 paragraphs: characters, world, conflict, goal..." rows={8} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="grid gap-2">
                <Label>Desired Movie Duration</Label>
                <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v) as 60 | 90 | 120 | 150)}>
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                    <SelectItem value="150">150 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Genre</Label>
                <Select value={genre} onValueChange={(v) => setGenre(v as Genre)}>
                  <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                  <SelectContent>
                    {["Action","Drama","Thriller","Sci-Fi","Fantasy","Horror","Romance","Comedy"].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Tone</Label>
                <RadioGroup className="grid grid-cols-2 gap-2" value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  {["Serious","Comedic","Suspenseful","Romantic","Dark","Lighthearted"].map((t) => (
                    <div key={t} className="flex items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem id={t} value={t} />
                      <Label htmlFor={t} className="cursor-pointer">{t}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="hero" size="xl" className="shadow-gold" disabled={loading}>Generate Full Script</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Create;
