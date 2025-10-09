import React, { useMemo } from "react";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "../../../i18n";

function AppFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const links = useMemo(
    () => [
      { to: "/privacy-policy", label: t("app.footer.privacy", { defaultValue: "Privacy Policy" }) },
      { to: "/terms", label: t("app.footer.terms", { defaultValue: "Terms of Service" }) },
      { to: "/pricing", label: t("app.footer.pricing", { defaultValue: "Pricing" }) },
      { to: "/help", label: t("app.footer.help", { defaultValue: "Help Centre" }) },
    ],
    [t]
  );

  return (
    <Box
      component="footer"
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        mt: { xs: 6, md: 10 },
        py: { xs: 4, md: 6 },
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[50]
            : theme.palette.background.paper,
      }}
    >
      <Container>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            {t("app.footer.tagline", {
              defaultValue: "Guiding Sri Lankan singles with care and respect.",
            })}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {links.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                color="inherit"
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t("app.footer.copyright", {
              defaultValue: "© {{year}} MatchUp. All rights reserved.",
              year,
            })}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default AppFooter;
