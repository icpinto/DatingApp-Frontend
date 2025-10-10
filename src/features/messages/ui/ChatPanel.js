import { Alert, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ChatHeader from "./ChatHeader";
import Composer from "./Composer";
import EmptyState from "./EmptyState";
import MessagesList from "./MessagesList";
import { ChatPanelSkeleton } from "./Skeletons";

const resolveSubtitle = (thread) => {
  if (!thread) {
    return "";
  }
  if (thread.peerStatus) {
    return thread.peerStatus;
  }
  return thread?.conversation?.peerBio || "";
};

export default function ChatPanel({
  thread,
  loading = false,
  error,
  onSend,
  onBlock,
  onClose,
  isSending = false,
  isBlocking = false,
  isClosing = false,
}) {
  const [draft, setDraft] = useState("");
  const conversationId = thread?.conversation?.id;
  const blocked = thread?.blocked;
  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return (
      localStorage.getItem("user_id") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("userID") ||
      null
    );
  }, []);

  useEffect(() => {
    setDraft("");
  }, [conversationId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || typeof onSend !== "function") {
      return;
    }
    try {
      await onSend(text);
      setDraft("");
    } catch (err) {
      // ignore send errors here; parent hook should surface notifications
    }
  };

  if (loading) {
    return <ChatPanelSkeleton />;
  }

  if (!thread || !thread.conversation) {
    return <EmptyState />;
  }

  return (
    <Stack spacing={2} sx={{ height: "100%" }}>
      <ChatHeader
        title={thread.conversation?.peerName}
        subtitle={resolveSubtitle(thread)}
        onBlock={() => onBlock?.(thread.conversation?.peerId)}
        onClose={() => onClose?.(thread.conversation?.id)}
        blocked={Boolean(blocked)}
        isBlocking={isBlocking}
        isClosing={isClosing}
      />
      {error ? (
        <Alert severity="error">{String(error)}</Alert>
      ) : null}
      {blocked ? (
        <Alert severity="warning">
          You have blocked this user. Unblock them to continue the conversation.
        </Alert>
      ) : null}
      <MessagesList
        messages={thread.messages}
        currentUserId={currentUserId}
        typing={false}
      />
      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
        Press Enter to send. Use Shift+Enter for a new line.
      </Typography>
      <Composer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        disabled={blocked}
        isSending={isSending}
        placeholder="Write a message"
      />
    </Stack>
  );
}
