import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import { alpha } from "@mui/material/styles";
import { spacing } from "../../styles";
import { useUserCapabilities } from "../../context/UserContext";

function ConversationListPane({
  loading,
  error,
  conversations,
  selectedConversationKey,
  onConversationSelect,
}) {
  const { groups } = useUserCapabilities();
  const conversationCapabilities = groups.messaging;
  const viewListCapability = conversationCapabilities.viewConversations;
  const openConversationCapability = conversationCapabilities.openConversation;
  const canViewConversationList = viewListCapability.can;
  const canOpenConversation = openConversationCapability.can;
  const viewListDeniedMessage =
    viewListCapability.reason || "You do not have permission to view your conversations.";

  const handleSelectConversation = (conversation) => {
    if (!canOpenConversation) {
      return;
    }

    onConversationSelect(conversation);
  };

  const handleConversationKeyDown = (event, conversation) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectConversation(conversation);
    }
  };

  if (!canViewConversationList) {
    return (
      <Card
        elevation={3}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardHeader
          title="Conversations"
          subheader="Stay in touch with people you've connected with"
          avatar={
            <Avatar
              variant="rounded"
              sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              <ForumRoundedIcon />
            </Avatar>
          }
          sx={{ px: spacing.section, py: spacing.section }}
        />
        <Divider sx={{ borderStyle: "dashed" }} />
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: spacing.section,
            py: spacing.section,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {viewListDeniedMessage}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={3}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <CardHeader
        title="Conversations"
        subheader="Stay in touch with people you've connected with"
        avatar={
          <Avatar
            variant="rounded"
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            <ForumRoundedIcon />
          </Avatar>
        }
        sx={{ px: spacing.section, py: spacing.section }}
      />
      <Divider sx={{ borderStyle: "dashed" }} />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 0,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
            px: spacing.section,
            py: spacing.section,
            display: "flex",
          }}
        >
          {loading ? (
            <Stack spacing={spacing.section} sx={{ width: "100%" }}>
              <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : error ? (
            <Stack
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{
                flexGrow: 1,
                textAlign: "center",
                color: "error.main",
              }}
            >
              <Typography color="inherit">{error}</Typography>
              <Typography variant="body2" color="text.secondary">
                Try refreshing the page to load your conversations again.
              </Typography>
            </Stack>
          ) : Array.isArray(conversations) && conversations.length > 0 ? (
            <Stack
              spacing={spacing.section}
              divider={<Divider flexItem sx={{ borderStyle: "dashed", opacity: 0.4 }} />}
              sx={{ width: "100%" }}
            >
              {conversations.map((entry, index) => {
                const conversationKey = entry.conversationKey;
                const isSelected =
                  selectedConversationKey !== null &&
                  conversationKey !== undefined
                    ? conversationKey === selectedConversationKey
                    : false;
                const isTopConversation = index === 0;

                return (
                  <Box
                    key={`${conversationKey ?? entry.conversationId ?? index}-panel`}
                    onClick={() => handleSelectConversation(entry.conversation)}
                    role="button"
                    tabIndex={canOpenConversation ? 0 : -1}
                    onKeyDown={(event) =>
                      handleConversationKeyDown(event, entry.conversation)
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2,
                      py: 1.75,
                      borderRadius: 2,
                      cursor: canOpenConversation ? "pointer" : "not-allowed",
                      border: (theme) =>
                        `1px solid ${
                          isSelected
                            ? theme.palette.primary.main
                            : alpha(theme.palette.divider, 0.8)
                        }`,
                      bgcolor: (theme) =>
                        isSelected
                          ? alpha(theme.palette.primary.main, 0.08)
                          : isTopConversation
                          ? alpha(theme.palette.primary.main, 0.04)
                          : theme.palette.background.paper,
                      boxShadow: (theme) =>
                        isSelected
                          ? `0px 12px 24px ${alpha(theme.palette.primary.main, 0.18)}`
                          : `0px 6px 18px ${alpha(theme.palette.common.black, 0.05)}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: (theme) => theme.palette.primary.main,
                        boxShadow: (theme) =>
                          `0px 12px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                      },
                      outline: "none",
                    }}
                  >
                    <Badge
                      color="error"
                      badgeContent={entry.unreadCount}
                      invisible={!entry.unreadCount}
                      overlap="circular"
                    >
                      <Avatar
                        variant="rounded"
                        sx={{
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        }}
                      >
                        {entry.avatarInitial}
                      </Avatar>
                    </Badge>
                    <Stack spacing={0.5} flexGrow={1} minWidth={0}>
                      {isTopConversation && (
                        <Typography variant="subtitle2" color="text.secondary">
                          Most recent conversation
                        </Typography>
                      )}
                      <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{ fontWeight: entry.unreadCount > 0 ? 700 : 600 }}
                      >
                        {entry.displayName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={entry.unreadCount > 0 ? "text.primary" : "text.secondary"}
                        noWrap
                        sx={{ fontWeight: entry.unreadCount > 0 ? 600 : 400 }}
                      >
                        {entry.messagePreview}
                      </Typography>
                    </Stack>
                    {entry.formattedTimestamp ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {entry.formattedTimestamp}
                      </Typography>
                    ) : null}
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Stack
              alignItems="center"
              spacing={1}
              justifyContent="center"
              sx={{
                flexGrow: 1,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body1">
                You have no conversations yet.
              </Typography>
              <Typography variant="body2">
                Start connecting to see your messages here.
              </Typography>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default ConversationListPane;
