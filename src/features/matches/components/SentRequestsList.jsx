import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { HourglassEmpty, Send } from "@mui/icons-material";

import Guard from "../Guard";
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

const getStatusColor = (status) => {
  if (!status) return "default";
  const normalized = String(status).toLowerCase();
  if (normalized === "accepted") return "success";
  if (normalized === "pending") return "warning";
  if (normalized === "rejected") return "error";
  return "info";
};

const SentRequestsList = ({ requests, profiles, loading, error }) => {
  const { t } = useTranslation();

  const renderRequestItem = (request, index) => {
    const profile = profiles[request.receiver_id] || {};
    const username =
      request.receiver_username ||
      profile.username ||
      t("common.placeholders.unknownUser");
    const bio = profile.bio || t("common.placeholders.noBio");
    const description = request.description || t("common.placeholders.noMessage");
    const highlight = index === 0;
    const avatarFallback = username.charAt(0)?.toUpperCase() || "?";
    const statusLabel = request.status
      ? t(`requests.status.${String(request.status).toLowerCase()}`, {
          defaultValue: request.status,
        })
      : null;

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
                  {t("requests.labels.mostRecent")}
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
            <Guard can={CAPABILITIES.REQUESTS_VIEW_STATUS}>
              {statusLabel && (
                <Chip
                  label={statusLabel}
                  color={getStatusColor(request.status)}
                  size="small"
                  sx={{ textTransform: "capitalize", fontWeight: 600 }}
                />
              )}
            </Guard>
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
        </Stack>
      </Box>
    );
  };

  const renderContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (error) {
      return (
        <Typography color="error" variant="body2">
          {t(error)}
        </Typography>
      );
    }

    if (!requests.length) {
      return (
        <Stack alignItems="center" spacing={1} sx={{ py: spacing.section }}>
          <HourglassEmpty color="disabled" fontSize="large" />
          <Typography variant="body2" color="text.secondary">
            {t("requests.messages.noSent")}
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack
        spacing={spacing.section}
        divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}
      >
        {requests.map((request, index) => renderRequestItem(request, index))}
      </Stack>
    );
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={t("requests.headers.sent")}
        subheader={t("requests.headers.sentSub")}
        avatar={
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <Send />
          </Avatar>
        }
      />
      <Divider />
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default SentRequestsList;
