import { Box, Skeleton, Stack } from "@mui/material";

export function ConversationsListSkeleton({ count = 6 }) {
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={`conversation-skeleton-${index}`}
          variant="rounded"
          height={72}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Stack>
  );
}

export function ChatPanelSkeleton() {
  return (
    <Stack spacing={2} sx={{ height: "100%" }}>
      <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
      <Box sx={{ flexGrow: 1, minHeight: 240 }}>
        <Skeleton
          variant="rounded"
          height="100%"
          sx={{ borderRadius: 2 }}
        />
      </Box>
      <Skeleton variant="rounded" height={64} sx={{ borderRadius: 2 }} />
    </Stack>
  );
}

const skeletons = {
  ConversationsListSkeleton,
  ChatPanelSkeleton,
};

export default skeletons;
