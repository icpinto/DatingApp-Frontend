import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Helper to format keys like "date_of_birth" => "Date Of Birth"
const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const sections = [
  { key: "personal", label: "Personal" },
  { key: "residency", label: "Residency" },
  { key: "education", label: "Education" },
  { key: "family", label: "Family" },
  { key: "horoscope", label: "Horoscope" },
];

function ProfileSections({ data }) {
  const renderFields = (sectionData) => (
    <Stack spacing={1}>
      {Object.entries(sectionData || {}).map(([field, value]) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        return (
          <Typography key={field}>
            <strong>{formatLabel(field)}:</strong> {displayValue ?? "N/A"}
          </Typography>
        );
      })}
    </Stack>
  );

  const availableSections = sections.filter(
    ({ key }) => data && data[key]
  );

  if (availableSections.length === 0) {
    return <Typography>No additional information available.</Typography>;
  }

  return (
    <Stack spacing={2}>
      {availableSections.map(({ key, label }) => (
        <Accordion key={key} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{label}</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderFields(data[key])}</AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}

export default ProfileSections;
