import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-heading text-lg mb-2">StudioScript AI</h3>
          <p className="text-sm text-muted-foreground">From idea to screen — in one click.</p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm">
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <a href="#how" className="text-muted-foreground hover:text-foreground">How it works</a>
          <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a>
        </nav>
        <div className="flex items-center gap-4">
          <a aria-label="LinkedIn" href="#" className="text-muted-foreground hover:text-foreground"><Linkedin /></a>
          <a aria-label="Instagram" href="#" className="text-muted-foreground hover:text-foreground"><Instagram /></a>
          <a aria-label="YouTube" href="#" className="text-muted-foreground hover:text-foreground"><Youtube /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
