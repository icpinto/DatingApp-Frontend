import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink } from "react-router-dom";
import useLegalContent from "../../shared/components/layout/useLegalContent";
import { useTranslation } from "../../i18n";

function ProfileLegalInformation() {
  const { t } = useTranslation();
  const { tagline, links, copyright } = useLegalContent();

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<InfoOutlinedIcon color="primary" />}
        title={t("profile.legal.title", { defaultValue: "Helpful information" })}
        subheader={tagline}
      />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t("profile.legal.description", {
              defaultValue:
                "Learn more about how MatchUp protects your privacy, keeps things fair, and supports your membership.",
            })}
          </Typography>
          <Stack spacing={1.25}>
            {links.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                underline="hover"
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
          <Divider flexItem sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {copyright}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProfileLegalInformation;
