import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { HourglassEmpty, PersonAddAlt1 } from "@mui/icons-material";

import Guard from "./Guard";
import { CAPABILITIES } from "../../../domain/capabilities";
import { spacing } from "../../../styles";
import { useTranslation } from "../../../i18n";

const renderLoadingState = () => (
  <Stack spacing={spacing.section}>
    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
    <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
    <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
  </Stack>
);

const IncomingRequestsList = ({
  requests,
  profiles,
  loading,
  error,
  canRespond,
  isDeactivated,
  onAccept,
  onReject,
  actionInProgress = false,
}) => {
  const { t } = useTranslation();

  const renderRequestItem = (request, index) => {
    const profile = profiles[request.sender_id] || {};
    const username =
      request.sender_username ||
      profile.username ||
      t("common.placeholders.unknownUser");
    const bio = profile.bio || t("common.placeholders.noBio");
    const description = request.description || t("common.placeholders.noMessage");
    const highlight = index === 0;
    const avatarFallback = username.charAt(0)?.toUpperCase() || "?";

    return (
      <Box
        key={request.id}
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) =>
            highlight ? theme.palette.action.hover : theme.palette.background.paper,
        }}
      >
        <Stack spacing={spacing.section}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={profile.profile_image_url || profile.profile_image}
              alt={username}
              sx={{ width: highlight ? 72 : 56, height: highlight ? 72 : 56 }}
            >
              {avatarFallback}
            </Avatar>
            <Stack spacing={0.5} flexGrow={1} minWidth={0}>
              {highlight && (
                <Typography variant="subtitle2" color="text.secondary">
                  {t("requests.labels.newest")}
                </Typography>
              )}
              <Typography
                variant={highlight ? "h6" : "subtitle1"}
                sx={{ fontWeight: 600 }}
                noWrap
              >
                {username}
              </Typography>
              {bio && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {bio}
                </Typography>
              )}
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
          <Guard can={CAPABILITIES.REQUESTS_RESPOND}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onAccept(request.id)}
                disabled={actionInProgress}
              >
                {t("common.actions.accept")}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => onReject(request.id)}
                disabled={actionInProgress}
              >
                {t("common.actions.reject")}
              </Button>
            </Stack>
          </Guard>
        </Stack>
      </Box>
    );
  };

  const renderContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (error) {
      return <Alert severity="error">{t(error)}</Alert>;
    }

    if (!requests.length) {
      return (
        <Stack alignItems="center" spacing={1} sx={{ py: spacing.section }}>
          <HourglassEmpty color="disabled" fontSize="large" />
          <Typography variant="body2" color="text.secondary">
            {t("requests.messages.noPending")}
          </Typography>
        </Stack>
      );
    }

    const requestList = (
      <Stack
        spacing={spacing.section}
        divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}
      >
        {requests.map((request, index) => renderRequestItem(request, index))}
      </Stack>
    );

    if (!canRespond && isDeactivated) {
      return (
        <Stack spacing={spacing.section}>
          <Alert severity="warning">{t("requests.messages.deactivatedReadOnly")}</Alert>
          {requestList}
        </Stack>
      );
    }

    return requestList;
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={t("requests.headers.incoming")}
        subheader={t("requests.headers.incomingSub")}
        avatar={
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <PersonAddAlt1 />
          </Avatar>
        }
      />
      <Divider />
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default IncomingRequestsList;
