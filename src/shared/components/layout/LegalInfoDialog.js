import React from "react";
import {
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

function LegalInfoDialog({ open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { links, tagline, copyright } = useLegalContent();
  const { t } = useTranslation();

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="legal-info-dialog-title"
    >
      <DialogTitle id="legal-info-dialog-title">
        {t("app.legalInfo.title", { defaultValue: "Helpful Information" })}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {tagline}
          </Typography>
          <Divider />
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
