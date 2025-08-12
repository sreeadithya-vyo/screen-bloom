import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Download, Maximize2, Minimize2, Wand2, List } from "lucide-react";
import jsPDF from "jspdf";

const defaultPayload = () => {
  try {
    const raw = localStorage.getItem("studioscript:ads:last");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const AdsEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = (location.state as any) || defaultPayload();
  const [text, setText] = useState<string>(initial?.script || "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (initial) localStorage.setItem("studioscript:ads:last", JSON.stringify(initial));
  }, [initial]);

  const lines = useMemo(() => text.split("\n").length, [text]);

  const exportText = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ad-script.txt";
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFont("helvetica", "normal");
    const marginLeft = 72;
    const marginTop = 72;
    const maxWidth = 468;
    const fontSize = 12;
    doc.setFontSize(fontSize);
    const paragraphs = text.split("\n\n");
    let y = marginTop;
    paragraphs.forEach((p) => {
      const lines = doc.splitTextToSize(p, maxWidth);
      if (y + lines.length * (fontSize + 3) > doc.internal.pageSize.getHeight() - marginTop) {
        doc.addPage();
        y = marginTop;
      }
      lines.forEach((l: string) => {
        doc.text(l, marginLeft, y);
        y += fontSize + 3;
      });
      y += 6;
    });
    doc.save("ad-script.pdf");
  };

  const addShot = () => {
    setText((t) => t + "\n\nSHOT X (0-2s)\nVISUAL: Quick cut – insert your new shot.\nVO: Add a punchy line.\nSFX: Whoosh\nMUSIC: Continues\n");
    toast("Added a new shot. Tweak as needed.");
  };

  const toggleScale = () => {
    setExpanded((e) => !e);
    setText((t) => (expanded ? t.slice(0, Math.max(100, Math.floor(t.length * 0.9))) : t + "\n\n[Expanded content... add more VO, SFX, and visuals]"));
  };

  const gotoPrompts = () => {
    if (!text.trim()) {
      toast("Please add ad script text first.");
      return;
    }
    navigate("/ads/prompts", { state: { script: text } });
  };

  return (
    <main className="container py-6">
      <Helmet>
        <title>Ad Script Editor | StudioScript AI</title>
        <meta name="description" content="Edit your ad script and export to PDF or text. Generate video prompts per shot." />
        <link rel="canonical" href="/ads/editor" />
      </Helmet>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="grid gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={addShot}><Wand2 /> Add Shot</Button>
            <Button variant="secondary" onClick={toggleScale}>
              {expanded ? <Minimize2 /> : <Maximize2 />} {expanded ? "Condense" : "Expand"}
            </Button>
            <Button variant="hero" onClick={gotoPrompts}><List /> Generate Video Prompts</Button>
          </div>
          <textarea
            className="min-h-[60vh] w-full resize-y rounded-md border bg-background p-4 font-mono-screenplay"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ad script with SHOT breakdown, VO, SFX, MUSIC..."
          />
        </section>

        <section className="grid gap-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold">Preview</h2>
              <div className="flex items-center gap-2">
                <Button variant="hero" onClick={exportPDF}><Download /> PDF</Button>
                <Button variant="secondary" onClick={exportText}>Text</Button>
              </div>
            </div>
            <div className="mx-auto w-full md:w-[650px] bg-white text-black rounded-md p-8 shadow-xl" style={{aspectRatio:'8.5/11'}}>
              <div className="h-full overflow-auto font-mono-screenplay text-sm leading-relaxed">
                <pre className="whitespace-pre-wrap">{text || "Your formatted ad script will appear here as you type..."}</pre>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Approx. {lines} lines.</p>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default AdsEditor;
