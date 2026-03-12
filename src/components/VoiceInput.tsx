import { useState, useCallback, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
}

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  zh: "zh-CN",
  ms: "ms-MY",
};

const VoiceInput = ({ onResult, className = "" }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const { language } = useLanguage();
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    // If already listening, stop
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = LANG_MAP[language] || "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("🎤 Listening... Speak now");
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        recognitionRef.current = null;
        const errorMsg = event.error === "not-allowed"
          ? "Microphone access denied. Please allow microphone permissions."
          : event.error === "no-speech"
          ? "No speech detected. Please try again."
          : event.error === "network"
          ? "Network error. Voice input requires an internet connection."
          : `Voice input error: ${event.error}. Please try again.`;
        toast.error(errorMsg);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        toast.success(`Heard: "${transcript}"`);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      toast.error("Failed to start voice input. Please check browser permissions.");
    }
  }, [onResult, language, isListening]);

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      className={`shrink-0 ${className}`}
      onClick={startListening}
      title={isListening ? "Stop listening" : "Voice input"}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceInput;
