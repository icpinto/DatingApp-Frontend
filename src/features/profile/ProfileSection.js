import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "../../i18n";
import { lighten } from "@mui/material/styles";

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

function ProfileSection({ label, data, sectionKey }) {
  const { t } = useTranslation();
  return (
    <Accordion
      defaultExpanded
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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: 2.5,
          py: 2.5,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={2.5}>
          {Object.entries(data || {}).map(([field, value]) => {
            const labelKey = FIELD_LABELS[sectionKey]?.[field];
            const resolvedLabel = labelKey ? t(labelKey) : formatLabel(field);
            let displayValue = Array.isArray(value) ? value.join(", ") : value;

            if (BOOLEAN_FIELDS.has(field)) {
              const booleanValue = toBoolean(displayValue);
              if (booleanValue !== null) {
                displayValue = booleanValue
                  ? t("profile.options.boolean.yes")
                  : t("profile.options.boolean.no");
              }
            }

            if (sectionKey === "verification" && STATUS_FIELDS.has(field)) {
              displayValue = t(STATUS_LABEL_MAP[displayValue] || STATUS_LABEL_MAP.not_verified);
            }

            if (displayValue === undefined || displayValue === null || displayValue === "") {
              displayValue = t("common.placeholders.notAvailable");
            }

            return (
              <Grid item xs={12} sm={6} key={field}>
                <Stack spacing={0.5} sx={{ px: 0.5 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.8,
                      color: (theme) =>
                        lighten(theme.palette.text.secondary, 0.2),
                    }}
                  >
                    {resolvedLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      color: (theme) => lighten(theme.palette.text.primary, 0.02),
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
