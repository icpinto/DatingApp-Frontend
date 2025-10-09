import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useLegalContent from "../../shared/components/layout/useLegalContent";
import { useTranslation } from "../../i18n";

function ProfileLegalInformation() {
  const { t } = useTranslation();
  const { tagline, sections, copyright } = useLegalContent();

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
          <Stack spacing={1.5}>
            {sections.map((section) => (
              <Accordion
                key={section.id}
                disableGutters
                square={false}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {section.summary}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1.5}>
                    {section.body.map((paragraph, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        {paragraph}
                      </Typography>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
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
