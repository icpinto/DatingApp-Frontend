import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Button, Stack, TextField } from "@mui/material";

export default function Composer({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type a message",
  isSending = false,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (typeof onSend === "function") {
        onSend();
      }
    }
  };

  return (
    <Stack direction="row" spacing={2} alignItems="flex-end">
      <TextField
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending}
      />
      <Button
        variant="contained"
        endIcon={<SendRoundedIcon />}
        onClick={() => onSend?.()}
        disabled={disabled || isSending || !value?.trim()}
      >
        Send
      </Button>
    </Stack>
  );
}
