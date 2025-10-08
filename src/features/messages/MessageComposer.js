import React from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { spacing } from "../../styles";
import { useUserCapabilities } from "../../shared/context/UserContext";

function MessageComposer({
  value,
  onChange,
  onSend,
  isBlocked,
  isDisabled = false,
  disabledReason,
}) {
  const { groups } = useUserCapabilities();
  const sendCapability = groups.messaging.sendMessage;
  const canSendMessage = sendCapability.can;
  const composerDisabled = Boolean(isBlocked || isDisabled || !canSendMessage);
  const effectiveDisabledReason =
    !canSendMessage
      ? sendCapability.reason || "You do not have permission to send messages."
      : disabledReason;

  if (composerDisabled) {
    return (
      <Typography variant="body2" color="text.secondary">
        {
          effectiveDisabledReason ||
          "Messaging is disabled for this conversation."
        }
      </Typography>
    );
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", sm: "center" }}
    >
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Type a message..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={onSend}
        sx={{
          px: 4,
          py: 1.25,
          alignSelf: { xs: "stretch", sm: "flex-end" },
        }}
      >
        Send
      </Button>
    </Stack>
  );
}

function MessageComposerSection(props) {
  return (
    <Stack sx={{ px: spacing.section, pb: spacing.section }}>
      <MessageComposer {...props} />
    </Stack>
  );
}

export default MessageComposerSection;
