import React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SettingsIcon from "@mui/icons-material/Settings";
import FeatureCard from "../../../../shared/components/FeatureCard";
import {
  createAccountActionStyles,
  accountSectionHeadingStyles,
  SECTION_SUBTEXT_COLOR,
} from "./accountSectionTheme";

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
  useFeatureCard = true,
  featureCardProps = {},
  featureCardContentProps = {},
}) {
  const title = t("profile.preferences.accountPreferencesTitle", {
    defaultValue: "Account Preferences",
  });

  const languagePreference = (
    <Box sx={createAccountActionStyles(canChangeLanguage, "default", 0)}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
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
                color: SECTION_SUBTEXT_COLOR,
                fontSize: "0.875rem",
                lineHeight: 1.5,
              }}
            >
              {t("profile.preferences.languageDescription", {
                defaultValue: "Select the language you want to see in the app.",
              })}
            </Typography>
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

  const billingManagement = (
    <Box sx={createAccountActionStyles(canManagePayments, "default", 1)}>
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
                  color: SECTION_SUBTEXT_COLOR,
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
              borderColor: "rgba(148, 163, 184, 0.45)",
              color: "rgba(226, 232, 240, 0.85)",
              backgroundColor: "transparent",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "rgba(226, 232, 240, 0.75)",
                backgroundColor: "rgba(24, 29, 40, 0.9)",
              },
              "&.Mui-disabled": {
                opacity: 0.5,
                borderColor: "rgba(148, 163, 184, 0.2)",
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

  if (!useFeatureCard) {
    return (
      <Stack spacing={3}>
        <Typography sx={accountSectionHeadingStyles}>{title}</Typography>
        {languagePreference}
        {billingManagement}
      </Stack>
    );
  }

  const { sx: contentSx = {}, ...restContentProps } = featureCardContentProps;

  return (
    <FeatureCard
      title={title}
      icon={SettingsIcon}
      contentProps={{
        component: Stack,
        spacing: 3,
        sx: { ...contentSx },
        ...restContentProps,
      }}
      {...featureCardProps}
    >
      {languagePreference}
      {billingManagement}
    </FeatureCard>
  );
}

export default AccountSettingsSection;
