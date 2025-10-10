import React from "react";
import { Card, CardContent, CardHeader, Skeleton, Stack } from "@mui/material";
import { spacing } from "../../../styles";

const ProfileSkeleton = () => (
  <Stack spacing={spacing.section}>
    <Card>
      <CardHeader
        avatar={<Skeleton variant="circular" width={72} height={72} />}
        title={<Skeleton width="40%" />}
        subheader={<Skeleton width="60%" />}
      />
      <CardContent>
        <Stack spacing={1.5}>
          <Skeleton width="100%" height={24} />
          <Skeleton width="100%" height={24} />
          <Skeleton width="80%" height={20} />
          <Skeleton width="90%" height={20} />
        </Stack>
      </CardContent>
    </Card>
    <Card>
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton width="30%" />}
      />
      <CardContent>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  </Stack>
);

export default ProfileSkeleton;
