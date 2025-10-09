import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { lighten } from "@mui/material/styles";
import useLegalContent from "../../shared/components/layout/useLegalContent";
import { useTranslation } from "../../i18n";

function ProfileLegalInformation() {
  const { t } = useTranslation();
  const { tagline, sections, copyright } = useLegalContent();
  const [expanded, setExpanded] = useState(null);

  const handleAccordionChange = (sectionId) => (_event, isExpanded) => {
    setExpanded(isExpanded ? sectionId : null);
  };

  const sectionIcons = {
    privacy: PrivacyTipOutlinedIcon,
    terms: GavelOutlinedIcon,
    pricing: DiamondOutlinedIcon,
    support: SupportAgentOutlinedIcon,
  };

  const renderSectionIcon = (sectionId) => {
    const IconComponent = sectionIcons[sectionId] ?? InfoOutlinedIcon;
    return <IconComponent color="primary" sx={{ fontSize: 28 }} />;
  };

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
          <Stack spacing={2.5}>
            {sections.map((section) => (
              <Accordion
                key={section.id}
                disableGutters
                square={false}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: (theme) => `1px solid ${lighten(theme.palette.divider, 0.3)}`,
                  transition: (theme) =>
                    theme.transitions.create(["box-shadow", "transform", "border"], {
                      duration: theme.transitions.duration.short,
                    }),
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    display: "none",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: "linear-gradient(180deg, #FF4F87 0%, #F73D7A 100%)",
                  },
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                }}
                expanded={expanded === section.id}
                onChange={handleAccordionChange(section.id)}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        transition: (theme) =>
                          theme.transitions.create("transform", {
                            duration: theme.transitions.duration.shortest,
                          }),
                        transform:
                          expanded === section.id ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  }
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                    },
                    px: 2.5,
                    py: 2,
                    transition: (theme) =>
                      theme.transitions.create("background-color", {
                        duration: theme.transitions.duration.short,
                      }),
                    backgroundColor: (theme) =>
                      expanded === section.id
                        ? lighten(theme.palette.background.paper, 0.04)
                        : "transparent",
                    "&:hover": {
                      backgroundColor: (theme) =>
                        lighten(theme.palette.background.paper, 0.08),
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pt: 0.5,
                      }}
                    >
                      {renderSectionIcon(section.id)}
                    </Box>
                    <Stack spacing={0.75}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          letterSpacing: 0.2,
                        }}
                      >
                        {section.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          color: (theme) => lighten(theme.palette.text.secondary, 0.1),
                        }}
                      >
                        {section.summary}
                      </Typography>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 2.5,
                    py: 2.5,
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    background: (theme) =>
                      lighten(theme.palette.background.paper, expanded === section.id ? 0.06 : 0.03),
                  }}
                >
                  <Stack spacing={1.75}>
                    {section.body.map((paragraph, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          color: (theme) => lighten(theme.palette.text.secondary, 0.08),
                        }}
                      >
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
