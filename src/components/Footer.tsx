import { Leaf } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-border py-10 mt-16">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold text-foreground">OddHarvest</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Rescuing imperfect crops, one harvest at a time. 🌿 Malaysia's marketplace against food waste.
        </p>
        <p className="text-xs text-muted-foreground">© 2026 OddHarvest</p>
      </div>
    </div>
  </footer>
);

export default Footer;
