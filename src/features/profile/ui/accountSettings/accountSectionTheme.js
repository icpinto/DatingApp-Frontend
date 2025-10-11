import { alpha, darken, lighten } from "@mui/material/styles";

const getSectionBackgrounds = (theme) => {
  const adjust = theme.palette.mode === "dark" ? darken : lighten;
  const base = theme.palette.background.paper;

  return {
    profile: adjust(base, 0.02),
    account: adjust(base, 0.04),
    legal: adjust(base, 0.02),
  };
};

export const getSectionBackground = (theme, section) =>
  getSectionBackgrounds(theme)[section] ?? theme.palette.background.paper;

export const getSectionTextColor = (theme) => theme.palette.text.primary;

export const getSectionSubtextColor = (theme) =>
  alpha(theme.palette.text.secondary, 0.9);

export const getSectionDividerColor = (theme) =>
  alpha(theme.palette.divider, 0.6);

export const accountSectionHeadingStyles = (theme) => ({
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: alpha(theme.palette.text.secondary, 0.85),
  letterSpacing: "1px",
  marginBottom: theme.spacing(1.5),
});

const getAlertBackground = (theme) =>
  alpha(
    theme.palette.mode === "dark"
      ? lighten(theme.palette.background.default, 0.08)
      : darken(theme.palette.background.default, 0.02),
    0.75
  );

export const createSectionCardStyles = (section) => (theme) => {
  const background = getSectionBackground(theme, section);
  const textColor = getSectionTextColor(theme);
  const subtextColor = getSectionSubtextColor(theme);
  const dividerColor = getSectionDividerColor(theme);

  return {
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: background,
    color: textColor,
    border: "none",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 30px 50px rgba(0, 0, 0, 0.45)"
        : "0 18px 36px rgba(0, 0, 0, 0.12)",
    "& .MuiCardHeader-title": {
      color: textColor,
      letterSpacing: "0.02em",
    },
    "& .MuiCardHeader-subheader": {
      color: subtextColor,
    },
    "& .MuiTypography-root": {
      color: textColor,
    },
    "& .MuiTypography-root.MuiTypography-colorTextSecondary": {
      color: subtextColor,
    },
    "& .MuiTypography-caption": {
      color: alpha(theme.palette.text.secondary, 0.7),
    },
    "& .MuiDivider-root": {
      borderColor: dividerColor,
    },
    "& .MuiAlert-root": {
      backgroundColor: getAlertBackground(theme),
      color: textColor,
      borderRadius: 2,
      "& .MuiAlert-icon": {
        color: textColor,
      },
    },
  };
};

export const createAccountActionStyles = (
  isEnabled,
  variant = "default",
  toneIndex = 0
) => (theme) => {
  const accent =
    variant === "danger"
      ? theme.palette.error.main
      : theme.palette.primary.main;

  const accentMuted = alpha(accent, 0.4);

  const tonePalette =
    theme.palette.mode === "dark"
      ? [
          alpha(theme.palette.background.paper, 0.95),
          alpha(theme.palette.background.paper, 0.85),
        ]
      : [
          alpha(theme.palette.background.paper, 0.9),
          alpha(theme.palette.background.paper, 0.8),
        ];

  const backgroundTone = tonePalette[toneIndex % tonePalette.length];

  const disabledBackground =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.default, 0.7)
      : alpha(theme.palette.action.disabledBackground, 0.8);

  return {
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    border: "none",
    backgroundColor: isEnabled ? backgroundTone : disabledBackground,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 2px 8px rgba(0, 0, 0, 0.25)"
        : "0 1px 4px rgba(0, 0, 0, 0.12)",
    px: { xs: 2.25, sm: 3 },
    py: { xs: 2.5, sm: 3 },
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, opacity 0.3s ease",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: isEnabled ? accent : accentMuted,
      opacity: 0,
      transition: "opacity 0.3s ease",
    },
    "&:hover": {
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 16px 40px rgba(0, 0, 0, 0.45)"
          : "0 8px 24px rgba(0, 0, 0, 0.18)",
      transform: "translateY(-4px)",
      backgroundColor: isEnabled
        ? tonePalette[(toneIndex + 1) % tonePalette.length]
        : disabledBackground,
    },
    "&:hover::before, &:focus-within::before": {
      opacity: 1,
    },
    "&:focus-within": {
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 18px 42px rgba(0, 0, 0, 0.5)"
          : "0 10px 28px rgba(0, 0, 0, 0.2)",
      transform: "translateY(-3px)",
    },
    "&:hover [data-account-action-icon='true'], &:focus-within [data-account-action-icon='true']": {
      backgroundColor: alpha(
        theme.palette.mode === "dark"
          ? theme.palette.common.white
          : theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.12 : 0.1
      ),
    },
    "&:hover [data-account-action-icon='true'] svg, &:focus-within [data-account-action-icon='true'] svg": {
      transform: "rotate(2deg) scale(1.05)",
      filter: `drop-shadow(0 0 6px ${alpha(
        theme.palette.mode === "dark"
          ? theme.palette.common.white
          : theme.palette.primary.main,
        0.25
      )})`,
    },
  };
};
