import React, { forwardRef } from "react";
import { Avatar, Card, CardContent, CardHeader, Divider } from "@mui/material";

import { spacing } from "../../styles";

const FeatureCard = forwardRef(function FeatureCard(
  {
    title,
    subheader,
    icon: Icon,
    avatar,
    avatarProps = {},
    headerAction,
    headerProps = {},
    contentProps = {},
    divider = true,
    dividerProps = {},
    children,
    ...cardProps
  },
  ref
) {
  const {
    sx: headerSx = {},
    titleTypographyProps = {},
    subheaderTypographyProps = {},
    ...restHeaderProps
  } = headerProps;

  const { sx: contentSx = {}, ...restContentProps } = contentProps;

  let headerAvatar = avatar || null;

  if (!headerAvatar) {
    if (Icon) {
      const { sx: avatarSx = {}, ...restAvatarProps } = avatarProps;
      headerAvatar = (
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            ...avatarSx,
          }}
          {...restAvatarProps}
        >
          <Icon fontSize="small" />
        </Avatar>
      );
    } else if (Object.keys(avatarProps).length > 0) {
      headerAvatar = <Avatar {...avatarProps} />;
    }
  }

  return (
    <Card
      ref={ref}
      elevation={3}
      sx={{ borderRadius: 3, overflow: "hidden", ...cardProps.sx }}
      {...cardProps}
    >
      {(title || subheader || headerAvatar || headerAction) && (
        <CardHeader
          title={title}
          subheader={subheader}
          avatar={headerAvatar}
          action={headerAction}
          titleTypographyProps={{
            variant: "h6",
            sx: { fontWeight: 600, ...titleTypographyProps.sx },
            ...titleTypographyProps,
          }}
          subheaderTypographyProps={{
            color: "text.secondary",
            variant: "body2",
            ...subheaderTypographyProps,
          }}
          sx={{ px: spacing.section, py: spacing.section, ...headerSx }}
          {...restHeaderProps}
        />
      )}
      {divider && <Divider sx={{ borderStyle: "dashed" }} {...dividerProps} />}
      <CardContent
        sx={{
          px: spacing.section,
          py: spacing.section,
          ...contentSx,
        }}
        {...restContentProps}
      >
        {children}
      </CardContent>
    </Card>
  );
});

export default FeatureCard;
