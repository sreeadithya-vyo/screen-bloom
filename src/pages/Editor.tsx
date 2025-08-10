import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Download, Maximize2, Minimize2, Wand2 } from "lucide-react";
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const defaultPayload = () => {
  try {
    const raw = localStorage.getItem("studioscript:last");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const Editor = () => {
  const location = useLocation();
  const initial = (location.state as any) || defaultPayload();
  const [text, setText] = useState<string>(initial?.screenplay || "");
  const [expanded, setExpanded] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("openrouter:key") || "");
  useEffect(() => {
    if (initial) localStorage.setItem("studioscript:last", JSON.stringify(initial));
  }, [initial]);

  const lines = useMemo(() => text.split("\n").length, [text]);

  const exportFountain = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "screenplay.fountain";
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFont("courier", "normal");
    const marginLeft = 72; // 1 inch
    const marginTop = 72; // 1 inch
    const maxWidth = 468; // 8.5in - 2*1in - 1in (approx screenplay width)
    const fontSize = 11.5;
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
    doc.save("screenplay.pdf");
  };

const regenerateBeat = () => {
  setText((t) => t + "\n\nINT. INSERT - NIGHT\nA quick new beat adds texture to the moment.\nCUT TO:\n");
  toast("Added a new beat. Tweak as needed.");
};

const saveApiKey = () => {
  localStorage.setItem("openrouter:key", apiKey.trim());
  toast("OpenRouter API key saved.");
  setSettingsOpen(false);
};
  const toggleScale = () => {
    setExpanded((e) => !e);
    setText((t) => (expanded ? t.slice(0, Math.max(200, Math.floor(t.length * 0.9))) : t + "\n\n[Expanded content... add more dialogues and descriptions]") );
  };

  return (
    <main className="container py-6">
      <Helmet>
        <title>Script Editor | StudioScript AI</title>
        <meta name="description" content="Edit your Fountain script and preview the formatted output. Export to PDF or Fountain." />
        <link rel="canonical" href="/editor" />
      </Helmet>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="grid gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={regenerateBeat}><Wand2 /> Regenerate Scene</Button>
            <Button variant="secondary" onClick={toggleScale}>
              {expanded ? <Minimize2 /> : <Maximize2 />} {expanded ? "Condense" : "Expand"}
            </Button>
            <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">AI Settings</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Settings</DialogTitle>
                  <DialogDescription>Store your OpenRouter API key securely in this browser.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                  <Input id="openrouter-key" type="password" placeholder="sk-or-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setSettingsOpen(false)}>Cancel</Button>
                  <Button variant="hero" onClick={saveApiKey}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <textarea
            className="min-h-[60vh] w-full resize-y rounded-md border bg-background p-4 font-mono-screenplay"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Fountain screenplay text..."
          />
        </section>

        <section className="grid gap-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold">Preview</h2>
              <div className="flex items-center gap-2">
                <Button variant="hero" onClick={exportPDF}><Download /> PDF</Button>
                <Button variant="secondary" onClick={exportFountain}>Fountain</Button>
              </div>
            </div>
            <div className="mx-auto w-full md:w-[650px] bg-white text-black rounded-md p-8 shadow-xl" style={{aspectRatio:'8.5/11'}}>
              <div className="h-full overflow-auto font-mono-screenplay text-sm leading-relaxed">
                <pre className="whitespace-pre-wrap">{text || "Your formatted screenplay will appear here as you type..."}</pre>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Approx. {lines} lines.</p>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Editor;
