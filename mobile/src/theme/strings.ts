export const headerHiMap: Record<string, string> = {
  "Kundli": "कुंडली",
  "Daily Horoscope": "दैनिक राशिफल",
  "Panchang": "पंचांग",
  "Kundli Matching": "कुंडली मिलान",
  "Mangal Dosha": "मंगल दोष",
  "Kal Sarp Dosh": "काल सर्प दोष",
  "Baby Name Suggestion": "शिशु नाम सुझाव",
  "Career Counselling": "कैरियर परामर्श",
  "Life Report": "जीवन रिपोर्ट",
  "Year Analysis": "वार्षिक विश्लेषण",
  "Astrologers": "ज्योतिषी",
  "Services": "सेवाएँ",
  "Wallet": "वॉलेट",
  "Profile": "प्रोफ़ाइल",
  "AI Gurus": "एआई गुरु",
};

export const slugHiMap: Record<string, string> = {
  "ai-chat": "एआई ज्योतिष चैट",
  "kundli": "कुंडली / जन्म कुंडली",
  "matching": "कुंडली मिलान",
  "panchang": "पंचांग",
  "horoscope": "दैनिक राशिफल",
  "lal-kitab": "लाल किताब",
  "gochar-phal": "गोचर फल",
  "career-counselling": "कैरियर परामर्श",
  "life-report": "जीवन रिपोर्ट",
  "year-analysis": "वार्षिक विश्लेषण",
  "baby-name": "शिशु नाम",
  "mangal-dosha": "मंगल दोष",
  "kal-sarp-dosh": "काल सर्प दोष",
  "gemstone": "रत्न भंडार",
};

// Extend header mappings using available slug translations where helpful
// This keeps Header titles bilingual without duplicating strings.
// For example, map "Gochar Phal" to the same Hindi used for slug "gochar-phal".
(headerHiMap as any)["Gochar Phal"] = (slugHiMap as any)["gochar-phal"] || (headerHiMap as any)["Gochar Phal"];

export function bi(en?: string, hi?: string) {
  if (!en) return hi || "";
  if (!hi) return en;
  return `${en} (${hi})`;
}

export function biTitleFromHeader(title?: string) {
  if (!title) return title || "";
  const hi = headerHiMap[title] || undefined;
  return bi(title, hi);
}

export function biServiceTitle(en: string, slug: string) {
  const hi = slugHiMap[slug] || undefined;
  return bi(en, hi);
}
