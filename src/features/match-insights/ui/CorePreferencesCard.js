import React, { useCallback, useEffect, useState } from "react";
import { Alert, Skeleton, Snackbar, Stack } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { spacing } from "../../../styles";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../../domain/accountLifecycle";
import { useUserCapabilities, useUserContext } from "../../../shared/context/UserContext";
import PreferenceSliders from "./PreferenceSliders";
import SelectFields from "./SelectFields";
import SaveBar from "./SaveBar";
import {
  AGE_RANGE,
  HEIGHT_RANGE,
  DEFAULT_PREFERENCES,
} from "../model/types";
import { usePreferences } from "../hooks/useMatchInsights";
import FeatureCard from "../../../shared/components/FeatureCard";

const clampValue = (value, range) =>
  Math.min(Math.max(Number.isFinite(value) ? value : range.min, range.min), range.max);

function CorePreferencesCard({ onStatusChange, lifecycleLoading = false }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [hasSavedPreferences, setHasSavedPreferences] = useState(false);
  const { updateCorePreferencesStatus } = useUserContext();
  const { groups } = useUserCapabilities();
  const insightCapabilities = groups.insights;
  const editCapability = insightCapabilities.editCorePreferences;
  const saveCapability = insightCapabilities.saveCorePreferences;
  const canEditPreferences = editCapability.can;
  const canSavePreferences = saveCapability.can;
  const editRestrictionMessage =
    editCapability.reason || ACCOUNT_DEACTIVATED_MESSAGE;
  const saveRestrictionMessage =
    saveCapability.reason || editRestrictionMessage;
  const { getPreferences, savePreferences } = usePreferences();

  const notifyStatus = useCallback(
    (status = { isLoading: false, isReady: false }) => {
      onStatusChange?.(status);
      updateCorePreferencesStatus({
        loading: Boolean(status.isLoading),
        hasSaved: Boolean(status.isReady),
      });
    },
    [onStatusChange, updateCorePreferencesStatus]
  );

  useEffect(() => {
    notifyStatus({
      isLoading: loading || saving || lifecycleLoading,
      isReady: canEditPreferences && hasSavedPreferences,
    });
  }, [
    loading,
    saving,
    hasSavedPreferences,
    notifyStatus,
    lifecycleLoading,
    canEditPreferences,
  ]);

  const applyLoadedPreferences = useCallback((data) => {
    if (!data) {
      setPreferences(DEFAULT_PREFERENCES);
      setHasSavedPreferences(false);
      return;
    }

    const normalized = {
      minAge: clampValue(
        Number(data.min_age ?? data.minAge ?? DEFAULT_PREFERENCES.minAge),
        AGE_RANGE
      ),
      maxAge: clampValue(
        Number(data.max_age ?? data.maxAge ?? DEFAULT_PREFERENCES.maxAge),
        AGE_RANGE
      ),
      gender: data.gender || DEFAULT_PREFERENCES.gender,
      drinkingHabit:
        data.drinking_habit || data.drinkingHabit || DEFAULT_PREFERENCES.drinkingHabit,
      educationLevel:
        data.education_level || data.educationLevel || DEFAULT_PREFERENCES.educationLevel,
      smokingHabit:
        data.smoking_habit || data.smokingHabit || DEFAULT_PREFERENCES.smokingHabit,
      countryOfResidence:
        data.country_of_residence ||
        data.countryOfResidence ||
        DEFAULT_PREFERENCES.countryOfResidence,
      occupationStatus: data.occupation_status || DEFAULT_PREFERENCES.occupationStatus,
      civilStatus: data.civil_status || DEFAULT_PREFERENCES.civilStatus,
      religion: data.religion || DEFAULT_PREFERENCES.religion,
      minHeight: clampValue(
        Number(data.min_height ?? data.minHeight ?? DEFAULT_PREFERENCES.minHeight),
        HEIGHT_RANGE
      ),
      maxHeight: clampValue(
        Number(data.max_height ?? data.maxHeight ?? DEFAULT_PREFERENCES.maxHeight),
        HEIGHT_RANGE
      ),
      foodPreference:
        data.food_preference || DEFAULT_PREFERENCES.foodPreference,
    };

    if (normalized.minAge > normalized.maxAge) {
      normalized.minAge = clampValue(DEFAULT_PREFERENCES.minAge, AGE_RANGE);
      normalized.maxAge = clampValue(DEFAULT_PREFERENCES.maxAge, AGE_RANGE);
    }

    if (normalized.minHeight > normalized.maxHeight) {
      normalized.minHeight = clampValue(DEFAULT_PREFERENCES.minHeight, HEIGHT_RANGE);
      normalized.maxHeight = clampValue(DEFAULT_PREFERENCES.maxHeight, HEIGHT_RANGE);
    }

    setPreferences(normalized);
    setHasSavedPreferences(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (lifecycleLoading) {
      setLoading(true);
      return () => {
        isMounted = false;
      };
    }

    if (!canEditPreferences) {
      if (isMounted) {
        setLoading(false);
        setHasSavedPreferences(false);
        setPreferences(DEFAULT_PREFERENCES);
      }
      return () => {
        isMounted = false;
      };
    }

    const loadPreferences = async () => {
      setLoading(true);
      try {
        const data = await getPreferences();
        if (isMounted) {
          applyLoadedPreferences(data);
        }
      } catch (error) {
        console.error("Failed to load core preferences", error);
        if (isMounted) {
          setPreferences(DEFAULT_PREFERENCES);
          setHasSavedPreferences(false);
          setSnackbar({
            open: true,
            severity: "error",
            message: "Unable to load preferences. Please try again.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [
    applyLoadedPreferences,
    canEditPreferences,
    getPreferences,
    lifecycleLoading,
  ]);

  const setAgeRange = useCallback((newRange) => {
    setPreferences((prev) => {
      const [rawMin, rawMax] = newRange;
      const minAge = clampValue(rawMin, AGE_RANGE);
      const maxAge = clampValue(rawMax, AGE_RANGE);
      return {
        ...prev,
        minAge: Math.min(minAge, maxAge),
        maxAge: Math.max(minAge, maxAge),
      };
    });
    setHasSavedPreferences(false);
  }, []);

  const setHeightRange = useCallback((newRange) => {
    setPreferences((prev) => {
      const [rawMin, rawMax] = newRange;
      const minHeight = clampValue(rawMin, HEIGHT_RANGE);
      const maxHeight = clampValue(rawMax, HEIGHT_RANGE);
      return {
        ...prev,
        minHeight: Math.min(minHeight, maxHeight),
        maxHeight: Math.max(minHeight, maxHeight),
      };
    });
    setHasSavedPreferences(false);
  }, []);

  const handleAgeInputChange = useCallback((key, value) => {
    const clamped = clampValue(Number(value), AGE_RANGE);
    setPreferences((prev) => {
      const updated = { ...prev, [key]: clamped };
      if (updated.minAge > updated.maxAge) {
        if (key === "minAge") {
          updated.maxAge = clamped;
        } else {
          updated.minAge = clamped;
        }
      }
      return updated;
    });
    setHasSavedPreferences(false);
  }, []);

  const handleHeightInputChange = useCallback((key, value) => {
    const clamped = clampValue(Number(value), HEIGHT_RANGE);
    setPreferences((prev) => {
      const updated = { ...prev, [key]: clamped };
      if (updated.minHeight > updated.maxHeight) {
        if (key === "minHeight") {
          updated.maxHeight = clamped;
        } else {
          updated.minHeight = clamped;
        }
      }
      return updated;
    });
    setHasSavedPreferences(false);
  }, []);

  const handleFieldChange = useCallback((key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasSavedPreferences(false);
  }, []);

  const handleSave = async () => {
    if (!canSavePreferences) {
      setSnackbar({
        open: true,
        severity: "warning",
        message:
          saveRestrictionMessage ||
          "You do not have permission to save core preferences.",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await savePreferences(preferences, {
        hasExisting: hasSavedPreferences,
      });
      applyLoadedPreferences(response);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Core preferences saved",
      });
    } catch (error) {
      console.error("Failed to save core preferences", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to save preferences. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const showLoadingState = loading || lifecycleLoading;

  return (
    <>
      <FeatureCard
        title="Core Match Preferences"
        subheader="Set the non-negotiables to filter your matches"
        icon={SettingsIcon}
      >
        {!canEditPreferences ? (
          <Alert severity="warning">{editRestrictionMessage}</Alert>
        ) : showLoadingState ? (
          <Stack spacing={spacing.section}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : (
          <Stack spacing={spacing.section}>
            {!hasSavedPreferences && (
              <Alert severity="info">
                Save your deal-breakers to unlock the full questionnaire.
              </Alert>
            )}

            <PreferenceSliders
              preferences={preferences}
              ageRange={AGE_RANGE}
              heightRange={HEIGHT_RANGE}
              onAgeSliderChange={setAgeRange}
              onAgeInputChange={handleAgeInputChange}
              onHeightSliderChange={setHeightRange}
              onHeightInputChange={handleHeightInputChange}
            />

            <SelectFields
              preferences={preferences}
              onChange={handleFieldChange}
            />

            <SaveBar
              onSave={handleSave}
              saving={saving}
              canSave={canSavePreferences}
              hasSaved={hasSavedPreferences}
            />
          </Stack>
        )}
      </FeatureCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CorePreferencesCard;
