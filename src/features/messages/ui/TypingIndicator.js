import { Box, Stack, Typography } from "@mui/material";

export default function TypingIndicator({ label = "Typing…" }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          px: 1.5,
          py: 0.75,
          borderRadius: 999,
          bgcolor: "grey.100",
          color: "text.secondary",
          fontSize: 12,
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.500", opacity: 0.6 }} />
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.500", opacity: 0.6 }} />
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.500", opacity: 0.6 }} />
        </Box>
        <Typography variant="caption" color="inherit">
          {label}
        </Typography>
      </Stack>
    </Box>
  );
}
