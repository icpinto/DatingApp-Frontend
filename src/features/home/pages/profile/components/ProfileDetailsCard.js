import React from "react";
import { Alert, Avatar, Card, CardContent, CardHeader, Divider } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Guard from "../../../../../shared/components/Guard";
import { CAPABILITIES } from "../../../../../domain/capabilities";
import ProfileSections from "../../../../profile/ui/ownerProfile";

function ProfileDetailsCard({ profile, t, viewSectionsReason }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <InfoOutlined />
          </Avatar>
        }
        title={t("profile.viewer.detailsTitle")}
      />
      <Divider />
      <CardContent>
        <Guard
          can={CAPABILITIES.PROFILE_VIEW_SECTIONS}
          fallback={
            <Alert severity="info">
              {viewSectionsReason || t("profile.viewer.noProfile")}
            </Alert>
          }
        >
          <ProfileSections data={profile} />
        </Guard>
      </CardContent>
    </Card>
  );
}

export default ProfileDetailsCard;
