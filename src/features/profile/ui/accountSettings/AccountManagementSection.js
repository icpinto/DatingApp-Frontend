import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  SECTION_SUBTEXT_COLOR,
  accountSectionHeadingStyles,
  createAccountActionStyles,
} from "./accountSectionTheme";

function AccountManagementSection({
  canToggleVisibility,
  capabilityReasons,
  isAccountHidden,
  accountStatusLoading,
  isUpdatingAccountVisibility,
  onToggleVisibility,
  visibilityStatusText,
  t,
  canSignOut,
  signOutReason,
  signingOut,
  onSignOut,
  canRemoveAccount,
  removeAccountReason,
  onRemoveAccount,
  isRemovingAccount,
}) {
  const renderVisibilityHelper = () => {
    if (accountStatusLoading || isUpdatingAccountVisibility) {
      return (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <CircularProgress size={14} />
          {t("profile.preferences.updatingVisibility", {
            defaultValue: "Updating visibility...",
          })}
        </Typography>
      );
    }

    if (!canToggleVisibility && capabilityReasons?.toggleVisibility) {
      return (
        <Typography variant="caption" color="text.secondary">
          {capabilityReasons.toggleVisibility}
        </Typography>
      );
    }

    return null;
  };

  return (
    <Box>
      <Typography sx={accountSectionHeadingStyles}>
        {t("profile.preferences.securityPrivacyTitle", {
          defaultValue: "Security & Privacy",
        })}
      </Typography>
      <Stack spacing={3}>
        <Box sx={createAccountActionStyles(canToggleVisibility, "default", 0)}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                component="span"
                aria-hidden
                data-account-action-icon="true"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pt: 0.5,
                  borderRadius: "999px",
                  padding: 0.75,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  transition:
                    "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
                }}
              >
                <VisibilityOffIcon color={isAccountHidden ? "warning" : "primary"} />
              </Box>
              <Stack spacing={0.75} sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: 0.2,
                  }}
                >
                  {t("profile.preferences.visibility", {
                    defaultValue: "Profile visibility",
                  })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: SECTION_SUBTEXT_COLOR,
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  {t("profile.preferences.visibilityDescription", {
                    defaultValue: "Hide your profile without losing your details.",
                  })}
                </Typography>
                <Typography
                  variant="body2"
                  key={isAccountHidden ? "hidden" : "visible"}
                  sx={{
                    color: isAccountHidden ? "#ff7f9f" : "#7dd3fc",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                    opacity: accountStatusLoading || isUpdatingAccountVisibility ? 0.7 : 1,
                    transform: "translateY(0)",
                  }}
                >
                  {visibilityStatusText}
                </Typography>
              </Stack>
            </Stack>
            <Stack
              spacing={2}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              rowGap={1.5}
            >
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                {renderVisibilityHelper()}
              </Stack>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ flexShrink: 0 }}
              >
                <Switch
                  checked={isAccountHidden}
                  onChange={onToggleVisibility}
                  disabled={
                    accountStatusLoading || isUpdatingAccountVisibility || !canToggleVisibility
                  }
                  inputProps={{
                    "aria-label": "Hide my profile",
                    "aria-busy": accountStatusLoading || isUpdatingAccountVisibility,
                  }}
                  sx={{
                    "& .MuiSwitch-thumb": {
                      boxShadow: "0 0 6px rgba(255, 79, 135, 0.45)",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#ff4f87",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "rgba(255, 79, 135, 0.6)",
                    },
                  }}
                />
                {(accountStatusLoading || isUpdatingAccountVisibility) && (
                  <CircularProgress size={18} />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <Box sx={createAccountActionStyles(canSignOut, "default", 1)}>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Box
                  component="span"
                  aria-hidden
                  data-account-action-icon="true"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pt: 0.5,
                    borderRadius: "999px",
                    padding: 0.75,
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    transition:
                      "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
                  }}
                >
                  <LogoutIcon color={canSignOut ? "primary" : "disabled"} />
                </Box>
                <Stack spacing={0.75} sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  >
                    {t("app.signOut", { defaultValue: "Sign out" })}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: SECTION_SUBTEXT_COLOR,
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {t("profile.preferences.signOutDescription", {
                      defaultValue: "Sign out on this device to stay secure.",
                    })}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                variant="outlined"
                color="primary"
                startIcon={
                  signingOut ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon />
                }
                onClick={onSignOut}
                disabled={signingOut || !canSignOut}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  borderColor: "rgba(255, 111, 156, 0.6)",
                  color: "#ff4f87",
                  backgroundColor: "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#0b0d18",
                    borderColor: "transparent",
                    background: "linear-gradient(90deg, #ff4f87, #ff7f64)",
                    boxShadow: "0 0 12px rgba(255, 79, 135, 0.45)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(255, 79, 135, 0.45)",
                    borderColor: "rgba(255, 79, 135, 0.3)",
                  },
                }}
              >
                {signingOut
                  ? t("app.signingOut", { defaultValue: "Signing out..." })
                  : t("app.signOut", { defaultValue: "Sign out" })}
              </Button>
            </Stack>
            {!canSignOut && signOutReason && (
              <Typography variant="caption" color="text.secondary">
                {signOutReason}
              </Typography>
            )}
          </Stack>
        </Box>

        <Box sx={createAccountActionStyles(canRemoveAccount, "danger", 2)}>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Box
                  component="span"
                  aria-hidden
                  data-account-action-icon="true"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pt: 0.5,
                    borderRadius: "999px",
                    padding: 0.75,
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    transition:
                      "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
                  }}
                >
                  <DeleteForeverIcon color="error" />
                </Box>
                <Stack spacing={0.75} sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  >
                    {t("profile.preferences.removeAccount", {
                      defaultValue: "Remove account",
                    })}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: SECTION_SUBTEXT_COLOR,
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {t("profile.preferences.removeAccountDescription", {
                      defaultValue: "Delete your profile, matches, and chats permanently.",
                    })}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                variant="contained"
                color="error"
                onClick={onRemoveAccount}
                startIcon={
                  isRemovingAccount ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DeleteForeverIcon />
                  )
                }
                disabled={isRemovingAccount || !canRemoveAccount}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  background: "#ff3d3d",
                  border: "none",
                  color: "white",
                  transition: "all 0.3s ease",
                  boxShadow: "0 0 0 rgba(255, 61, 61, 0.4)",
                  "&:hover": {
                    background: "#ff5b5b",
                    boxShadow: "0 0 12px rgba(255, 61, 61, 0.5)",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": {
                    background: "rgba(255, 61, 61, 0.5)",
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                }}
              >
                {isRemovingAccount
                  ? t("profile.preferences.removingAccount", { defaultValue: "Processing..." })
                  : t("profile.preferences.removeAccountButton", {
                      defaultValue: "Remove my account",
                    })}
              </Button>
            </Stack>
            {!canRemoveAccount && removeAccountReason && (
              <Typography variant="caption" color="text.secondary">
                {removeAccountReason}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default AccountManagementSection;
