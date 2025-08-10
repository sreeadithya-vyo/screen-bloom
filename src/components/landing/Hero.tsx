import heroImg from "@/assets/hero-cinematic.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative isolate">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="Cinematic studio background with golden light" className="w-full h-[70vh] object-cover" loading="eager" />
        <div className="absolute inset-0 bg-hero-overlay" />
      </div>
      <div className="container min-h-[70vh] flex flex-col justify-center items-start">
        <h1 className="text-4xl md:text-6xl font-extrabold max-w-3xl animate-fade-up">
          From Idea to Screen — In One Click.
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-up" style={{animationDelay:"80ms"}}>
          Turn your summary into a full Hollywood screenplay, perfectly scaled to your movie length.
        </p>
        <div className="mt-8 flex items-center gap-3 animate-fade-up" style={{animationDelay:"160ms"}}>
          <Link to="/create"><Button variant="hero" size="xl" className="shadow-gold">Start Writing Now</Button></Link>
          <Link to="#how"><Button variant="secondary" size="xl">See How It Works</Button></Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
