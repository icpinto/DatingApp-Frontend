import React from "react";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Grow,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Verified as VerifiedIcon } from "@mui/icons-material";
import { spacing } from "../../../styles";

const getDisplayName = (userId, user, t) => {
  if (user?.username) {
    return user.username;
  }

  if (userId !== undefined && userId !== null && userId !== "") {
    return t("common.placeholders.userNumber", { id: userId });
  }

  return t("common.placeholders.user");
};

const getAvatarFallback = (displayName) => {
  return displayName?.charAt(0)?.toUpperCase() || "?";
};

const ActiveUserCard = ({
  user,
  userId,
  index,
  isExpanded,
  canExpand,
  canNavigate,
  canCompose,
  canSendRequest,
  discoveryDisabled,
  onToggleExpand,
  onViewProfile,
  loadingProfile,
  profileData,
  requestMessage,
  requestMessageError,
  onRequestMessageChange,
  onSendRequest,
  feedback,
  t,
}) => {
  const displayName = getDisplayName(userId, user, t);
  const avatarFallback = getAvatarFallback(displayName);
  const isTopUser = index === 0;
  const isVerified = Boolean(user?.contact_verified && user?.identity_verified);

  return (
    <Box
      onClick={() => {
        if (!canExpand || userId === undefined || userId === null || userId === "") {
          return;
        }
        onToggleExpand(userId);
      }}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: canExpand ? "pointer" : "default",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) =>
          isTopUser ? theme.palette.action.hover : theme.palette.background.paper,
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        ...(canExpand
          ? {
              "&:hover": {
                bgcolor: (theme) => theme.palette.action.hover,
              },
            }
          : {}),
      }}
    >
      <Stack spacing={spacing.section}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            src={user?.profile_image}
            alt={displayName}
            sx={{ width: isTopUser ? 72 : 56, height: isTopUser ? 72 : 56 }}
          >
            {avatarFallback}
          </Avatar>
          <Stack spacing={0.5} flexGrow={1} minWidth={0}>
            {isTopUser && (
              <Typography variant="subtitle2" color="text.secondary">
                {t("home.labels.mostRecent")}
              </Typography>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
              }}
            >
              <Typography
                variant={isTopUser ? "h6" : "subtitle1"}
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </Typography>
              {isVerified ? (
                <VerifiedIcon
                  color="primary"
                  fontSize={isTopUser ? "medium" : "small"}
                  titleAccess={t("common.status.verified")}
                />
              ) : null}
            </Box>
            {user?.location && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.location}
              </Typography>
            )}
          </Stack>
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {user?.bio || t("common.placeholders.noBio")}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            if (!canNavigate || userId === undefined || userId === null || userId === "") {
              return;
            }
            onViewProfile(userId);
          }}
          disabled={!canNavigate || userId === undefined || userId === null || userId === ""}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("home.labels.viewProfile")}
        </Button>
      </Stack>
      <Collapse in={isExpanded && canExpand} timeout="auto" unmountOnExit>
        {loadingProfile && isExpanded ? (
          <Box sx={{ mt: spacing.section }}>
            <Stack spacing={spacing.section}>
              <Skeleton width="80%" />
              <Skeleton width="60%" />
              <Skeleton width="40%" />
              <Skeleton variant="rectangular" width={160} height={40} />
            </Stack>
          </Box>
        ) : (
          profileData && isExpanded && canExpand && (
            <Grow in={isExpanded}>
              <Box sx={{ mt: spacing.section }}>
                <Stack spacing={spacing.section}>
                  <Typography variant="body1">
                    <strong>{t("home.labels.bio")}:</strong>{" "}
                    {profileData.bio || t("common.placeholders.noBio")}
                  </Typography>
                  <Typography variant="body1">
                    <strong>{t("home.labels.age")}:</strong>{" "}
                    {profileData.age || t("common.placeholders.notAvailable")}
                  </Typography>
                  <Typography variant="body1">
                    <strong>{t("home.labels.location")}:</strong>{" "}
                    {profileData.location || t("common.placeholders.notAvailable")}
                  </Typography>
                  <Box onClick={(event) => event.stopPropagation()}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label={t("home.labels.requestMessage")}
                      value={requestMessage}
                      onChange={(event) => {
                        if (!canCompose) {
                          return;
                        }
                        onRequestMessageChange(event.target.value);
                      }}
                      helperText={
                        requestMessageError
                          ? t(requestMessageError)
                          : t("home.helpers.requestMessage")
                      }
                      error={Boolean(requestMessageError)}
                      disabled={profileData.requestStatus || !canCompose}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color={profileData.requestStatus ? "secondary" : "primary"}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (userId === undefined || userId === null || userId === "") {
                        return;
                      }
                      onSendRequest(userId);
                    }}
                    disabled={
                      discoveryDisabled ||
                      profileData.requestStatus ||
                      !canSendRequest ||
                      userId === undefined ||
                      userId === null ||
                      userId === ""
                    }
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {profileData.requestStatus
                      ? t("home.labels.requestSent")
                      : t("home.labels.sendRequest")}
                  </Button>
                  {feedback?.key && (
                    <Typography
                      color={feedback.type === "error" ? "error.main" : "success.main"}
                    >
                      {t(feedback.key)}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Grow>
          )
        )}
      </Collapse>
    </Box>
  );
};

export default ActiveUserCard;
