import React from "react";
import { Stack, Typography } from "@mui/material";
import FeatureCard from "../../../../shared/components/FeatureCard";
import ProfileSection from "./ProfileSection";
import { useTranslation } from "../../../../i18n";
import { profileSectionDefinitions } from "../../model";

const SECTION_SURFACES = ["#181c25", "#1d212c"];

function ProfileSections({
  data,
  onEditSection,
  disableEditing = false,
  useFeatureCard = true,
  featureCardProps = {},
  featureCardContentProps = {},
}) {
  const { t } = useTranslation();
  const availableSections = profileSectionDefinitions.filter(
    ({ key }) => data && data[key]
  );
  const hasProfileImage = Boolean(data && data.profile_image);

  if (!hasProfileImage && availableSections.length === 0) {
    return <Typography>{t("common.messages.noAdditionalInfo")}</Typography>;
  }

  const sectionsContent = (
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

  if (!useFeatureCard) {
    return sectionsContent;
  }

  const {
    sx: featureCardContentSx = {},
    ...restFeatureCardContentProps
  } = featureCardContentProps;

  return (
    <FeatureCard
      divider={false}
      contentProps={{
        sx: {
          px: 0,
          py: 0,
          overflow: "hidden",
          ...featureCardContentSx,
        },
        ...restFeatureCardContentProps,
      }}
      {...featureCardProps}
    >
      {sectionsContent}
    </FeatureCard>
  );
}

export default ProfileSections;
