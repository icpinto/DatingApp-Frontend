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
import { alpha } from "@mui/material/styles";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink } from "react-router-dom";
import useLegalContent from "./useLegalContent";
import { useTranslation } from "../../../i18n";

const SECTION_BACKGROUND = "#111827";
const SECTION_TEXT_COLOR = "rgba(248, 250, 252, 0.94)";
const SECTION_SUBTEXT_COLOR = "rgba(226, 232, 240, 0.72)";
const SECTION_DIVIDER_COLOR = "rgba(148, 163, 184, 0.28)";
const SECTION_SURFACE_COLOR = alpha("#0f172a", 0.55);

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
  const accentColor = theme.palette.primary.light;

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="legal-info-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: SECTION_BACKGROUND,
          color: SECTION_TEXT_COLOR,
          border: `1px solid ${SECTION_DIVIDER_COLOR}`,
          boxShadow: "0px 20px 45px rgba(15, 23, 42, 0.35)",
        },
      }}
    >
      <DialogTitle
        id="legal-info-dialog-title"
        sx={{
          px: { xs: 3, sm: 4 },
          pt: { xs: 3, sm: 4 },
          pb: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${SECTION_DIVIDER_COLOR}`,
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <InfoOutlined
              sx={{
                color: accentColor,
                fontSize: 28,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: SECTION_TEXT_COLOR,
              }}
            >
              {t("app.legalInfo.title", { defaultValue: "Helpful Information" })}
            </Typography>
          </Stack>
          {taglineParts.length > 1 ? (
            <Typography
              variant="subtitle2"
              sx={{ color: SECTION_SUBTEXT_COLOR }}
            >
              {taglineParts[0]}
              <Box component="span" sx={{ color: accentColor, fontWeight: 600 }}>
                {highlight}
              </Box>
              {taglineParts.slice(1).join(highlight)}
            </Typography>
          ) : (
            <Typography variant="subtitle2" sx={{ color: SECTION_SUBTEXT_COLOR }}>
              {tagline}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{
              color: SECTION_SUBTEXT_COLOR,
              maxWidth: 420,
            }}
          >
            {description}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 3,
          pb: 3.5,
          px: { xs: 3, sm: 4 },
          backgroundColor: SECTION_SURFACE_COLOR,
          borderTop: `1px solid ${SECTION_DIVIDER_COLOR}`,
          borderBottom: `1px solid ${SECTION_DIVIDER_COLOR}`,
          "& .MuiDivider-root": {
            borderColor: SECTION_DIVIDER_COLOR,
          },
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            {links.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                underline="hover"
                color={SECTION_TEXT_COLOR}
                onClick={onClose}
                sx={{
                  fontWeight: 500,
                  transition: "color 0.2s ease",
                  "&:hover": {
                    color: accentColor,
                  },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
          <Divider />
          <Typography variant="caption" sx={{ color: SECTION_SUBTEXT_COLOR }}>
            {copyright}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 2, sm: 2.5 },
          backgroundColor: alpha("#0f172a", 0.7),
          borderTop: `1px solid ${SECTION_DIVIDER_COLOR}`,
        }}
      >
        <Button onClick={onClose} autoFocus variant="contained" color="primary">
          {t("common.actions.close", { defaultValue: "Close" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LegalInfoDialog;
