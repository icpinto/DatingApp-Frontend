import React from "react";
import { Stack, Typography } from "@mui/material";
import ProfileSection from "./ProfileSection";
import { useTranslation } from "../../../../i18n";
import { profileSectionDefinitions } from "../../model";

const SECTION_SURFACES = ["#181c25", "#1d212c"];

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
    <Stack spacing={0} sx={{ width: "100%" }}>
      {availableSections.map(({ key, labelKey, Icon }, index) => (
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
          surfaceColor={SECTION_SURFACES[index % SECTION_SURFACES.length]}
        />
      ))}
    </Stack>
  );
}

export default ProfileSections;
