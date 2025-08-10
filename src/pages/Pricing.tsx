import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tiers = [
  { name: "Free", price: "$0", features: ["Up to 5 pages", "Watermark", "Basic export"], cta: "Start Free", highlight: false },
  { name: "Pro", price: "$19/mo", features: ["Full scripts up to 150 min", "Unlimited exports (PDF/Fountain)", "Priority generation"], cta: "Go Pro", highlight: true },
  { name: "Studio", price: "$99/mo", features: ["Team seats", "White-label", "Advanced tone control"], cta: "Contact Sales", highlight: false },
];

const Pricing = () => {
  return (
    <main className="container py-16">
      <Helmet>
        <title>Pricing | StudioScript AI</title>
        <meta name="description" content="Choose the plan that fits your production needs: Free, Pro, or Studio." />
        <link rel="canonical" href="/pricing" />
      </Helmet>

      <h1 className="text-4xl font-extrabold text-center mb-10">Pricing</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <Card key={t.name} className={t.highlight ? "border-primary shadow-gold" : ""}>
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between">
                <span>{t.name}</span>
                <span className="text-primary">{t.price}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                {t.features.map((f) => (<li key={f}>• {f}</li>))}
              </ul>
              <Button variant={t.highlight ? "hero" : "secondary"} className="w-full">{t.cta}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Pricing;
