import React from "react";
import { translations } from "./translations.js";

/**
 * Language context — provides the active language code and a translator `t()`.
 * Default: English (returns the key as-is, since English strings ARE the keys).
 */
export const LanguageContext = React.createContext({
  language: "EN",
  t: (key) => key,
});

export const useLanguage = () => React.useContext(LanguageContext);

/**
 * Build a translator function for a given language code.
 * Pure factory — App.jsx wraps the result in useMemo keyed on `language`.
 */
export const makeT = (language) => (key, vars) => {
  let text = language === "TR" ? translations.tr?.[key] ?? key : key;
  if (vars) {
    Object.entries(vars).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });
  }
  return text;
};
