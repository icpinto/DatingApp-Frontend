import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Guard from "../Guard";
import { CAPABILITIES } from "../../../domain/capabilities";
import { spacing } from "../../../styles";

const MODERN_FONT_STACK = '"Inter","Rubik","Roboto","Helvetica","Arial",sans-serif';

const SectionLabel = ({ children }) => (
  <Typography
    variant="overline"
    color="text.secondary"
    sx={{
      fontFamily: MODERN_FONT_STACK,
      fontWeight: 600,
      letterSpacing: 0.8,
    }}
  >
    {children}
  </Typography>
);

const SectionValue = ({ children }) => (
  <Typography
    variant="body1"
    sx={{ fontFamily: MODERN_FONT_STACK, lineHeight: 1.5 }}
  >
    {children}
  </Typography>
);

const ChipRow = ({ items, color = "default" }) => (
  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
    {items.map((item, index) => (
      <Chip
        key={`${item}-${index}`}
        label={item}
        color={color}
        variant="outlined"
      />
    ))}
  </Stack>
);

const ProfileOverviewCard = ({
  profile,
  displayName,
  locationText,
  age,
  identityChip,
  contactChip,
  languages,
  interests,
  t,
}) => (
  <Card elevation={3} sx={{ borderRadius: 3 }}>
    <CardHeader
      avatar={
        <Avatar
          src={profile.profile_image}
          alt={displayName}
          sx={{ width: 72, height: 72, fontSize: 32 }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      }
      title={displayName}
      subheader={locationText}
      titleTypographyProps={{
        sx: {
          fontWeight: 600,
          fontFamily: MODERN_FONT_STACK,
          fontSize: { xs: "1.5rem", sm: "1.75rem" },
          lineHeight: 1.2,
        },
      }}
      subheaderTypographyProps={{
        sx: {
          fontSize: "0.875rem",
          color: "#aaa",
          fontFamily: MODERN_FONT_STACK,
          fontWeight: 400,
          letterSpacing: 0.15,
        },
      }}
    />
    <Divider />
    <CardContent>
      <Stack spacing={spacing.section}>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontFamily: MODERN_FONT_STACK, lineHeight: 1.6 }}
        >
          {profile.personal.bio || t("common.placeholders.noBio")}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <SectionLabel>{t("home.labels.age")}</SectionLabel>
            <SectionValue>
              {age !== null
                ? t("profile.viewer.ageYears", { count: age })
                : t("common.placeholders.notAvailable")}
            </SectionValue>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SectionLabel>{t("home.labels.location")}</SectionLabel>
            <SectionValue>{locationText}</SectionValue>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SectionLabel>{t("profile.fields.civilStatus")}</SectionLabel>
            <SectionValue>
              {profile.personal.civil_status ||
                t("common.placeholders.notAvailable")}
            </SectionValue>
          </Grid>
        </Grid>
        <Guard can={CAPABILITIES.PROFILE_VIEW_BADGES}>
          {({ isAllowed }) =>
            isAllowed && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {identityChip}
                {contactChip}
              </Stack>
            )
          }
        </Guard>
        {languages.length > 0 && (
          <Stack spacing={1}>
            <SectionLabel>{t("profile.viewer.languagesLabel")}</SectionLabel>
            <ChipRow items={languages} />
          </Stack>
        )}
        {interests.length > 0 && (
          <Stack spacing={1}>
            <SectionLabel>{t("profile.viewer.interestsLabel")}</SectionLabel>
            <ChipRow items={interests} color="secondary" />
          </Stack>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export default ProfileOverviewCard;
