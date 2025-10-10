import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const parseDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }
  return date.getTime();
};

export default function MessagesList({ messages = [], currentUserId, typing = false }) {
  const containerRef = useRef(null);
  const sortedMessages = useMemo(() => {
    if (!Array.isArray(messages)) {
      return [];
    }
    return [...messages].sort((a, b) => parseDate(a?.createdAt) - parseDate(b?.createdAt));
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [sortedMessages.length, typing]);

  if (!sortedMessages.length) {
    return (
      <Box
        ref={containerRef}
        sx={{
          flexGrow: 1,
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
          py: 4,
          overflowY: "auto",
          bgcolor: "background.paper",
          borderRadius: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Say something nice to start the conversation.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        flexGrow: 1,
        minHeight: 320,
        overflowY: "auto",
        px: 3,
        py: 3,
        bgcolor: "background.paper",
        borderRadius: 3,
      }}
    >
      <Stack spacing={2.5}>
        {sortedMessages.map((message) => {
          const senderId = message?.senderId ?? message?.sender_id;
          const id = message?.id ?? message?._id ?? `${senderId}-${message?.createdAt}`;
          const isOwn = currentUserId
            ? String(senderId) === String(currentUserId)
            : false;
          return <MessageBubble key={id} message={message} isOwn={isOwn} />;
        })}
        {typing ? <TypingIndicator /> : null}
      </Stack>
    </Box>
  );
}
