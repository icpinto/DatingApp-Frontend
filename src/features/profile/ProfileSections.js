import React from "react";
import { Stack, Typography } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ProfileSection from "./ProfileSection";
import { useTranslation } from "../../i18n";

export const profileSectionDefinitions = [
  {
    key: "verification",
    labelKey: "profile.headers.verification",
    Icon: VerifiedUserIcon,
  },
  {
    key: "personal",
    labelKey: "profile.headers.personal",
  },
  {
    key: "residency",
    labelKey: "profile.headers.residency",
  },
  {
    key: "education",
    labelKey: "profile.headers.education",
  },
  {
    key: "family",
    labelKey: "profile.headers.family",
  },
  {
    key: "horoscope",
    labelKey: "profile.headers.horoscope",
  },
];

function ProfileSections({ data, onEditSection, disableEditing = false }) {
  const { t } = useTranslation();
  const availableSections = profileSectionDefinitions.filter(
    ({ key }) => data && data[key]
  );
  const hasProfileImage = Boolean(data && data.profile_image);

  if (!hasProfileImage && availableSections.length === 0) {
    return <Typography>{t("common.messages.noAdditionalInfo")}</Typography>;
  }

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {availableSections.map(({ key, labelKey, Icon }) => (
        <ProfileSection
          key={key}
          label={t(labelKey)}
          data={data[key]}
          sectionKey={key}
          IconComponent={Icon}
          onEdit={
            onEditSection
              ? () => {
                  onEditSection(key);
                }
              : undefined
          }
          disableEdit={disableEditing}
        />
      ))}
    </Stack>
  );
}

export default ProfileSections;
