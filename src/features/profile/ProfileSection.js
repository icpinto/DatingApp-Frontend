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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "../../i18n";
import { alpha, lighten } from "@mui/material/styles";

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

function ProfileSection({ label, data, sectionKey, IconComponent }) {
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
  const completion = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;

  return (
    <Accordion
      disableGutters
      square={false}
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 2,
        border: (theme) => `1px solid ${lighten(theme.palette.divider, 0.3)}`,
        position: "relative",
        overflow: "hidden",
        transition: (theme) =>
          theme.transitions.create(["box-shadow", "transform", "border"], {
            duration: theme.transitions.duration.short,
          }),
        "&::before": {
          display: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: "linear-gradient(180deg, #FF4F87 0%, #F73D7A 100%)",
        },
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
        "&.Mui-expanded": {
          margin: 0,
          borderColor: (theme) => lighten(theme.palette.primary.main, 0.6),
          "& .MuiAccordionSummary-root": {
            backgroundColor: (theme) =>
              lighten(theme.palette.background.paper, 0.04),
          },
          "& .MuiAccordionDetails-root": {
            backgroundColor: (theme) =>
              lighten(theme.palette.background.paper, 0.06),
          },
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
          px: 2.5,
          py: 2,
          transition: theme.transitions.create("background-color", {
            duration: theme.transitions.duration.short,
          }),
          "&:hover": {
            backgroundColor: lighten(theme.palette.background.paper, 0.08),
          },
        })}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {IconComponent && (
              <Box
                sx={(theme) => ({
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                })}
              >
                <IconComponent fontSize="small" />
              </Box>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              {label}
            </Typography>
          </Stack>
          {totalFields > 0 && (
            <Stack
              spacing={0.75}
              sx={{ minWidth: { sm: 180 }, width: { xs: "100%", sm: "auto" } }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, textTransform: "uppercase" }}
              >
                {t("profile.summary.sectionCompletion", {
                  completed: filledCount,
                  total: totalFields,
                })}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={completion}
                sx={(theme) => ({
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: alpha(theme.palette.primary.light, 0.2),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    backgroundImage:
                      "linear-gradient(90deg, #FF4F87 0%, #F73D7A 100%)",
                  },
                })}
              />
            </Stack>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: 2.5,
          py: 2.5,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={2.5}>
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
                  spacing={0.75}
                  sx={(theme) => ({
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${
                      isFilled
                        ? alpha(theme.palette.success.main, 0.35)
                        : alpha(theme.palette.warning.main, 0.4)
                    }`,
                    borderLeftWidth: 4,
                    borderLeftColor: isFilled
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
                    backgroundColor: isFilled
                      ? alpha(theme.palette.success.main, 0.08)
                      : alpha(theme.palette.warning.main, 0.08),
                    transition: theme.transitions.create(["box-shadow", "transform"], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-2px)",
                    },
                  })}
                >
                  <Typography
                    variant="overline"
                    sx={(theme) => ({
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      color: isFilled
                        ? lighten(theme.palette.text.secondary, 0.2)
                        : theme.palette.text.secondary,
                    })}
                  >
                    {resolvedLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: isFilled
                        ? lighten(theme.palette.text.primary, 0.02)
                        : theme.palette.text.secondary,
                      fontStyle: isFilled ? "normal" : "italic",
                    })}
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
