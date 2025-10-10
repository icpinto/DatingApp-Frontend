import React from "react";
import { Alert, Avatar, Card, CardContent, CardHeader, Divider } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import Guard from "../Guard";
import { CAPABILITIES } from "../../../domain/capabilities";
import ProfileSections from "../ProfileSections";

const ProfileDetailsCard = ({ profile, viewSectionsReason, t }) => (
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

export default ProfileDetailsCard;
