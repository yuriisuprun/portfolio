export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "it"];

const SUPPORTED_SET = new Set(SUPPORTED_LOCALES);

export function normalizeLocale(input) {
  if (!input) return null;
  if (typeof input !== "string") return null;

  // Accept "en", "it", and BCP-47-ish inputs like "en-US".
  const lowered = input.trim().toLowerCase();
  if (!lowered) return null;

  const base = lowered.split(/[-_]/)[0];
  return base || null;
}

export function isSupportedLocale(locale) {
  return SUPPORTED_SET.has(locale);
}

export function coerceSupportedLocale(input, fallback = DEFAULT_LOCALE) {
  const normalized = normalizeLocale(input);
  return normalized && isSupportedLocale(normalized) ? normalized : fallback;
}

export function getPreferredLocaleFromNavigator(fallback = DEFAULT_LOCALE) {
  if (typeof navigator === "undefined") return fallback;

  // Prefer navigator.languages; fall back to navigator.language.
  const languages = Array.isArray(navigator.languages) ? navigator.languages : [];
  for (const lang of languages) {
    const coerced = coerceSupportedLocale(lang, null);
    if (coerced) return coerced;
  }

  return coerceSupportedLocale(navigator.language, fallback);
}

