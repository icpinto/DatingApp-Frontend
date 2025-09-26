import React, { useCallback, useEffect, useState } from "react";
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

const DEFAULT_PREFERENCES = {
  minAge: 25,
  maxAge: 40,
  gender: "any",
  drinkingHabit: "any",
};

const AGE_RANGE = { min: 18, max: 80 };

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

const clampAge = (value) =>
  Math.min(Math.max(Number.isFinite(value) ? value : AGE_RANGE.min, AGE_RANGE.min), AGE_RANGE.max);

function CorePreferencesForm({ onStatusChange }) {
  const userId = localStorage.getItem("user_id") || "";
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [hasSavedPreferences, setHasSavedPreferences] = useState(false);

  const notifyStatus = useCallback(
    (status) => {
      onStatusChange?.(status);
    },
    [onStatusChange]
  );

  useEffect(() => {
    notifyStatus({ isLoading: loading || saving, isReady: hasSavedPreferences });
  }, [loading, saving, hasSavedPreferences, notifyStatus]);

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
    };

    if (normalized.minAge > normalized.maxAge) {
      normalized.minAge = clampAge(DEFAULT_PREFERENCES.minAge);
      normalized.maxAge = clampAge(DEFAULT_PREFERENCES.maxAge);
    }

    setPreferences(normalized);
    setHasSavedPreferences(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      if (!userId) {
        setLoading(false);
        notifyStatus({ isLoading: false, isReady: false });
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

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, [applyLoadedPreferences, notifyStatus, userId]);

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

  const handleSave = async () => {
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
      const response = await matchPreferencesService.saveCorePreferences(
        userId,
        preferences
      );
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
          {loading ? (
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

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving}
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
