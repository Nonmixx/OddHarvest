import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";

interface StepImageProps {
  stepDescription: string;
  dishName: string;
  stepNumber: number;
  mode: "meal" | "preservation";
}

// Cache generated images in memory to avoid re-generating
const imageCache = new Map<string, string>();

const StepImage = ({ stepDescription, dishName, stepNumber, mode }: StepImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const cacheKey = `${mode}-${dishName}-${stepNumber}-${stepDescription}`;

  useEffect(() => {
    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached) {
      setImageUrl(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const generateImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const { data, error } = await supabase.functions.invoke("generate-step-image", {
          body: { stepDescription, dishName, stepNumber, mode },
        });

        if (cancelled) return;

        if (error || data?.error) {
          setHasError(true);
          setIsLoading(false);
          return;
        }

        if (data?.imageUrl) {
          imageCache.set(cacheKey, data.imageUrl);
          setImageUrl(data.imageUrl);
        } else {
          setHasError(true);
        }
      } catch {
        if (!cancelled) setHasError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    generateImage();

    return () => { cancelled = true; };
  }, [cacheKey, stepDescription, dishName, stepNumber, mode]);

  if (isLoading) {
    return (
      <Skeleton className="w-full h-40 rounded-lg" />
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className="w-full h-32 rounded-lg bg-muted/50 flex items-center justify-center">
        <ImageOff className="h-6 w-6 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Step ${stepNumber}: ${stepDescription}`}
      className="w-full h-40 object-cover rounded-lg border border-border"
      loading="lazy"
    />
  );
};

export default StepImage;
