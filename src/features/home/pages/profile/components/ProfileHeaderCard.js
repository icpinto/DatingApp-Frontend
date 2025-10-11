import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

const MODERN_FONT_STACK = '"Inter","Rubik","Roboto","Helvetica","Arial",sans-serif';

function ProfileHeaderCard({
  displayName,
  profile,
  locationText,
  age,
  languages = [],
  interests = [],
  badges = null,
  isLoading = false,
  t,
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader
          avatar={<Skeleton variant="circular" width={72} height={72} />}
          title={<Skeleton width="40%" />}
          subheader={<Skeleton width="60%" />}
        />
        <CardContent>
          <Stack spacing={1.5}>
            <Skeleton width="100%" height={24} />
            <Skeleton width="80%" height={20} />
            <Skeleton width="90%" height={20} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const bio = profile?.personal?.bio || t("common.placeholders.noBio");
  const civilStatus =
    profile?.personal?.civil_status || t("common.placeholders.notAvailable");

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={
          <Avatar
            src={profile?.profile_image}
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
        <Stack spacing={3}>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{ fontFamily: MODERN_FONT_STACK, lineHeight: 1.6 }}
          >
            {bio}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                  fontFamily: MODERN_FONT_STACK,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                }}
              >
                {t("home.labels.age")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontFamily: MODERN_FONT_STACK, lineHeight: 1.5 }}
              >
                {age !== null
                  ? t("profile.viewer.ageYears", { count: age })
                  : t("common.placeholders.notAvailable")}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                  fontFamily: MODERN_FONT_STACK,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                }}
              >
                {t("home.labels.location")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontFamily: MODERN_FONT_STACK, lineHeight: 1.5 }}
              >
                {locationText}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                  fontFamily: MODERN_FONT_STACK,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                }}
              >
                {t("profile.fields.civilStatus")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontFamily: MODERN_FONT_STACK, lineHeight: 1.5 }}
              >
                {civilStatus}
              </Typography>
            </Grid>
          </Grid>
          {badges}
          {languages.length > 0 && (
            <Stack spacing={1}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                  fontFamily: MODERN_FONT_STACK,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                }}
              >
                {t("profile.viewer.languagesLabel")}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {languages.map((language) => (
                  <Chip key={`language-${language}`} label={language} variant="outlined" />
                ))}
              </Stack>
            </Stack>
          )}
          {interests.length > 0 && (
            <Stack spacing={1}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                  fontFamily: MODERN_FONT_STACK,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                }}
              >
                {t("profile.viewer.interestsLabel")}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {interests.map((interest) => (
                  <Chip
                    key={`interest-${interest}`}
                    label={interest}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProfileHeaderCard;
