import { useCallback } from "react";

import { useSettings } from "@/store/settings";

import { de } from "./de";
import { en, type StringKey } from "./en";

const dictionaries = { en, de } as const;

export type Translate = (key: StringKey) => string;

/**
 * PRD F7. Deliberately tiny — no i18n library, no network, no pluralisation.
 * Swap in a real library only if the string count ever justifies it.
 */
export function useT(): Translate {
  const language = useSettings((s) => s.language);
  return useCallback(
    (key: StringKey) => dictionaries[language][key] ?? en[key],
    [language],
  );
}

export type { StringKey };
