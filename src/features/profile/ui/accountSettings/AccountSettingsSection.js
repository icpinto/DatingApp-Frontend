import React, { useContext } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { alpha, darken, lighten, useTheme } from "@mui/material/styles";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LanguageIcon from "@mui/icons-material/Language";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FeatureCard from "../../../../shared/components/FeatureCard";
import {
  createAccountActionStyles,
  accountSectionHeadingStyles,
  createSectionCardStyles,
  getSectionBackground,
  getSectionDividerColor,
  getSectionSubtextColor,
  getSectionTextColor,
} from "./accountSectionTheme";
import { ColorModeContext } from "../../../../shared/context/ThemeContext";

function AccountSettingsSection({
  canChangeLanguage,
  changeLanguageReason,
  currentLanguage,
  onLanguageChange,
  languageOptions,
  canManagePayments,
  onManagePayments,
  capabilityReasons,
  t,
  canToggleVisibility,
  isAccountHidden,
  accountStatusLoading,
  isUpdatingAccountVisibility,
  onToggleVisibility,
  visibilityStatusText,
  canRemoveAccount,
  removeAccountReason,
  onRemoveAccount,
  isRemovingAccount,
  featureCardProps = {},
  featureCardContentProps = {},
}) {
  const preferencesTitle = t("profile.preferences.accountPreferencesTitle", {
    defaultValue: "Account Preferences",
  });
  const securityTitle = t("profile.preferences.securityPrivacyTitle", {
    defaultValue: "Security & Privacy",
  });
  const cardTitle = t("profile.preferences.accountSettings", {
    defaultValue: "Account settings",
  });
  const cardSubheader = t("profile.preferences.accountTagline", {
    defaultValue: "Manage privacy, security, and billing in one place.",
  });

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const canToggleTheme = typeof colorMode?.toggleColorMode === "function";
  const isDarkMode = theme.palette.mode === "dark";
  const sectionTextColor = getSectionTextColor(theme);
  const sectionSubtextColor = getSectionSubtextColor(theme);
  const sectionDividerColor = getSectionDividerColor(theme);
  const accountHeadingSx = accountSectionHeadingStyles(theme);
  const accountCardBackground = getSectionBackground(theme, "account");
  const iconBackground = alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.12 : 0.08
  );
  const iconHighlight = alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.18 : 0.12
  );
  const themeStatusColor = alpha(sectionTextColor, isDarkMode ? 0.85 : 0.8);
  const visibilityStatusColor = isAccountHidden
    ? alpha(sectionTextColor, 0.75)
    : alpha(sectionTextColor, 0.95);
  const visibilitySwitchTrack = alpha(
    isAccountHidden ? theme.palette.warning.main : theme.palette.primary.main,
    0.45
  );
  const accountActionIconSx = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    pt: 0.5,
    borderRadius: "999px",
    padding: 0.75,
    backgroundColor: iconBackground,
    transition:
      "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
  };
  const headerGradientStart = isDarkMode
    ? lighten(accountCardBackground, 0.05)
    : darken(accountCardBackground, 0.05);
  const headerGradientEnd = isDarkMode
    ? darken(accountCardBackground, 0.12)
    : darken(accountCardBackground, 0.15);
  const headerShadow = isDarkMode
    ? "0 1px 0 rgba(255, 255, 255, 0.12)"
    : "0 1px 0 rgba(0, 0, 0, 0.08)";
  const switchThumbShadow = alpha(
    theme.palette.common.white,
    isDarkMode ? 0.35 : 0.25
  );
  const switchTrackChecked = alpha(theme.palette.primary.main, 0.45);
  const removeButtonGradient = `linear-gradient(90deg, ${darken(
    theme.palette.error.main,
    0.2
  )}, ${theme.palette.error.main})`;
  const removeButtonHoverGradient = `linear-gradient(90deg, ${darken(
    theme.palette.error.main,
    0.3
  )}, ${darken(theme.palette.error.main, 0.1)})`;
  const removeButtonDisabledBg = alpha(theme.palette.error.main, 0.4);
  const removeButtonTextColor = theme.palette.getContrastText(
    theme.palette.error.main
  );
  const removeButtonDisabledText = alpha(removeButtonTextColor, 0.7);

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

  const visibilityHelper = renderVisibilityHelper();

  const languagePreference = (
    <Box sx={createAccountActionStyles(canChangeLanguage, "default", 0)}>
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
              sx={accountActionIconSx}
            >
              <LanguageIcon color={canChangeLanguage ? "primary" : "disabled"} />
            </Box>
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                {t("app.language.label", { defaultValue: "Language" })}
              </Typography>
            <Typography
              variant="body2"
              sx={{
                color: sectionSubtextColor,
                fontSize: "0.875rem",
                lineHeight: 1.5,
              }}
            >
                {t("profile.preferences.languageDescription", {
                  defaultValue: "Select the language you want to see in the app.",
                })}
              </Typography>
            </Stack>
          </Stack>
          <FormControl
            size="small"
            disabled={!canChangeLanguage}
            sx={{ width: { xs: "100%", sm: 240 } }}
          >
            <InputLabel id="profile-language-select-label">
              {t("app.language.label")}
            </InputLabel>
            <Select
              labelId="profile-language-select-label"
              label={t("app.language.label")}
              value={currentLanguage}
              onChange={onLanguageChange}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {t(option.labelKey)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {!canChangeLanguage && changeLanguageReason && (
          <Typography variant="caption" color="text.secondary">
            {changeLanguageReason}
          </Typography>
        )}
      </Stack>
    </Box>
  );

  const themePreference = (
    <Box sx={createAccountActionStyles(canToggleTheme, "default", 1)}>
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
              sx={accountActionIconSx}
            >
              {isDarkMode ? (
                <Brightness7Icon color={canToggleTheme ? "primary" : "disabled"} />
              ) : (
                <Brightness4Icon color={canToggleTheme ? "primary" : "disabled"} />
              )}
            </Box>
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                {t("profile.preferences.theme", { defaultValue: "Appearance" })}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: sectionSubtextColor,
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                {t("profile.preferences.themeDescription", {
                  defaultValue:
                    "Switch between light and dark mode to match your environment.",
                })}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: themeStatusColor,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                }}
              >
                {isDarkMode
                  ? t("profile.preferences.darkModeActive", {
                      defaultValue: "Dark mode keeps things easy on the eyes.",
                    })
                  : t("profile.preferences.lightModeActive", {
                      defaultValue: "Light mode brightens up your experience.",
                    })}
              </Typography>
            </Stack>
          </Stack>
          <Switch
            checked={isDarkMode}
            onChange={() => {
              if (canToggleTheme) {
                colorMode.toggleColorMode();
              }
            }}
            disabled={!canToggleTheme}
            inputProps={{
              "aria-label": t("profile.preferences.themeToggleLabel", {
                defaultValue: "Toggle dark mode",
              }),
            }}
          sx={{
            "& .MuiSwitch-thumb": {
              boxShadow: `0 0 6px ${switchThumbShadow}`,
            },
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: theme.palette.getContrastText(theme.palette.primary.main),
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: switchTrackChecked,
            },
          }}
        />
        </Stack>
      </Stack>
    </Box>
  );

  const billingManagement = (
    <Box sx={createAccountActionStyles(canManagePayments, "default", 2)}>
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
              sx={accountActionIconSx}
            >
              <CreditCardIcon color={canManagePayments ? "primary" : "disabled"} />
            </Box>
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                {t("profile.preferences.billing", {
                  defaultValue: "Billing & subscriptions",
                })}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: sectionSubtextColor,
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                {t("profile.preferences.billingDescription", {
                  defaultValue: "Manage your plan, payment methods, and receipts.",
                })}
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CreditCardIcon />}
            onClick={onManagePayments}
            disabled={!canManagePayments}
            sx={{
              width: { xs: "100%", sm: "auto" },
              borderColor: sectionDividerColor,
              color: sectionTextColor,
              backgroundColor: "transparent",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: alpha(sectionDividerColor, 0.65),
                backgroundColor: iconHighlight,
              },
              "&.Mui-disabled": {
                opacity: 0.6,
                borderColor: alpha(sectionDividerColor, 0.4),
              },
            }}
          >
            {t("profile.preferences.manageBilling", {
              defaultValue: "Manage billing",
            })}
          </Button>
        </Stack>
        {!canManagePayments && capabilityReasons?.payments && (
          <Typography variant="caption" color="text.secondary">
            {capabilityReasons.payments}
          </Typography>
        )}
      </Stack>
    </Box>
  );

  const { sx: contentSx = {}, ...restContentProps } = featureCardContentProps;
  const {
    headerProps: incomingHeaderProps = {},
    avatarProps: incomingAvatarProps = {},
    sx: incomingCardSx = {},
    ...restFeatureCardProps
  } = featureCardProps;

  const {
    sx: headerSx = {},
    titleTypographyProps: incomingTitleTypographyProps = {},
    subheaderTypographyProps: incomingSubheaderTypographyProps = {},
    ...restHeaderProps
  } = incomingHeaderProps;

  const { sx: titleSx = {}, ...restTitleTypographyProps } = incomingTitleTypographyProps;
  const { sx: subheaderSx = {}, ...restSubheaderTypographyProps } =
    incomingSubheaderTypographyProps;

  const defaultHeaderSx = {
    background: `linear-gradient(90deg, ${headerGradientStart}, ${headerGradientEnd})`,
    color: sectionTextColor,
    px: { xs: 3, sm: 4 },
    py: { xs: 2.5, sm: 3 },
    boxShadow: headerShadow,
  };

  const headerProps = {
    ...restHeaderProps,
    sx: { ...defaultHeaderSx, ...headerSx },
    titleTypographyProps: {
      ...restTitleTypographyProps,
      sx: {
        color: sectionTextColor,
        letterSpacing: "0.02em",
        ...titleSx,
      },
    },
    subheaderTypographyProps: {
      ...restSubheaderTypographyProps,
      sx: {
        color: sectionSubtextColor,
        ...subheaderSx,
      },
    },
  };

  const { sx: avatarSx = {}, ...restAvatarProps } = incomingAvatarProps;
  const avatarProps = {
    ...restAvatarProps,
    sx: {
      backgroundColor: iconHighlight,
      color: sectionTextColor,
      ...avatarSx,
    },
  };

  const defaultCardSx = createSectionCardStyles("account");

  return (
    <FeatureCard
      title={cardTitle}
      subheader={cardSubheader}
      icon={SettingsIcon}
      headerProps={headerProps}
      avatarProps={avatarProps}
      contentProps={{
        component: Stack,
        spacing: 4,
        sx: { ...contentSx },
        ...restContentProps,
      }}
      sx={[defaultCardSx, incomingCardSx]}
      {...restFeatureCardProps}
    >
      <Stack spacing={3}>
        <Typography sx={accountHeadingSx}>{preferencesTitle}</Typography>
        {languagePreference}
        {themePreference}
        {billingManagement}
      </Stack>
      <Stack spacing={3}>
        <Typography sx={accountHeadingSx}>{securityTitle}</Typography>
        <Box sx={createAccountActionStyles(canToggleVisibility, "default", 0)}>
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
                  sx={accountActionIconSx}
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
                      color: sectionSubtextColor,
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
                      color: visibilityStatusColor,
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      transition: "opacity 0.35s ease, transform 0.35s ease",
                      opacity:
                        accountStatusLoading || isUpdatingAccountVisibility ? 0.7 : 1,
                      transform: "translateY(0)",
                    }}
                  >
                    {visibilityStatusText}
                  </Typography>
                  {visibilityHelper && <Box sx={{ pt: 0.25 }}>{visibilityHelper}</Box>}
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
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
                      boxShadow: `0 0 6px ${switchThumbShadow}`,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.palette.getContrastText(
                        isAccountHidden
                          ? theme.palette.warning.main
                          : theme.palette.primary.main
                      ),
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: visibilitySwitchTrack,
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
                  sx={[accountActionIconSx, { backgroundColor: alpha(theme.palette.error.main, 0.12) }]}
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
                      color: sectionSubtextColor,
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
                  background: removeButtonGradient,
                  border: "none",
                  color: removeButtonTextColor,
                  transition: "all 0.3s ease",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 0 0 rgba(0, 0, 0, 0.4)"
                      : "0 0 0 rgba(0, 0, 0, 0.25)",
                  "&:hover": {
                    background: removeButtonHoverGradient,
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 0 12px rgba(0, 0, 0, 0.45)"
                        : "0 0 12px rgba(0, 0, 0, 0.18)",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": {
                    background: removeButtonDisabledBg,
                    color: removeButtonDisabledText,
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
    </FeatureCard>
  );
}

export default AccountSettingsSection;
