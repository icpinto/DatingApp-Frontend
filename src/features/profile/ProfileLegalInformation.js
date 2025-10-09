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
import { alpha } from "@mui/material/styles";
import useLegalContent from "../../shared/components/layout/useLegalContent";
import { useTranslation } from "../../i18n";

const SECTION_BACKGROUND = "#111827";
const SECTION_TEXT_COLOR = "rgba(248, 250, 252, 0.94)";
const SECTION_SUBTEXT_COLOR = "rgba(226, 232, 240, 0.72)";
const SECTION_DIVIDER_COLOR = "rgba(148, 163, 184, 0.28)";
const SUMMARY_HOVER_COLOR = alpha("#1f2937", 0.45);
const SUMMARY_ACTIVE_COLOR = alpha("#1f2937", 0.58);
const DETAIL_BASE_COLOR = alpha("#0f172a", 0.72);
const DETAIL_ACTIVE_COLOR = alpha("#0f172a", 0.88);

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
    <Card
      elevation={6}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: SECTION_BACKGROUND,
        color: SECTION_TEXT_COLOR,
        border: `1px solid ${SECTION_DIVIDER_COLOR}`,
        boxShadow: "0px 20px 45px rgba(15, 23, 42, 0.35)",
        "& .MuiCardHeader-title": {
          color: SECTION_TEXT_COLOR,
          letterSpacing: "0.02em",
        },
        "& .MuiCardHeader-subheader": {
          color: SECTION_SUBTEXT_COLOR,
        },
        "& .MuiTypography-root": {
          color: SECTION_TEXT_COLOR,
        },
        "& .MuiTypography-root.MuiTypography-colorTextSecondary": {
          color: SECTION_SUBTEXT_COLOR,
        },
        "& .MuiDivider-root": {
          borderColor: SECTION_DIVIDER_COLOR,
        },
      }}
    >
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
                  border: `1px solid ${SECTION_DIVIDER_COLOR}`,
                  borderLeft: "3px solid transparent",
                  backgroundColor: alpha("#0f172a", 0.55),
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, border-left-color 0.2s ease",
                  "&::before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    boxShadow: "0px 12px 32px rgba(15, 23, 42, 0.45)",
                    borderLeftColor: (theme) => theme.palette.primary.light,
                  },
                  "&:hover": {
                    boxShadow: "0px 12px 32px rgba(15, 23, 42, 0.45)",
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
                        transition: "transform 0.2s ease",
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
                    backgroundColor:
                      expanded === section.id ? SUMMARY_ACTIVE_COLOR : "transparent",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: SUMMARY_HOVER_COLOR,
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
                      <Typography variant="body2" sx={{ color: SECTION_SUBTEXT_COLOR }}>
                        {section.summary}
                      </Typography>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 2.5,
                    py: 2.5,
                    borderTop: `1px solid ${SECTION_DIVIDER_COLOR}`,
                    backgroundColor:
                      expanded === section.id ? DETAIL_ACTIVE_COLOR : DETAIL_BASE_COLOR,
                  }}
                >
                  <Stack spacing={1.75}>
                    {section.body.map((paragraph, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{ color: SECTION_SUBTEXT_COLOR }}
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
