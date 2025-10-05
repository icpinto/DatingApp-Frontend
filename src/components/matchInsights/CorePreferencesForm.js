import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Skeleton,
  Slider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import matchPreferencesService from "../../services/matchPreferences";
import { spacing } from "../../styles";
import { useAccountLifecycle } from "../../context/AccountLifecycleContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../utils/accountLifecycle";

const DEFAULT_PREFERENCES = {
  minAge: 25,
  maxAge: 40,
  gender: "any",
  drinkingHabit: "any",
  educationLevel: "any",
  smokingHabit: "any",
  countryOfResidence: "",
  occupationStatus: "any",
  civilStatus: "any",
  religion: "any",
  minHeight: 155,
  maxHeight: 190,
  foodPreference: "any",
};

const AGE_RANGE = { min: 18, max: 80 };
const HEIGHT_RANGE = { min: 120, max: 220 };

const GENDER_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
];

const DRINKING_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "never", label: "Never" },
  { value: "social", label: "Socially" },
  { value: "often", label: "Often" },
];

const EDUCATION_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "high_school", label: "High School" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
  { value: "other", label: "Other" },
];

const SMOKING_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "never", label: "Never" },
  { value: "occasionally", label: "Occasionally" },
  { value: "regularly", label: "Regularly" },
];

const OCCUPATION_STATUS_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "student", label: "Student" },
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "business_owner", label: "Business owner" },
  { value: "not_working", label: "Not working" },
];

const CIVIL_STATUS_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "single", label: "Single" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
];

const RELIGION_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "agnostic", label: "Agnostic" },
  { value: "atheist", label: "Atheist" },
  { value: "christian", label: "Christian" },
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "spiritual", label: "Spiritual" },
  { value: "other", label: "Other" },
];

const FOOD_PREFERENCE_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "omnivore", label: "Omnivore" },
  { value: "pescatarian", label: "Pescatarian" },
];

const clampAge = (value) =>
  Math.min(Math.max(Number.isFinite(value) ? value : AGE_RANGE.min, AGE_RANGE.min), AGE_RANGE.max);

const clampHeight = (value) =>
  Math.min(
    Math.max(Number.isFinite(value) ? value : HEIGHT_RANGE.min, HEIGHT_RANGE.min),
    HEIGHT_RANGE.max
  );

function CorePreferencesForm({ onStatusChange }) {
  const userId = localStorage.getItem("user_id") || "";
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [hasSavedPreferences, setHasSavedPreferences] = useState(false);
  const { isDeactivated, loading: lifecycleLoading } = useAccountLifecycle();
  const preferencesDisabled = useMemo(
    () => !lifecycleLoading && isDeactivated,
    [isDeactivated, lifecycleLoading]
  );

  const notifyStatus = useCallback(
    (status) => {
      onStatusChange?.(status);
    },
    [onStatusChange]
  );

  useEffect(() => {
    notifyStatus({
      isLoading: loading || saving || lifecycleLoading,
      isReady: !preferencesDisabled && hasSavedPreferences,
    });
  }, [
    loading,
    saving,
    hasSavedPreferences,
    notifyStatus,
    lifecycleLoading,
    preferencesDisabled,
  ]);

  const applyLoadedPreferences = useCallback((data) => {
    if (!data) {
      setPreferences(DEFAULT_PREFERENCES);
      setHasSavedPreferences(false);
      return;
    }

    const normalized = {
      minAge: clampAge(Number(data.min_age ?? data.minAge ?? DEFAULT_PREFERENCES.minAge)),
      maxAge: clampAge(Number(data.max_age ?? data.maxAge ?? DEFAULT_PREFERENCES.maxAge)),
      gender: data.gender || DEFAULT_PREFERENCES.gender,
      drinkingHabit: data.drinking_habit || DEFAULT_PREFERENCES.drinkingHabit,
      educationLevel: data.education_level || DEFAULT_PREFERENCES.educationLevel,
      smokingHabit: data.smoking_habit || DEFAULT_PREFERENCES.smokingHabit,
      countryOfResidence:
        data.country_of_residence || data.countryOfResidence || DEFAULT_PREFERENCES.countryOfResidence,
      occupationStatus: data.occupation_status || DEFAULT_PREFERENCES.occupationStatus,
      civilStatus: data.civil_status || DEFAULT_PREFERENCES.civilStatus,
      religion: data.religion || DEFAULT_PREFERENCES.religion,
      minHeight: clampHeight(
        Number(data.min_height ?? data.minHeight ?? DEFAULT_PREFERENCES.minHeight)
      ),
      maxHeight: clampHeight(
        Number(data.max_height ?? data.maxHeight ?? DEFAULT_PREFERENCES.maxHeight)
      ),
      foodPreference: data.food_preference || DEFAULT_PREFERENCES.foodPreference,
    };

    if (normalized.minAge > normalized.maxAge) {
      normalized.minAge = clampAge(DEFAULT_PREFERENCES.minAge);
      normalized.maxAge = clampAge(DEFAULT_PREFERENCES.maxAge);
    }

    if (normalized.minHeight > normalized.maxHeight) {
      normalized.minHeight = clampHeight(DEFAULT_PREFERENCES.minHeight);
      normalized.maxHeight = clampHeight(DEFAULT_PREFERENCES.maxHeight);
    }

    setPreferences(normalized);
    setHasSavedPreferences(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await matchPreferencesService.getCorePreferences(userId);
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

    if (lifecycleLoading) {
      return () => {
        isMounted = false;
      };
    }

    if (preferencesDisabled) {
      if (isMounted) {
        setLoading(false);
        setHasSavedPreferences(false);
        setPreferences(DEFAULT_PREFERENCES);
      }
      return () => {
        isMounted = false;
      };
    }

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, [
    applyLoadedPreferences,
    lifecycleLoading,
    preferencesDisabled,
    userId,
  ]);

  const setAgeRange = useCallback((newRange) => {
    setPreferences((prev) => {
      const [rawMin, rawMax] = newRange;
      const minAge = clampAge(rawMin);
      const maxAge = clampAge(rawMax);
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
      const minHeight = clampHeight(rawMin);
      const maxHeight = clampHeight(rawMax);
      return {
        ...prev,
        minHeight: Math.min(minHeight, maxHeight),
        maxHeight: Math.max(minHeight, maxHeight),
      };
    });
    setHasSavedPreferences(false);
  }, []);

  const handleAgeTextChange = (key) => (event) => {
    const value = clampAge(Number(event.target.value));
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      if (updated.minAge > updated.maxAge) {
        if (key === "minAge") {
          updated.maxAge = value;
        } else {
          updated.minAge = value;
        }
      }
      return updated;
    });
    setHasSavedPreferences(false);
  };

  const handleHeightTextChange = (key) => (event) => {
    const value = clampHeight(Number(event.target.value));
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      if (updated.minHeight > updated.maxHeight) {
        if (key === "minHeight") {
          updated.maxHeight = value;
        } else {
          updated.minHeight = value;
        }
      }
      return updated;
    });
    setHasSavedPreferences(false);
  };

  const handleSave = async () => {
    if (preferencesDisabled) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: ACCOUNT_DEACTIVATED_MESSAGE,
      });
      return;
    }

    if (!userId) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "You need to be logged in to save preferences.",
      });
      return;
    }

    setSaving(true);
    try {
      const saveFn = hasSavedPreferences
        ? matchPreferencesService.updateCorePreferences
        : matchPreferencesService.saveCorePreferences;
      const response = await saveFn(userId, preferences);
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
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <SettingsIcon />
            </Avatar>
          }
          title="Core Match Preferences"
          subheader="Set the non-negotiables to filter your matches"
        />
        <Divider />
        <CardContent>
          {preferencesDisabled ? (
            <Alert severity="warning">{ACCOUNT_DEACTIVATED_MESSAGE}</Alert>
          ) : showLoadingState ? (
            <Stack spacing={spacing.section}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : (
            <Stack spacing={spacing.section}>
              {!hasSavedPreferences && (
                <Alert severity="info">
                  Save your deal-breakers to unlock the full questionnaire.
                </Alert>
              )}
              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Preferred Age Range</Typography>
                <Slider
                  value={[preferences.minAge, preferences.maxAge]}
                  onChange={(_, newValue) => setAgeRange(newValue)}
                  onChangeCommitted={(_, newValue) => setAgeRange(newValue)}
                  min={AGE_RANGE.min}
                  max={AGE_RANGE.max}
                  valueLabelDisplay="auto"
                  disableSwap
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Min age"
                      type="number"
                      value={preferences.minAge}
                      onChange={handleAgeTextChange("minAge")}
                      fullWidth
                      inputProps={{ min: AGE_RANGE.min, max: AGE_RANGE.max }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Max age"
                      type="number"
                      value={preferences.maxAge}
                      onChange={handleAgeTextChange("maxAge")}
                      fullWidth
                      inputProps={{ min: AGE_RANGE.min, max: AGE_RANGE.max }}
                    />
                  </Grid>
                </Grid>
              </Stack>

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Preferred gender"
                  value={preferences.gender}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({ ...prev, gender: value }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Partner's education level"
                  value={preferences.educationLevel}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      educationLevel: value,
                    }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {EDUCATION_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Partner's drinking habits"
                  value={preferences.drinkingHabit}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      drinkingHabit: value,
                    }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {DRINKING_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Partner's smoking habits"
                  value={preferences.smokingHabit}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      smokingHabit: value,
                    }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {SMOKING_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Preferred Height Range (cm)</Typography>
                <Slider
                  value={[preferences.minHeight, preferences.maxHeight]}
                  onChange={(_, newValue) => setHeightRange(newValue)}
                  onChangeCommitted={(_, newValue) => setHeightRange(newValue)}
                  min={HEIGHT_RANGE.min}
                  max={HEIGHT_RANGE.max}
                  valueLabelDisplay="auto"
                  disableSwap
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Min height"
                      type="number"
                      value={preferences.minHeight}
                      onChange={handleHeightTextChange("minHeight")}
                      fullWidth
                      inputProps={{ min: HEIGHT_RANGE.min, max: HEIGHT_RANGE.max }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Max height"
                      type="number"
                      value={preferences.maxHeight}
                      onChange={handleHeightTextChange("maxHeight")}
                      fullWidth
                      inputProps={{ min: HEIGHT_RANGE.min, max: HEIGHT_RANGE.max }}
                    />
                  </Grid>
                </Grid>
              </Stack>

              <TextField
                fullWidth
                label="Country of residence"
                value={preferences.countryOfResidence}
                onChange={(event) => {
                  const value = event.target.value;
                  setPreferences((prev) => ({
                    ...prev,
                    countryOfResidence: value,
                  }));
                  setHasSavedPreferences(false);
                }}
              />

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Occupation status"
                  value={preferences.occupationStatus}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      occupationStatus: value,
                    }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {OCCUPATION_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Civil status"
                  value={preferences.civilStatus}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      civilStatus: value,
                    }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {CIVIL_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Religion"
                  value={preferences.religion}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      religion: value,
                    }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {RELIGION_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <TextField
                  select
                  fullWidth
                  label="Food preference"
                  value={preferences.foodPreference}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      foodPreference: value,
                    }));
                    setHasSavedPreferences(false);
                  }}
                >
                  {FOOD_PREFERENCE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving || preferencesDisabled}
                >
                  {saving ? "Saving..." : hasSavedPreferences ? "Update" : "Save"}
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

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

export default CorePreferencesForm;
