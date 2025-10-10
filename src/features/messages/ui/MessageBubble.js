import { Box, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

const formatTime = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function MessageBubble({ message, isOwn }) {
  const bubbleColor = isOwn ? "primary.main" : "grey.100";
  const textColor = isOwn ? "primary.contrastText" : "text.primary";
  const timestamp = formatTime(message?.createdAt);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        gap: 0.5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: "75%",
          px: 2,
          py: 1.5,
          bgcolor: bubbleColor,
          color: textColor,
          borderRadius: 3,
          borderTopRightRadius: isOwn ? 0 : 3,
          borderTopLeftRadius: isOwn ? 3 : 0,
          border: (theme) =>
            isOwn
              ? `1px solid ${alpha(theme.palette.primary.dark, 0.4)}`
              : `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
          {message?.text || ""}
        </Typography>
      </Paper>
      <Typography variant="caption" color="text.secondary">
        {message?.pending ? "Sending…" : timestamp}
      </Typography>
    </Box>
  );
}
