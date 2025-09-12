import React from "react";
import { Stack, Typography } from "@mui/material";
import ProfileSection from "./ProfileSection";

const sections = [
  { key: "personal", label: "Personal" },
  { key: "residency", label: "Residency" },
  { key: "education", label: "Education" },
  { key: "family", label: "Family" },
  { key: "horoscope", label: "Horoscope" },
];

function ProfileSections({ data }) {
  const availableSections = sections.filter(({ key }) => data && data[key]);

  if (availableSections.length === 0) {
    return <Typography>No additional information available.</Typography>;
  }

  return (
    <Stack spacing={2}>
      {availableSections.map(({ key, label }) => (
        <ProfileSection key={key} label={label} data={data[key]} />
      ))}
    </Stack>
  );
}

export default ProfileSections;
