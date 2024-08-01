import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { MoveLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="fixed inset-0 mesh-gradient opacity-50 pointer-events-none" />

      <div className="relative glass-premium p-12 rounded-[3rem] text-center max-w-md w-full border-primary/20 shadow-2xl">
        <div className="w-24 h-24 rounded-[2rem] bg-secondary/50 flex items-center justify-center mx-auto mb-8 animate-float">
          <HelpCircle className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-8xl font-black tracking-tighter text-gradient mb-2 italic">404</h1>
        <p className="text-xl font-bold text-white mb-8">Route Lost in Space</p>

        <p className="text-muted-foreground text-sm mb-12 leading-relaxed font-medium">
          The task you are looking for has either been shifted in time or never existed in this routine.
        </p>

        <Link to="/">
          <Button variant="glow" className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest italic group">
            <MoveLeft className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" />
            Back to Base
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
