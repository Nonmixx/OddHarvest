import { Language } from "@/contexts/LanguageContext";

const textByLanguage = (language: Language, values: Record<Language, string>) => values[language];

export const getUnitLabel = (language: Language, unit: "kg" | "box") => {
  if (unit === "box") {
    return textByLanguage(language, { en: "box", zh: "盒", ms: "kotak" });
  }

  return textByLanguage(language, { en: "kg", zh: "公斤", ms: "kg" });
};

export const getPriceUnitLabel = (language: Language, unit: "kg" | "box") => {
  if (unit === "box") {
    return textByLanguage(language, { en: "/box", zh: "/盒", ms: "/kotak" });
  }

  return textByLanguage(language, { en: "/kg", zh: "/公斤", ms: "/kg" });
};

export const formatDistance = (distance: number, language: Language) =>
  textByLanguage(language, {
    en: `${distance} km`,
    zh: `${distance} 公里`,
    ms: `${distance} km`,
  });

export const getFreshnessInfo = (harvestDate: string, language: Language) => {
  const now = new Date();
  const harvest = new Date(harvestDate);
  const diffHours = (now.getTime() - harvest.getTime()) / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) {
    return {
      label: textByLanguage(language, { en: "Just Harvested", zh: "刚采收", ms: "Baru Dituai" }),
      emoji: "🟢",
      color: "text-primary",
      daysAgo: textByLanguage(language, { en: "Today", zh: "今天", ms: "Hari Ini" }),
    };
  }

  if (diffDays <= 2) {
    return {
      label: textByLanguage(language, { en: "Very Fresh", zh: "非常新鲜", ms: "Sangat Segar" }),
      emoji: "🟢",
      color: "text-primary",
      daysAgo: textByLanguage(language, {
        en: `${diffDays} day${diffDays > 1 ? "s" : ""} ago`,
        zh: `${diffDays} 天前`,
        ms: `${diffDays} hari lepas`,
      }),
    };
  }

  if (diffDays <= 4) {
    return {
      label: textByLanguage(language, { en: "Fresh", zh: "新鲜", ms: "Segar" }),
      emoji: "🟡",
      color: "text-farm-orange",
      daysAgo: textByLanguage(language, {
        en: `${diffDays} days ago`,
        zh: `${diffDays} 天前`,
        ms: `${diffDays} hari lepas`,
      }),
    };
  }

  return {
    label: textByLanguage(language, { en: "Harvest Soon", zh: "尽快食用", ms: "Guna Segera" }),
    emoji: "🟠",
    color: "text-farm-orange",
    daysAgo: textByLanguage(language, {
      en: `${diffDays} days ago`,
      zh: `${diffDays} 天前`,
      ms: `${diffDays} hari lepas`,
    }),
  };
};

export const getExpiryInfo = (expiryDate: string | undefined, language: Language) => {
  if (!expiryDate) return null;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffHoursRaw = diffMs / (1000 * 60 * 60);
  const diffHours = Math.floor(diffHoursRaw);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs <= 0) {
    return {
      label: textByLanguage(language, { en: "Expired", zh: "已过期", ms: "Tamat Tempoh" }),
      color: "text-destructive",
      urgent: true,
    };
  }

  if (diffDays === 0) {
    return {
      label: textByLanguage(language, {
        en: `${diffHours}h left`,
        zh: `剩余 ${diffHours} 小时`,
        ms: `${diffHours}j lagi`,
      }),
      color: "text-destructive",
      urgent: true,
    };
  }

  if (diffHoursRaw <= 72) {
    const dd = Math.max(0, Math.floor(diffHours / 24));
    return {
      label: textByLanguage(language, {
        en: `${dd}d ${diffHours % 24}h left`,
        zh: `剩余 ${dd} 天 ${diffHours % 24} 小时`,
        ms: `${dd}h ${diffHours % 24}j lagi`,
      }),
      color: "text-destructive",
      urgent: true,
    };
  }

  return {
    label: textByLanguage(language, {
      en: `${diffDays} days left`,
      zh: `剩余 ${diffDays} 天`,
      ms: `${diffDays} hari lagi`,
    }),
    color: diffDays <= 5 ? "text-farm-orange" : "text-primary",
    urgent: false,
  };
};
