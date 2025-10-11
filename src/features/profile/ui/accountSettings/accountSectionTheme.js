import { alpha } from "@mui/material/styles";

export const SECTION_BACKGROUNDS = {
  profile: "#082422",
  account: "#041615",
  legal: "#082422",
};

export const SECTION_TEXT_COLOR = "rgba(224, 252, 243, 0.96)";
export const SECTION_SUBTEXT_COLOR = "rgba(165, 218, 206, 0.76)";
export const SECTION_DIVIDER_COLOR = "rgba(73, 139, 130, 0.32)";

export const accountSectionHeadingStyles = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: "#6ba199",
  letterSpacing: "1px",
  marginBottom: "0.6rem",
};

export const createSectionCardStyles = (background) => ({
  borderRadius: 3,
  overflow: "hidden",
  backgroundColor: background,
  color: SECTION_TEXT_COLOR,
  border: "none",
  boxShadow: "0 30px 50px rgba(3, 24, 22, 0.45)",
  "& .MuiCardHeader-title": {
    color: SECTION_TEXT_COLOR,
    letterSpacing: "0.02em",
  },
  "& .MuiCardHeader-subheader": {
    color: SECTION_SUBTEXT_COLOR,
  },
  "& .MuiTypography-root": {
    color: SECTION_TEXT_COLOR,
  },
  "& .MuiTypography-root.MuiTypography-colorTextSecondary": {
    color: SECTION_SUBTEXT_COLOR,
  },
  "& .MuiTypography-caption": {
    color: "rgba(148, 163, 184, 0.7)",
  },
  "& .MuiDivider-root": {
    borderColor: SECTION_DIVIDER_COLOR,
  },
  "& .MuiAlert-root": {
    backgroundColor: alpha("#134e4a", 0.65),
    color: SECTION_TEXT_COLOR,
    borderRadius: 2,
    "& .MuiAlert-icon": {
      color: SECTION_TEXT_COLOR,
    },
  },
});

export const createAccountActionStyles = (
  isEnabled,
  variant = "default",
  toneIndex = 0
) => {
  const accent =
    variant === "danger"
      ? "linear-gradient(180deg, #f87171 0%, #ef4444 100%)"
      : "linear-gradient(180deg, #2dd4bf 0%, #0f766e 100%)";
  const mutedAccent = alpha(SECTION_SUBTEXT_COLOR, 0.45);
  const tonePalette = ["#0b2a28", "#0e3330"];
  const backgroundTone = tonePalette[toneIndex % tonePalette.length];

  return {
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    border: "none",
    backgroundColor: isEnabled ? backgroundTone : alpha("#0b3b36", 0.7),
    boxShadow: "0 2px 8px rgba(2, 20, 18, 0.25)",
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
      background: isEnabled ? accent : mutedAccent,
      opacity: 0,
      transition: "opacity 0.3s ease",
    },
    "&:hover": {
      boxShadow: "0 16px 40px rgba(10, 12, 26, 0.45)",
      transform: "translateY(-4px)",
      backgroundColor: isEnabled ? "#123a36" : alpha("#0b3b36", 0.85),
    },
    "&:hover::before, &:focus-within::before": {
      opacity: 1,
    },
    "&:focus-within": {
      boxShadow: "0 18px 42px rgba(10, 12, 26, 0.5)",
      transform: "translateY(-3px)",
    },
    "&:hover [data-account-action-icon='true'], &:focus-within [data-account-action-icon='true']": {
      backgroundColor: alpha("#2dd4bf", 0.18),
    },
    "&:hover [data-account-action-icon='true'] svg, &:focus-within [data-account-action-icon='true'] svg": {
      transform: "rotate(2deg) scale(1.05)",
      filter: "drop-shadow(0 0 6px rgba(45, 212, 191, 0.45))",
    },
  };
};
