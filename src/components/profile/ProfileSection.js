import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Helper to format keys like "date_of_birth" => "Date Of Birth"
const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

function ProfileSection({ label, data }) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {Object.entries(data || {}).map(([field, value]) => {
            const displayValue = Array.isArray(value) ? value.join(", ") : value;
            return (
              <Grid item xs={12} sm={6} key={field}>
                <Typography>
                  <strong>{formatLabel(field)}:</strong> {displayValue ?? "N/A"}
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
