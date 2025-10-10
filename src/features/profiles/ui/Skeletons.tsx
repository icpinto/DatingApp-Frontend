import { Skeleton, Stack } from '@mui/material';

export function ProfileOverviewSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="text" width="60%" height={32} />
      {[0, 1, 2].map((index) => (
        <Stack key={index} spacing={1.5}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rounded" height={10} />
        </Stack>
      ))}
    </Stack>
  );
}

export function AccountSettingsSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Skeleton variant="text" width="50%" height={28} />
      {[0, 1, 2, 3].map((index) => (
        <Stack key={index} spacing={1.25}>
          <Skeleton variant="text" width="35%" />
          <Skeleton variant="rounded" height={40} />
        </Stack>
      ))}
    </Stack>
  );
}
