import React from "react";
import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { spacing } from "../../styles";
import { CAPABILITIES } from "../../utils/capabilities";
import { useUserCapabilities } from "./UserContext";

function ChatMessageList({
  containerRef,
  messages,
  hasMessages,
  error,
  blockError,
  onDismissBlockError,
  blockSuccess,
  lifecycleStatus,
}) {
  const { hasCapability } = useUserCapabilities();
  const canViewHistory = hasCapability(CAPABILITIES.MESSAGING_VIEW_HISTORY);
  const canViewPartnerStatus = hasCapability(
    CAPABILITIES.MESSAGING_VIEW_PARTNER_STATUS
  );

  if (!canViewHistory) {
    return (
      <Box
        sx={{
          flex: "1 1 0",
          overflowY: "auto",
          minHeight: 0,
          mx: spacing.section,
          my: spacing.section / 2,
          px: spacing.section,
          py: spacing.section,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="body2">
          You do not have permission to view this conversation.
        </Typography>
      </Box>
    );
  }

  const normalizedLifecycleStatus =
    canViewPartnerStatus && typeof lifecycleStatus === "string"
      ? lifecycleStatus.trim().toLowerCase()
      : undefined;

  let lifecycleMessage = null;

  if (normalizedLifecycleStatus === "deactivated") {
    lifecycleMessage = "This user has deactivated their account. You can’t reply.";
  } else if (normalizedLifecycleStatus === "deleted") {
    lifecycleMessage = "This user has deleted their account. You can’t reply.";
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: "1 1 0",
        overflowY: "auto",
        minHeight: 0,
        mx: spacing.section,
        my: spacing.section / 2,
        px: spacing.section,
        py: spacing.section,
        display: "flex",
        flexDirection: "column",
        gap: spacing.section,
        bgcolor: (theme) =>
          alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.04 : 0.16),
        borderRadius: 3,
        boxShadow: (theme) =>
          `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)}`,
      }}
    >
      {blockError ? (
        <Alert severity="error" onClose={onDismissBlockError} sx={{ alignSelf: "flex-start" }}>
          {blockError}
        </Alert>
      ) : null}
      {blockSuccess ? (
        <Alert severity="success" sx={{ alignSelf: "flex-start" }}>
          You have blocked this user. You will no longer receive messages from them.
        </Alert>
      ) : null}
      {lifecycleMessage ? (
        <Alert severity="info" sx={{ alignSelf: "flex-start" }}>
          {lifecycleMessage}
        </Alert>
      ) : null}
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {!hasMessages ? (
        <Stack
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            textAlign: "center",
            color: "text.secondary",
            flexGrow: 1,
          }}
        >
          <Typography variant="body1">
            No messages yet. Start the conversation!
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={spacing.section}>
          {messages.map((message) => (
            <Box
              key={message.key}
              sx={{
                display: "flex",
                justifyContent: message.isSender ? "flex-end" : "flex-start",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 1.5,
                  maxWidth: { xs: "88%", sm: "75%" },
                  bgcolor: (theme) =>
                    message.isSender
                      ? theme.palette.primary.main
                      : alpha(theme.palette.background.paper, 0.92),
                  color: (theme) =>
                    message.isSender
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  borderRadius: "20px",
                  borderTopRightRadius: message.isSender ? "8px" : "20px",
                  borderTopLeftRadius: message.isSender ? "20px" : "8px",
                  border: (theme) =>
                    `1px solid ${
                      message.isSender
                        ? alpha(theme.palette.primary.dark, 0.6)
                        : theme.palette.divider
                    }`,
                  boxShadow: (theme) =>
                    message.isSender
                      ? `0px 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                      : `0px 6px 18px ${alpha(theme.palette.common.black, 0.06)}`,
                  opacity: message.pending ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {message.body}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "right",
                    mt: 1,
                    color: (theme) =>
                      message.isSender
                        ? alpha(theme.palette.primary.contrastText, 0.8)
                        : theme.palette.text.secondary,
                  }}
                >
                  {message.timestampLabel}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default ChatMessageList;
