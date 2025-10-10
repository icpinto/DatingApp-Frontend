import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function EmptyState({
  title = "Select a conversation",
  description = "Choose someone from the list to start chatting.",
}) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 4,
        py: 6,
      }}
    >
      <Stack spacing={2} alignItems="center" justifyContent="center">
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            width: 64,
            height: 64,
          }}
        >
          <ChatBubbleOutlineRoundedIcon fontSize="large" />
        </Avatar>
        <Stack spacing={0.5}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
