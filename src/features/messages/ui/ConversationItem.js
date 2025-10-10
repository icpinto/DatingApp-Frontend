import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import { Avatar, Badge, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

const formatTimestamp = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const buildInitials = (name) => {
  if (!name || typeof name !== "string") {
    return <ForumRoundedIcon fontSize="small" />;
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return <ForumRoundedIcon fontSize="small" />;
  }
  const parts = trimmed.split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "");
  return initials.join("") || <ForumRoundedIcon fontSize="small" />;
};

export default function ConversationItem({ conversation, active = false, onSelect }) {
  const unread = conversation?.unreadCount || 0;
  const handleClick = () => {
    if (typeof onSelect === "function") {
      onSelect(conversation);
    }
  };

  const initialsContent = buildInitials(conversation?.peerName);
  const preview = conversation?.lastMessagePreview || "Say hello";
  const timestamp = formatTimestamp(conversation?.lastMessageAt);

  return (
    <ButtonBase
      onClick={handleClick}
      sx={{
        width: "100%",
        borderRadius: 2,
        display: "block",
        textAlign: "left",
        px: 2,
        py: 1.75,
        bgcolor: (theme) =>
          active
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.background.paper, 0.4),
        border: (theme) =>
          `1px solid ${
            active
              ? alpha(theme.palette.primary.main, 0.4)
              : alpha(theme.palette.divider, 0.6)
          }`,
        transition: (theme) => theme.transitions.create(["background-color", "box-shadow"], { duration: 120 }),
        "&:hover": {
          bgcolor: (theme) =>
            active
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Badge color="error" badgeContent={unread} overlap="circular">
          <Avatar
            src={conversation?.peerAvatarUrl || undefined}
            alt={conversation?.peerName || "Conversation"}
            sx={{ width: 48, height: 48 }}
          >
            {initialsContent}
          </Avatar>
        </Badge>
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ fontWeight: active ? 600 : 500 }}
            >
              {conversation?.peerName || "Unknown"}
            </Typography>
            {timestamp ? (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {timestamp}
              </Typography>
            ) : null}
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ opacity: unread ? 0.9 : 0.7 }}
          >
            {preview}
          </Typography>
        </Stack>
      </Stack>
    </ButtonBase>
  );
}
