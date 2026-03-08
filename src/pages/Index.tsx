import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingDown, Truck, ShoppingBag, Recycle } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import farmVeggies from "@/assets/farm-veggies.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  { icon: Recycle, title: "Reduce Food Waste", desc: "Give imperfect crops a second chance instead of going to landfills." },
  { icon: TrendingDown, title: "Discounted Prices", desc: "Buy fresh produce at lower prices. Good for your wallet and the planet." },
  { icon: Truck, title: "Easy Delivery", desc: "Get crops delivered to your door with our driver network." },
  { icon: ShoppingBag, title: "Support Local Farmers", desc: "Help Malaysian farmers earn income from every harvest." },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroFarm} alt="Malaysian farmland" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="font-heading font-bold text-2xl text-primary-foreground">OddHarvest</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-primary-foreground leading-tight">
              Perfectly Imperfect, <br />
              <span className="text-primary">Deliciously Affordable</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-lg">
              Malaysia's marketplace for imperfect but edible crops. Help reduce food waste while saving money on fresh produce.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button size="lg" className="rounded-full text-base px-8">
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cute veggies banner */}
      <section className="bg-farm-green-light py-6 flex justify-center">
        <img src={farmVeggies} alt="Cute farm vegetables" className="h-20 md:h-28 animate-bounce-gentle" />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            Why OddHarvest? 🌱
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every odd-looking crop deserves a home. Join thousands of Malaysians fighting food waste.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="farm-card p-6 text-center space-y-4 hover:-translate-y-1 transition-transform">
              <div className="h-14 w-14 rounded-2xl bg-farm-green-light flex items-center justify-center mx-auto">
                <f.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-12">How It Works 🚜</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Farmers List Crops", desc: "Upload imperfect but edible crops with discounted prices." },
              { step: "2", title: "Buyers Shop & Save", desc: "Browse, compare prices, and add to cart at great discounts." },
              { step: "3", title: "Pickup or Delivery", desc: "Self-pickup or let our drivers deliver fresh crops to you." },
            ].map((s, i) => (
              <div key={i} className="space-y-3">
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center mx-auto text-primary-foreground font-heading font-bold text-xl">
                  {s.step}
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Ready to Rescue Some Crops? 🥕</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Join OddHarvest today and be part of Malaysia's food waste solution.
        </p>
        <Link to="/auth">
          <Button size="lg" className="rounded-full text-base px-10">Get Started</Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
