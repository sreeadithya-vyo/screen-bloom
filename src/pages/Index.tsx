import { Helmet } from "react-helmet-async";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const Index = () => {
  return (
    <ErrorBoundary>
      <main>
        <Helmet>
          <title>AI Screenplay Generator | Hollywood-Grade Scripts</title>
          <meta name="description" content="From idea to screen in one click. Generate full-length, properly formatted screenplays with StudioScript AI." />
          <link rel="canonical" href="/" />
        </Helmet>
        <Hero />
        <HowItWorks />
        <section id="features" className="container py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Hollywood Formatting, No Effort</h3>
              <p className="text-sm text-muted-foreground">Industry-standard spacing, margins, and elements out of the box.</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">From Summary to Screenplay in Minutes</h3>
              <p className="text-sm text-muted-foreground">Provide a brief summary and let AI expand it into a complete script.</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Precision-Paced to Your Movie Length</h3>
              <p className="text-sm text-muted-foreground">Auto-scales to 60/90/120/150 minutes with balanced scene distribution.</p>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default Index;
