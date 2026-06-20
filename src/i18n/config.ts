const locales = ["en", "fr", "ar"] as const;
const defaultLocale = "en" as const;
type Locale = (typeof locales)[number];
export type { Locale };
export { locales, defaultLocale };
