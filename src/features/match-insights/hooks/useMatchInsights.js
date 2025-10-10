import { useCallback } from "react";
import {
  getPreferences,
  createPreferences,
  updatePreferences,
  getQuestionnaire,
  saveQuestionnaire,
  getQuestionnaireCategories,
} from "../api/matchInsights.api";

export function usePreferences() {
  const load = useCallback(() => getPreferences(), []);

  const save = useCallback(
    (preferences, { hasExisting = false } = {}) => {
      return hasExisting
        ? updatePreferences(preferences)
        : createPreferences(preferences);
    },
    []
  );

  return { getPreferences: load, savePreferences: save };
}

export function useQuestionnaire() {
  const load = useCallback((params) => getQuestionnaire(params), []);
  const save = useCallback((payload) => saveQuestionnaire(payload), []);
  const loadCategories = useCallback(
    () => getQuestionnaireCategories(),
    []
  );

  return {
    getQuestionnaire: load,
    saveQuestionnaire: save,
    getQuestionnaireCategories: loadCategories,
  };
}
