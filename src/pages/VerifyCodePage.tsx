import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";

const VerifyCodePage = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";
  const { t } = useLanguage();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;
    setLoading(true);

    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      toast({
        title: t("verify.success_title"),
        description: t("verify.success_desc"),
      });
      navigate("/auth");
    }, 1000);
  };

  const handleResend = () => {
    toast({
      title: t("forgot.code_sent_title"),
      description: t("forgot.code_sent_desc"),
    });
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
              {t("verify.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("verify.desc")}{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold">{t("verify.enter_code")}</p>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              size="lg"
              disabled={loading || code.length !== 4}
            >
              {loading ? t("verify.verifying") : t("verify.verify_btn")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("verify.no_code")}{" "}
            <button
              onClick={handleResend}
              className="text-primary font-medium hover:underline"
            >
              {t("verify.resend")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;
