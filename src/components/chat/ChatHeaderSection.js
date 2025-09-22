import React from "react";
import {
  Avatar,
  Button,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { spacing } from "../../styles";

function ChatHeaderSection({
  title,
  bio,
  initial,
  isMobile,
  onClose,
  onBlockUser,
  isBlocked,
  isBlocking,
}) {
  return (
    <CardHeader
      avatar={
        <Avatar
          variant="rounded"
          sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
        >
          {initial}
        </Avatar>
      }
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onBlockUser}
            disabled={isBlocked || isBlocking}
          >
            {isBlocked ? "Blocked" : isBlocking ? "Blocking…" : "Block user"}
          </Button>
          <IconButton
            onClick={onClose}
            aria-label={isMobile ? "Back to conversations" : "Close conversation"}
          >
            {isMobile ? <ArrowBackIcon /> : <CloseIcon />}
          </IconButton>
        </Stack>
      }
      title={
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      }
      subheader={
        bio ? (
          <Typography variant="body2" color="text.secondary">
            {bio}
          </Typography>
        ) : undefined
      }
      sx={{
        alignItems: "flex-start",
        px: spacing.section,
        pt: spacing.section,
        pb: spacing.section / 2,
      }}
    />
  );
}

export default ChatHeaderSection;
