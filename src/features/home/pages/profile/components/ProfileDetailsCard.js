import React from "react";
import { Alert } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Guard from "../../../../../shared/components/Guard";
import { CAPABILITIES } from "../../../../../domain/capabilities";
import ProfileSections from "../../../../profile/ui/ownerProfile";
import FeatureCard from "../../../../../shared/components/FeatureCard";

function ProfileDetailsCard({ profile, t, viewSectionsReason }) {
  return (
    <FeatureCard
      icon={InfoOutlined}
      title={t("profile.viewer.detailsTitle")}
      avatarProps={{ sx: { bgcolor: "primary.main" } }}
    >
      <Guard
        can={CAPABILITIES.PROFILE_VIEW_SECTIONS}
        fallback={
          <Alert severity="info">
            {viewSectionsReason || t("profile.viewer.noProfile")}
          </Alert>
        }
      >
        <ProfileSections data={profile} useFeatureCard={false} />
      </Guard>
    </FeatureCard>
  );
}

export default ProfileDetailsCard;
