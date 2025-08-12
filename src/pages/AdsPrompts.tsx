import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ScenePrompt {
  scene_number: number;
  title: string;
  prompt: string;
}

const AdsPrompts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const script: string | undefined = (location.state as any)?.script;

  const [scenes, setScenes] = useState<ScenePrompt[] | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!script);

  useEffect(() => {
    if (!script) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-prompts", {
          body: { screenplay: script },
        });
        if (error) throw error;
        if (cancelled) return;
        if (data?.scenes && Array.isArray(data.scenes)) {
          setScenes(data.scenes as ScenePrompt[]);
        } else if (typeof data?.raw === "string") {
          setRaw(data.raw);
        } else {
          setError("Unexpected response format.");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to generate prompts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [script]);

  const combined = useMemo(() => {
    if (!scenes) return "";
    return scenes
      .map((s) => `Scene ${s.scene_number} - ${s.title}\n\n${s.prompt}`)
      .join("\n\n---\n\n");
  }, [scenes]);

  if (!script) {
    return (
      <main className="container py-10">
        <Helmet>
          <title>Ad Video Prompts | StudioScript AI</title>
          <meta name="description" content="Generate detailed video prompts per shot from your ad script." />
          <link rel="canonical" href="/ads/prompts" />
        </Helmet>
        <h1 className="text-2xl font-heading font-semibold mb-3">Ad Video Prompts</h1>
        <p className="text-muted-foreground mb-6">No ad script found. Go back to the ad editor to generate prompts.</p>
        <Link to="/ads/editor">
          <Button variant="hero">Back to Ad Editor</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <Helmet>
        <title>Ad Video Prompts | StudioScript AI</title>
        <meta name="description" content="View AI-generated, highly detailed prompts for each shot from your ad." />
        <link rel="canonical" href="/ads/prompts" />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-2xl font-heading font-semibold">Ad Video Prompts</h1>
        <p className="text-sm text-muted-foreground">Derived from your current ad script.</p>
      </header>

      <section className="grid gap-4">
        {loading && (
          <Card className="p-6">
            <p className="text-muted-foreground">Generating detailed prompts…</p>
          </Card>
        )}

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
            <div className="mt-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </Card>
        )}

        {!loading && scenes && scenes.length > 0 && (
          <>
            {scenes.map((s) => (
              <article key={s.scene_number} className="rounded-lg border bg-card p-6 shadow-sm">
                <h2 className="font-semibold mb-2">Scene {s.scene_number}: {s.title}</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{s.prompt}</p>
              </article>
            ))}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={async () => { await navigator.clipboard.writeText(combined); }}
              >
                Copy All
              </Button>
              <Button variant="hero" onClick={() => navigate("/ads/editor")}>Back to Ad Editor</Button>
            </div>
          </>
        )}

        {!loading && !scenes && raw && (
          <Card className="p-6">
            <h2 className="font-semibold mb-2">Raw Output</h2>
            <pre className="whitespace-pre-wrap text-sm">{raw}</pre>
          </Card>
        )}
      </section>
    </main>
  );
};

export default AdsPrompts;
