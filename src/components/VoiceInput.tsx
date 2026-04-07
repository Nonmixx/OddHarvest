import { useState, useCallback, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
}

type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

type SpeechRecognitionErrorEventLike = {
  error: SpeechRecognitionErrorCode | string;
};

type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  zh: "zh-CN",
  ms: "ms-MY",
};

const UI_TEXT = {
  unsupported: {
    en: "Voice input is not supported in this browser. Please use Chrome or Edge.",
    zh: "此浏览器不支持语音输入。请使用 Chrome 或 Edge。",
    ms: "Input suara tidak disokong dalam pelayar ini. Sila gunakan Chrome atau Edge.",
  },
  listening: {
    en: "🎤 Listening... Speak now",
    zh: "🎤 正在聆听... 请开始说话",
    ms: "🎤 Sedang mendengar... Sila bercakap sekarang",
  },
  denied: {
    en: "Microphone access denied. Please allow microphone permissions.",
    zh: "麦克风访问被拒绝。请允许麦克风权限。",
    ms: "Akses mikrofon ditolak. Sila benarkan kebenaran mikrofon.",
  },
  noSpeech: {
    en: "No speech detected. Please try again.",
    zh: "未检测到语音。请再试一次。",
    ms: "Tiada suara dikesan. Sila cuba lagi.",
  },
  network: {
    en: "Network error. Voice input requires an internet connection.",
    zh: "网络错误。语音输入需要互联网连接。",
    ms: "Ralat rangkaian. Input suara memerlukan sambungan internet.",
  },
  genericError: {
    en: "Voice input error:",
    zh: "语音输入错误：",
    ms: "Ralat input suara:",
  },
  retry: {
    en: "Please try again.",
    zh: "请再试一次。",
    ms: "Sila cuba lagi.",
  },
  heard: {
    en: "Heard:",
    zh: "识别到：",
    ms: "Didengar:",
  },
  failed: {
    en: "Failed to start voice input. Please check browser permissions.",
    zh: "无法启动语音输入。请检查浏览器权限。",
    ms: "Gagal memulakan input suara. Sila semak kebenaran pelayar.",
  },
  stopTitle: {
    en: "Stop listening",
    zh: "停止聆听",
    ms: "Hentikan pendengaran",
  },
  startTitle: {
    en: "Voice input",
    zh: "语音输入",
    ms: "Input suara",
  },
};

const VoiceInput = ({ onResult, className = "" }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const { language } = useLanguage();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const startListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (
      window as unknown as { SpeechRecognition?: SpeechRecognitionConstructorLike; webkitSpeechRecognition?: SpeechRecognitionConstructorLike }
    ).SpeechRecognition
      ?? (
        window as unknown as { SpeechRecognition?: SpeechRecognitionConstructorLike; webkitSpeechRecognition?: SpeechRecognitionConstructorLike }
      ).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(UI_TEXT.unsupported[language]);
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
        toast.info(UI_TEXT.listening[language]);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        recognitionRef.current = null;
        const errorMsg = event.error === "not-allowed"
          ? UI_TEXT.denied[language]
          : event.error === "no-speech"
          ? UI_TEXT.noSpeech[language]
          : event.error === "network"
          ? UI_TEXT.network[language]
          : `${UI_TEXT.genericError[language]} ${event.error}. ${UI_TEXT.retry[language]}`;
        toast.error(errorMsg);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        toast.success(`${UI_TEXT.heard[language]} "${transcript}"`);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      toast.error(UI_TEXT.failed[language]);
    }
  }, [onResult, language, isListening]);

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      className={`shrink-0 ${className}`}
      onClick={startListening}
      title={isListening ? UI_TEXT.stopTitle[language] : UI_TEXT.startTitle[language]}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceInput;
