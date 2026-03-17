import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // Simulate sending verification code
    setTimeout(() => {
      setLoading(false);
      toast({
        title: t("forgot.code_sent_title"),
        description: t("forgot.code_sent_desc"),
      });
      navigate("/verify-code", { state: { email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="farm-card p-6 space-y-6">
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("forgot.back_to_login")}
          </button>

          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {t("forgot.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("forgot.desc")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold">
                {t("forgot.email_label")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("forgot.email_placeholder")}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              size="lg"
              disabled={loading}
            >
              {loading ? t("forgot.sending") : t("forgot.send_btn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
