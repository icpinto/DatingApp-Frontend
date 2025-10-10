import { Grid, Stack } from "@mui/material";
import { useMemo } from "react";
import ConversationsList from "../ui/ConversationsList";
import ChatPanel from "../ui/ChatPanel";
import { useConversations, useThread } from "../hooks/useMessages";

export default function MessagesPage() {
  const { conversations, isLoadingConversations, activeId, setActiveId } =
    useConversations();
  const {
    thread,
    isLoadingThread,
    threadError,
    sendMessage,
    blockUser,
    closeThread,
    isSending,
    isBlocking,
    isClosing,
  } = useThread(activeId);

  const activeConversation = useMemo(() => {
    if (!activeId) {
      return null;
    }
    return conversations.find((conversation) => {
      if (!conversation) {
        return false;
      }
      const id = conversation.id ?? conversation.conversationId;
      return id !== undefined && String(id) === String(activeId);
    });
  }, [activeId, conversations]);

  const resolvedThread = thread ||
    (activeConversation
      ? { conversation: activeConversation, messages: [] }
      : null);

  const handleSelect = (id) => {
    if (id === undefined || id === null) {
      setActiveId(null);
      return;
    }
    setActiveId(String(id));
  };

  return (
    <Stack spacing={3} sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 }, height: "100%" }}>
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} lg={4} sx={{ display: "flex" }}>
          <ConversationsList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            loading={isLoadingConversations}
          />
        </Grid>
        <Grid item xs={12} lg={8} sx={{ display: "flex" }}>
          <ChatPanel
            thread={resolvedThread}
            loading={isLoadingThread}
            error={threadError}
            onSend={sendMessage}
            onBlock={blockUser}
            onClose={closeThread}
            isSending={isSending}
            isBlocking={isBlocking}
            isClosing={isClosing}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
