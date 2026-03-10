import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingDown, Truck, ShoppingBag, Recycle } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import farmVeggies from "@/assets/farm-veggies.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Recycle, titleKey: "feat.waste.title", descKey: "feat.waste.desc" },
    { icon: TrendingDown, titleKey: "feat.price.title", descKey: "feat.price.desc" },
    { icon: Truck, titleKey: "feat.delivery.title", descKey: "feat.delivery.desc" },
    { icon: ShoppingBag, titleKey: "feat.support.title", descKey: "feat.support.desc" },
  ];

  const steps = [
    { step: "1", titleKey: "how.1.title", descKey: "how.1.desc" },
    { step: "2", titleKey: "how.2.title", descKey: "how.2.desc" },
    { step: "3", titleKey: "how.3.title", descKey: "how.3.desc" },
  ];

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
              {t("hero.title1")} <br />
              <span className="text-primary">{t("hero.title2")}</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-lg">
              {t("hero.desc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button size="lg" className="rounded-full text-base px-8">
                  {t("hero.browse")}
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="rounded-full text-base px-8">
                  {t("hero.join")}
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
            {t("section.why")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("section.why.desc")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="farm-card p-6 text-center space-y-4 hover:-translate-y-1 transition-transform">
              <div className="h-14 w-14 rounded-2xl bg-farm-green-light flex items-center justify-center mx-auto">
                <f.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground">{t(f.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-12">{t("section.how")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="space-y-3">
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center mx-auto text-primary-foreground font-heading font-bold text-xl">
                  {s.step}
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg">{t(s.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-4">{t("section.cta")}</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t("section.cta.desc")}
        </p>
        <Link to="/auth">
          <Button size="lg" className="rounded-full text-base px-10">{t("section.cta.btn")}</Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
