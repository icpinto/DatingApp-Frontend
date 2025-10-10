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
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "../../i18n";
import { alpha, lighten, useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";

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
}) {
  const { t } = useTranslation();
  const theme = useTheme();
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
  const isComplete = totalFields > 0 && filledCount === totalFields;
  const isInProgress = !isComplete && filledCount > 0;
  const accentColor = theme.palette.primary.main;
  const secondaryAccent = alpha(accentColor, 0.18);
  const expandedShadow = theme.shadows[6];

  return (
    <Accordion
      disableGutters
      square={false}
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 2,
        position: "relative",
        border: (theme) => `1px solid ${lighten(theme.palette.divider, 0.4)}`,
        borderLeft: `4px solid ${
          isComplete
            ? alpha(theme.palette.success.main, 0.7)
            : alpha(accentColor, 0.6)
        }`,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? alpha("#1d222b", 0.95)
            : lighten(theme.palette.background.paper, 0.04),
        "&::before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: 0,
          borderColor: (theme) => lighten(theme.palette.primary.main, 0.7),
          borderLeftColor: accentColor,
          boxShadow: expandedShadow,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={(theme) => ({
          minHeight: 0,
          "& .MuiAccordionSummary-content": {
            margin: 0,
            alignItems: "center",
            gap: theme.spacing(2.25),
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            color: alpha(theme.palette.text.secondary, 0.6),
            transition: theme.transitions.create("transform", {
              duration: theme.transitions.duration.shortest,
            }),
          },
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            transform: "rotate(180deg)",
            color: accentColor,
          },
          px: { xs: 2, sm: 2.75 },
          py: { xs: 1.5, sm: 1.75 },
          gap: 2,
          backgroundColor: "transparent",
          "&:hover .MuiAccordionSummary-expandIconWrapper": {
            color: accentColor,
          },
        })}
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
              backgroundColor: secondaryAccent,
              color: accentColor,
              flexShrink: 0,
            })}
          >
            <IconComponent fontSize="small" />
          </Box>
        )}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ width: "100%" }}
          spacing={2}
        >
          <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.2,
                lineHeight: 1.4,
              }}
            >
              {label}
            </Typography>
            {totalFields > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {isComplete
                  ? t("profile.summary.sectionCompleteLabel", {
                      defaultValue: "Everything here looks great",
                    })
                  : t("profile.summary.sectionReminder", {
                      defaultValue: "Complete these details to boost visibility",
                    })}
              </Typography>
            )}
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={{ xs: 1.25, sm: 2 }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {totalFields > 0 && (
              <Stack
                spacing={0.75}
                sx={{
                  minWidth: { xs: "100%", sm: 220 },
                  flexShrink: 0,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isComplete
                      ? alpha(theme.palette.success.main, 0.18)
                      : secondaryAccent,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      backgroundColor: isComplete
                        ? theme.palette.success.main
                        : accentColor,
                    },
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t("profile.summary.sectionCompletion", {
                      completed: filledCount,
                      total: totalFields,
                    })}
                  </Typography>
                  <Chip
                    size="small"
                    variant={isComplete ? "filled" : "outlined"}
                    color={isComplete ? "success" : "warning"}
                    icon={
                      isComplete ? (
                        <CheckCircleRoundedIcon fontSize="small" />
                      ) : (
                        <HourglassBottomRoundedIcon fontSize="small" />
                      )
                    }
                    label={
                      isComplete
                        ? t("profile.summary.complete", {
                            defaultValue: "Complete",
                          })
                        : isInProgress
                        ? t("profile.summary.inProgress", {
                            defaultValue: "In progress",
                          })
                        : t("profile.summary.notStarted", {
                            defaultValue: "Not started",
                          })
                    }
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  />
                </Stack>
              </Stack>
            )}
            {onEdit && (
              <Tooltip
                title={t("profile.buttons.editSection", { defaultValue: "Edit" })}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit();
                    }}
                    disabled={disableEdit}
                    sx={{
                      borderRadius: 1.5,
                      border: `1px solid ${
                        disableEdit
                          ? alpha(theme.palette.divider, 0.6)
                          : alpha(accentColor, 0.4)
                      }`,
                      backgroundColor: disableEdit
                        ? alpha(theme.palette.action.disabledBackground, 0.4)
                        : alpha(accentColor, 0.08),
                      color: disableEdit
                        ? theme.palette.text.disabled
                        : accentColor,
                      transition: theme.transitions.create([
                        "background-color",
                        "transform",
                      ]),
                      "&:hover": {
                        backgroundColor: alpha(accentColor, 0.15),
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: { xs: 2, sm: 2.75 },
          py: { xs: 2, sm: 2.5 },
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
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? alpha("#1a202c", 0.8)
                        : lighten(theme.palette.background.paper, 0.08),
                  })}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, letterSpacing: 0.4 }}
                  >
                    {resolvedLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={isFilled ? "text.primary" : "text.secondary"}
                    sx={{ fontStyle: isFilled ? "normal" : "italic" }}
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
