import React from "react";
import { Stack, Typography, Avatar } from "@mui/material";
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
  const hasProfileImage = Boolean(data && data.profile_image);

  if (!hasProfileImage && availableSections.length === 0) {
    return <Typography>No additional information available.</Typography>;
  }

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {hasProfileImage && (
        <Avatar
          src={data.profile_image}
          alt="Profile"
          sx={{ width: 150, height: 150, alignSelf: "center" }}
        />
      )}
      {availableSections.map(({ key, label }) => (
        <ProfileSection key={key} label={label} data={data[key]} />
      ))}
    </Stack>
  );
}

export default ProfileSections;
