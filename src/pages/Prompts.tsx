import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ScenePrompt {
  scene_number: number;
  title: string;
  prompt: string;
}

interface SceneWithImage extends ScenePrompt {
  generatedImage?: string;
  isGeneratingImage?: boolean;
}

const Prompts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const screenplay: string | undefined = (location.state as any)?.screenplay;

  const [scenes, setScenes] = useState<SceneWithImage[] | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!screenplay);

  useEffect(() => {
    if (!screenplay) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-prompts", {
          body: { screenplay },
        });
        if (error) throw error;
        if (cancelled) return;
        if (data?.scenes && Array.isArray(data.scenes)) {
          setScenes(data.scenes as SceneWithImage[]);
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
    return () => {
      cancelled = true;
    };
  }, [screenplay]);

  const combined = useMemo(() => {
    if (!scenes) return "";
    return scenes
      .map((s) => `Scene ${s.scene_number} - ${s.title}\n\n${s.prompt}`)
      .join("\n\n---\n\n");
  }, [scenes]);

  const generateImage = async (sceneNumber: number, prompt: string) => {
    setScenes(prev => prev?.map(scene => 
      scene.scene_number === sceneNumber 
        ? { ...scene, isGeneratingImage: true }
        : scene
    ) || null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (error) throw error;

      setScenes(prev => prev?.map(scene => 
        scene.scene_number === sceneNumber 
          ? { 
              ...scene, 
              generatedImage: `data:image/png;base64,${data.image}`,
              isGeneratingImage: false 
            }
          : scene
      ) || null);

      toast({
        title: "Image generated successfully",
        description: `Scene ${sceneNumber} image has been created.`,
      });
    } catch (e: any) {
      setScenes(prev => prev?.map(scene => 
        scene.scene_number === sceneNumber 
          ? { ...scene, isGeneratingImage: false }
          : scene
      ) || null);

      toast({
        title: "Failed to generate image",
        description: e?.message || "An error occurred while generating the image.",
        variant: "destructive",
      });
    }
  };

  if (!screenplay) {
    return (
      <main className="container py-10">
        <Helmet>
          <title>Scene Prompts Generator | StudioScript AI</title>
          <meta name="description" content="Generate detailed prompts per scene from your screenplay." />
          <link rel="canonical" href="/prompts" />
        </Helmet>
        <h1 className="text-2xl font-heading font-semibold mb-3">Scene Prompts Generator</h1>
        <p className="text-muted-foreground mb-6">No screenplay found. Go back to the editor to generate prompts.</p>
        <Link to="/editor">
          <Button variant="hero">Back to Editor</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <Helmet>
        <title>Scene Prompts from Script | StudioScript AI</title>
        <meta name="description" content="View AI-generated, highly detailed prompts for each scene from your script." />
        <link rel="canonical" href="/prompts" />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-2xl font-heading font-semibold">Scene Prompts Generator</h1>
        <p className="text-sm text-muted-foreground">Derived from your current screenplay.</p>
      </header>

      <section className="grid gap-4">
        {loading && (
          <Card className="p-6">
            <p className="text-muted-foreground">Generating detailed prompts per scene…</p>
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
                <p className="whitespace-pre-wrap text-sm leading-relaxed mb-4">{s.prompt}</p>
                
                {s.generatedImage && (
                  <div className="mb-4">
                    <img 
                      src={s.generatedImage} 
                      alt={`Generated image for scene ${s.scene_number}`}
                      className="w-full max-w-md rounded-lg shadow-sm"
                    />
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateImage(s.scene_number, s.prompt)}
                  disabled={s.isGeneratingImage}
                  className="mt-2"
                >
                  {s.isGeneratingImage ? "Generating..." : "Generate Image"}
                </Button>
              </article>
            ))}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(combined);
                }}
              >
                Copy All
              </Button>
              <Button variant="hero" onClick={() => navigate("/editor")}>Back to Editor</Button>
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

export default Prompts;
