import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Stack,
  Box,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "../../i18n";
import { alpha, lighten } from "@mui/material/styles";

const MODERN_FONT_STACK = '"Inter","Rubik","Roboto","Helvetica","Arial",sans-serif';

const FIELD_LABELS = {
  verification: {
    identity_status: "profile.fields.identityStatus",
    contact_status: "profile.fields.contactStatus",
    phone_number: "profile.fields.phoneNumber",
  },
  personal: {
    bio: "profile.fields.bio",
    gender: "profile.fields.gender",
    date_of_birth: "profile.fields.dateOfBirth",
    civil_status: "profile.fields.civilStatus",
    religion: "profile.fields.religion",
    religion_detail: "profile.fields.religionDetail",
    caste: "profile.fields.caste",
    height_cm: "profile.fields.heightCm",
    weight_kg: "profile.fields.weightKg",
    dietary_preference: "profile.fields.dietaryPreference",
    smoking: "profile.fields.smoking",
    alcohol: "profile.fields.alcohol",
    languages: "profile.fields.languages",
    interests: "profile.fields.interests",
  },
  residency: {
    location: "profile.fields.location",
    country_code: "profile.fields.countryCode",
    province: "profile.fields.province",
    district: "profile.fields.district",
    city: "profile.fields.city",
    postal_code: "profile.fields.postalCode",
  },
  education: {
    highest_education: "profile.fields.highestEducation",
    field_of_study: "profile.fields.fieldOfStudy",
    institution: "profile.fields.institution",
    employment_status: "profile.fields.employmentStatus",
    occupation: "profile.fields.occupation",
  },
  family: {
    father_occupation: "profile.fields.fatherOccupation",
    mother_occupation: "profile.fields.motherOccupation",
    siblings_count: "profile.fields.siblingsCount",
    siblings: "profile.fields.siblings",
  },
  horoscope: {
    horoscope_available: "profile.fields.horoscopeAvailable",
    birth_time: "profile.fields.birthTime",
    birth_place: "profile.fields.birthPlace",
    sinhala_raasi: "profile.fields.sinhalaRaasi",
    nakshatra: "profile.fields.nakshatra",
    horoscope: "profile.fields.horoscope",
  },
};

const BOOLEAN_FIELDS = new Set(["horoscope_available"]);
const STATUS_FIELDS = new Set(["identity_status", "contact_status"]);
const STATUS_LABEL_MAP = {
  verified: "profile.status.verified",
  pending: "profile.status.pending",
  not_verified: "profile.status.notVerified",
};

const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true" || value === "false") {
    return value === "true";
  }
  return null;
};

const isValueFilled = (value, field) => {
  if (BOOLEAN_FIELDS.has(field)) {
    const booleanValue = toBoolean(value);
    return booleanValue !== null;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
};

function ProfileSection({
  label,
  data,
  sectionKey,
  IconComponent,
  onEdit,
  disableEdit = false,
  surfaceColor,
}) {
  const { t } = useTranslation();
  const sectionLabels = FIELD_LABELS[sectionKey] || {};
  const rawData =
    data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const fieldKeys = Array.from(
    new Set([
      ...Object.keys(sectionLabels),
      ...Object.keys(rawData),
    ])
  );

  const totalFields = fieldKeys.length;
  const filledCount = fieldKeys.reduce((count, field) => {
    const value = rawData[field];
    return count + (isValueFilled(value, field) ? 1 : 0);
  }, 0);
  const completionPercentage =
    totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;
  const isSectionComplete = totalFields > 0 && filledCount === totalFields;
  const completionLabel = t("profile.summary.sectionCompletion", {
    completed: filledCount,
    total: totalFields,
  });

  const resolvedSurface = surfaceColor || lighten("#111827", 0.04);
  const editAccent = "#ff4f87";
  const completeAccent = "#8fdc97";

  return (
    <Accordion
      disableGutters
      square={false}
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 3,
        border: "1px solid rgba(255, 255, 255, 0.04)",
        backgroundColor: resolvedSurface,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
        "&::before": {
          display: "none",
        },
        "&:hover": {
          borderColor: editAccent,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
          transform: "translateY(-2px)",
        },
        "&.Mui-expanded": {
          margin: 0,
          borderColor: editAccent,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.35)",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={(theme) => ({
          "& .MuiAccordionSummary-content": {
            margin: 0,
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            transition: theme.transitions.create("transform", {
              duration: theme.transitions.duration.shortest,
            }),
          },
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(180deg)",
          },
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.75, sm: 2 },
          gap: 2,
          backgroundColor: "transparent",
          ...(isSectionComplete
            ? {
                opacity: 0.65,
                "&:hover": {
                  opacity: 0.85,
                },
              }
            : {}),
        })}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ width: "100%" }}
        >
          {IconComponent && (
            <Box
              sx={(theme) => ({
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                flexShrink: 0,
              })}
            >
              <IconComponent fontSize="small" />
            </Box>
          )}
          <Stack spacing={1.75} sx={{ flexGrow: 1, width: "100%" }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1.25}
              sx={{ width: "100%" }}
            >
              <Typography
                variant="subtitle1"
                color={isSectionComplete ? "text.secondary" : "text.primary"}
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  fontFamily: MODERN_FONT_STACK,
                }}
              >
                {label}
              </Typography>
              {totalFields > 0 && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    flexWrap: "wrap",
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                    gap: 1,
                  }}
                >
                  {isSectionComplete && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 999,
                        backgroundColor: alpha(completeAccent, 0.18),
                        color: completeAccent,
                        fontFamily: MODERN_FONT_STACK,
                        fontWeight: 600,
                        fontSize: 12,
                        letterSpacing: 0.4,
                      }}
                    >
                      <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {t("profile.status.complete", { defaultValue: "Complete" })}
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 1.25,
                      py: 0.35,
                      borderRadius: 999,
                      background: "linear-gradient(90deg, rgba(255,79,135,0.16) 0%, rgba(255,122,168,0.16) 100%)",
                      color: "#ffb6cf",
                      fontFamily: MODERN_FONT_STACK,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      fontSize: 12,
                    }}
                  >
                    {`${completionPercentage}%`}
                  </Box>
                </Stack>
              )}
            </Stack>
            {totalFields > 0 && (
              <Stack spacing={0.75} sx={{ width: "100%", maxWidth: { xs: "100%", sm: 420 } }}>
                <Box sx={{ position: "relative", width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercentage}
                    aria-label={completionLabel}
                    sx={{
                      height: 8,
                      borderRadius: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      overflow: "hidden",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 8,
                        backgroundImage:
                          "linear-gradient(90deg, #ff4f87 0%, #ff7aa8 100%)",
                        transition: "width 0.5s ease",
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: MODERN_FONT_STACK,
                    letterSpacing: 0.4,
                    color: "rgba(226, 232, 240, 0.72)",
                  }}
                >
                  {completionLabel}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
        {onEdit && (
          <Tooltip
            title={t("profile.buttons.editSection", { defaultValue: "Edit" })}
            enterDelay={200}
          >
            <span>
              <IconButton
                size="medium"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                disabled={disableEdit}
                aria-label={t("profile.buttons.editSection", {
                  defaultValue: "Edit",
                })}
                sx={{
                  ml: { xs: 0, md: 1.5 },
                  alignSelf: { xs: "flex-start", md: "center" },
                  color: editAccent,
                  borderRadius: 2,
                  border: `1px solid ${alpha(editAccent, 0.6)}`,
                  backgroundColor: alpha(editAccent, 0.12),
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    backgroundColor: alpha(editAccent, 0.2),
                    boxShadow: "0 4px 12px rgba(255, 79, 135, 0.3)",
                  },
                  "&.Mui-disabled": {
                    opacity: 0.45,
                    color: alpha("#ffffff", 0.5),
                    borderColor: alpha("#ffffff", 0.12),
                    backgroundColor: alpha("#ffffff", 0.04),
                    boxShadow: "none",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: 2.5,
          py: 2.5,
          borderTop: (theme) => `1px solid ${lighten(theme.palette.divider, 0.3)}`,
        }}
      >
        <Grid container spacing={2}>
          {fieldKeys.map((field) => {
            const labelKey = sectionLabels[field];
            const resolvedLabel = labelKey ? t(labelKey) : formatLabel(field);
            const rawValue = rawData[field];
            let isFilled = isValueFilled(rawValue, field);
            let displayValue = Array.isArray(rawValue)
              ? rawValue.join(", ")
              : rawValue;

            if (BOOLEAN_FIELDS.has(field)) {
              const booleanValue = toBoolean(rawValue);
              if (booleanValue !== null) {
                displayValue = booleanValue
                  ? t("profile.options.boolean.yes")
                  : t("profile.options.boolean.no");
                isFilled = true;
              }
            }

            if (sectionKey === "verification" && STATUS_FIELDS.has(field)) {
              if (rawValue) {
                isFilled = true;
              }
              displayValue = t(STATUS_LABEL_MAP[rawValue] || STATUS_LABEL_MAP.not_verified);
            }

            if (!isFilled) {
              displayValue = t("common.placeholders.notAvailable");
            }

            return (
              <Grid item xs={12} sm={6} key={field}>
                <Stack
                  spacing={0.5}
                  sx={(theme) => ({
                    px: 1.75,
                    py: 1.5,
                    borderRadius: 1.5,
                    border: `1px solid ${lighten(theme.palette.divider, 0.2)}`,
                    backgroundColor: lighten(theme.palette.background.paper, 0.04),
                  })}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.4,
                      fontFamily: MODERN_FONT_STACK,
                    }}
                  >
                    {resolvedLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={isFilled ? "text.primary" : "text.secondary"}
                    sx={{
                      fontStyle: isFilled ? "normal" : "italic",
                      fontFamily: MODERN_FONT_STACK,
                    }}
                  >
                    {displayValue}
                  </Typography>
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default ProfileSection;
