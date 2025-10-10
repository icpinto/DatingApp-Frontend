import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { spacing } from "../../../styles";
import ConversationItem from "./ConversationItem";
import EmptyState from "./EmptyState";
import { ConversationsListSkeleton } from "./Skeletons";

export default function ConversationsList({
  conversations = [],
  activeId,
  onSelect,
  loading = false,
}) {
  const hasConversations = Array.isArray(conversations) && conversations.length > 0;
  const normalizedActiveId = useMemo(
    () => (activeId !== undefined && activeId !== null ? String(activeId) : null),
    [activeId]
  );

  return (
    <Card
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            variant="rounded"
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            <ForumRoundedIcon />
          </Avatar>
        }
        title="Conversations"
        subheader="Stay in touch with your matches"
        sx={{
          px: spacing.section,
          py: spacing.section,
        }}
      />
      <Divider sx={{ borderStyle: "dashed", opacity: 0.5 }} />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 0,
        }}
      >
        <Stack sx={{ flexGrow: 1, overflowY: "auto", p: spacing.section }} spacing={spacing.section}>
          {loading ? (
            <ConversationsListSkeleton />
          ) : hasConversations ? (
            conversations.map((conversation) => {
              const id = conversation?.id ?? conversation?.conversationId;
              const key = id ? String(id) : conversation?.peerId || Math.random();
              return (
                <ConversationItem
                  key={key}
                  conversation={conversation}
                  active={normalizedActiveId ? String(id) === normalizedActiveId : false}
                  onSelect={(entry) => onSelect?.(entry?.id ?? entry?.conversationId ?? null)}
                />
              );
            })
          ) : (
            <EmptyState
              title="No conversations yet"
              description="When you start chatting with someone, the conversation will show up here."
            />
          )}
        </Stack>
        {!loading && hasConversations ? null : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: spacing.section, pb: spacing.section }}
          >
            Conversations refresh automatically when new messages arrive.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
