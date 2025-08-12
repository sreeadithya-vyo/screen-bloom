import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Genre, Tone } from "@/utils/scriptGenerator";
import { generateAdScript } from "@/utils/adScriptGenerator";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const AdsCreate = () => {
  const [summary, setSummary] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<30 | 45 | 60 | 90 | 120>(30);
  const [tone, setTone] = useState<Tone>("Serious");
  const [genre, setGenre] = useState<Genre>("Drama");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let script: string | undefined;

      const { data, error } = await supabase.functions.invoke("generate-ads-script", {
        body: { summary, durationSeconds, tone, genre },
      });
      if (error) throw error;
      script = (data as any)?.script;
      if (!script) throw new Error("No ad script returned");

      const payload = { script, meta: { summary, durationSeconds, tone, genre } };
      localStorage.setItem("studioscript:ads:last", JSON.stringify(payload));
      navigate("/ads/editor", { state: payload });
    } catch (err) {
      console.error(err);
      toast("Ad generation failed. Falling back to demo.");
      const script = generateAdScript({ summary, durationSeconds, tone, genre });
      const payload = { script, meta: { summary, durationSeconds, tone, genre } };
      localStorage.setItem("studioscript:ads:last", JSON.stringify(payload));
      navigate("/ads/editor", { state: payload });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>Create Ad Script | StudioScript AI</title>
        <meta name="description" content="Generate a production-ready advertising script (30s–2min) with tone and genre." />
        <link rel="canonical" href="/ads/create" />
      </Helmet>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Ad Input</CardTitle>
          <CardDescription>Provide your product/story summary and choose a short duration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="summary">Concept Summary</Label>
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Describe product, audience, value props, voice..." rows={8} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="grid gap-2">
                <Label>Ad Duration</Label>
                <Select value={String(durationSeconds)} onValueChange={(v) => setDurationSeconds(Number(v) as 30 | 45 | 60 | 90 | 120)}>
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="45">45 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">120 seconds</SelectItem>
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
                      <RadioGroupItem id={`ads-${t}`} value={t} />
                      <Label htmlFor={`ads-${t}`} className="cursor-pointer">{t}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="hero" size="xl" className="shadow-gold" disabled={loading}>Generate Ad Script</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdsCreate;
