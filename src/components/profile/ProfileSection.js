import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "../../i18n";

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
    <Accordion defaultExpanded sx={{ width: "100%" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
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
                <Typography>
                  <strong>{resolvedLabel}:</strong> {displayValue}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default ProfileSection;
