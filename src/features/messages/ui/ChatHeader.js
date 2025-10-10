import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Button, Stack, Typography } from "@mui/material";

export default function ChatHeader({
  title,
  subtitle,
  onBlock,
  onClose,
  blocked = false,
  isBlocking = false,
  isClosing = false,
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      spacing={2}
      sx={{ px: 3, py: 2.5, bgcolor: "background.paper", borderRadius: 3 }}
    >
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h6" component="h2" noWrap>
          {title || "Conversation"}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<BlockRoundedIcon />}
          onClick={onBlock}
          disabled={blocked || isBlocking}
        >
          {blocked ? "Blocked" : "Block user"}
        </Button>
        <Button
          variant="text"
          color="inherit"
          startIcon={<CloseRoundedIcon />}
          onClick={onClose}
          disabled={isClosing}
        >
          Close
        </Button>
      </Stack>
    </Stack>
  );
}
