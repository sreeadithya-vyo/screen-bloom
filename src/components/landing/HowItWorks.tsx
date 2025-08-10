import { PenLine, Clock, Palette, ScrollText } from "lucide-react";

const steps = [
  { Icon: PenLine, title: "Describe Your Story", desc: "Share 2–5 paragraphs of your idea." },
  { Icon: Clock, title: "Choose Your Duration", desc: "60, 90, 120, or 150 minutes." },
  { Icon: Palette, title: "Pick Tone & Genre", desc: "Serious, comedic, suspenseful, romantic and more." },
  { Icon: ScrollText, title: "Get Full Script", desc: "Instant, properly formatted screenplay." },
];

const HowItWorks = () => {
  return (
    <section id="how" className="container py-16">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10">Your Story, Perfectly Paced for the Big Screen</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {steps.map(({ Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-border bg-card/60 p-6 shadow-sm transition hover:shadow-gold">
            <Icon className="text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
