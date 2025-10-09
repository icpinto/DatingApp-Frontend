import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useLegalContent from "./useLegalContent";
import { useTranslation } from "../../../i18n";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

function LegalInfoDialog({ open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { links, tagline, copyright } = useLegalContent();
  const { t } = useTranslation();
  const description = t("app.legalInfo.description", {
    defaultValue:
      "Learn how MatchUp protects your privacy, keeps things fair, and supports your experience every step of the way.",
  });
  const highlight = t("app.legalInfo.highlight", {
    defaultValue: "Sri Lankan singles",
  });
  const taglineParts = tagline.split(highlight);
  const isDarkMode = theme.palette.mode === "dark";
  const headingColor = isDarkMode ? theme.palette.common.white : theme.palette.grey[900];
  const taglineColor = isDarkMode ? theme.palette.grey[100] : theme.palette.grey[800];
  const descriptionColor = isDarkMode ? theme.palette.grey[400] : theme.palette.grey[600];
  const accentColor = isDarkMode ? "#fb7185" : "#db2777";

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="legal-info-dialog-title"
    >
      <DialogTitle
        id="legal-info-dialog-title"
        sx={{
          p: 0,
          borderBottom: "none",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pt: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(90deg, #ec4899 0%, #f97316 100%)",
              p: "2px",
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                bgcolor:
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[900]
                    : theme.palette.background.paper,
                borderRadius: 3,
                textAlign: "center",
                px: { xs: 3, sm: 4 },
                py: { xs: 3, sm: 4 },
                boxShadow: theme.shadows[8],
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <InfoOutlined
                    sx={{
                      color: accentColor,
                      fontSize: 28,
                    }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ color: headingColor }}
                  >
                    {t("app.legalInfo.title", { defaultValue: "Helpful Information" })}
                  </Typography>
                </Stack>
                {taglineParts.length > 1 ? (
                  <Typography variant="subtitle1" sx={{ color: taglineColor }}>
                    {taglineParts[0]}
                    <Box component="span" sx={{ color: accentColor, fontWeight: 600 }}>
                      {highlight}
                    </Box>
                    {taglineParts.slice(1).join(highlight)}
                  </Typography>
                ) : (
                  <Typography variant="subtitle1" sx={{ color: taglineColor }}>
                    {tagline}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: descriptionColor,
                    maxWidth: 420,
                  }}
                >
                  {description}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            {links.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                underline="hover"
                color="inherit"
                onClick={onClose}
                sx={{ fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
          <Divider />
          <Typography variant="caption" color="text.secondary">
            {copyright}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          {t("common.actions.close", { defaultValue: "Close" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LegalInfoDialog;
