import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Film, Sparkles, DollarSign } from "lucide-react";

const Navbar = () => {
  const { pathname } = useLocation();
  const linkCls = (p: string) =>
    `px-3 py-2 rounded-md transition ${pathname === p ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <nav className="container flex items-center justify-between h-16">
        <Link to="/" className="inline-flex items-center gap-2 font-heading text-lg">
          <Film className="text-primary" />
          <span>StudioScript AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={linkCls("/")}>Home</Link>
          <Link to="/create" className={linkCls("/create")}>Create</Link>
          <Link to="/pricing" className={linkCls("/pricing")}>Pricing</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/create">
            <Button variant="hero" size="sm" className="hidden md:inline-flex">
              <Sparkles /> Start Writing
            </Button>
          </Link>
          <Link to="/pricing" className="md:hidden">
            <Button variant="secondary" size="sm"><DollarSign /> Pricing</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
