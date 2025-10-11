import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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
import { useTranslation } from "../../../../i18n";
import useLegalContent from "../../../../shared/components/layout/useLegalContent";
import FeatureCard from "../../../../shared/components/FeatureCard";

const SECTION_BACKGROUND = "#111111";
const SECTION_TEXT_COLOR = "rgba(245, 245, 245, 0.94)";
const SECTION_SUBTEXT_COLOR = "rgba(215, 215, 215, 0.72)";
const SECTION_DIVIDER_COLOR = "rgba(255, 255, 255, 0.18)";
const SUMMARY_HOVER_COLOR = alpha("#1c1c1c", 0.45);
const SUMMARY_ACTIVE_COLOR = alpha("#1c1c1c", 0.6);
const DETAIL_BASE_COLOR = alpha("#0f0f0f", 0.72);
const DETAIL_ACTIVE_COLOR = alpha("#0f0f0f", 0.88);

function HelpfulInformationSection({
  sectionTitleStyles,
  sx,
  useFeatureCard = true,
  featureCardProps = {},
  featureCardContentProps = {},
  featureCardHeaderProps = {},
  featureCardDividerProps = {},
}) {
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

  const helpfulInfoContent = (
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
              backgroundColor: alpha("#111111", 0.65),
              transition:
                "transform 0.2s ease, box-shadow 0.2s ease, border-left-color 0.2s ease",
              "&::before": {
                display: "none",
              },
              "&.Mui-expanded": {
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.45)",
                borderLeftColor: (theme) => theme.palette.primary.light,
              },
              "&:hover": {
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.45)",
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
  );

  const title = t("profile.legal.title", { defaultValue: "Helpful information" });

  const { sx: dividerSx = {}, ...restDividerProps } = featureCardDividerProps;
  const featureCardDivider = {
    sx: {
      borderColor: SECTION_DIVIDER_COLOR,
      borderStyle: "solid",
      ...dividerSx,
    },
    ...restDividerProps,
  };

  const {
    sx: headerSx = {},
    titleTypographyProps = {},
    subheaderTypographyProps = {},
    ...restHeaderProps
  } = featureCardHeaderProps;
  const featureCardHeader = {
    sx: {
      backgroundColor: "transparent",
      ...headerSx,
    },
    titleTypographyProps: {
      sx: {
        color: SECTION_TEXT_COLOR,
        letterSpacing: "0.02em",
        ...titleTypographyProps.sx,
      },
      ...titleTypographyProps,
    },
    subheaderTypographyProps: {
      sx: { color: SECTION_SUBTEXT_COLOR, ...subheaderTypographyProps.sx },
      ...subheaderTypographyProps,
    },
    ...restHeaderProps,
  };

  const { sx: contentSx = {}, ...restContentProps } = featureCardContentProps;
  const featureCardContent = {
    sx: {
      "& .MuiTypography-root": {
        color: SECTION_TEXT_COLOR,
      },
      "& .MuiTypography-root.MuiTypography-colorTextSecondary": {
        color: SECTION_SUBTEXT_COLOR,
      },
      "& .MuiDivider-root": {
        borderColor: SECTION_DIVIDER_COLOR,
      },
      ...contentSx,
    },
    ...restContentProps,
  };

  const { sx: featureCardSx = {}, ...restFeatureCardProps } = featureCardProps;

  const sectionHeading = (
    <Typography variant="overline" sx={sectionTitleStyles}>
      {t("profile.sections.trustSafety", {
        defaultValue: "TRUST & SAFETY",
      })}
    </Typography>
  );

  if (!useFeatureCard) {
    return (
      <Box component="section" sx={sx}>
        {sectionHeading}
        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${SECTION_DIVIDER_COLOR}`,
            backgroundColor: SECTION_BACKGROUND,
            color: SECTION_TEXT_COLOR,
            boxShadow: "0px 20px 45px rgba(0, 0, 0, 0.35)",
            p: { xs: 2.5, sm: 3 },
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <InfoOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: "0.02em" }}>
                {title}
              </Typography>
            </Stack>
            {tagline && (
              <Typography variant="body2" sx={{ color: SECTION_SUBTEXT_COLOR }}>
                {tagline}
              </Typography>
            )}
            {helpfulInfoContent}
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="section" sx={sx}>
      {sectionHeading}
      <FeatureCard
        title={title}
        subheader={tagline}
        icon={InfoOutlinedIcon}
        sx={{
          backgroundColor: SECTION_BACKGROUND,
          color: SECTION_TEXT_COLOR,
          border: `1px solid ${SECTION_DIVIDER_COLOR}`,
          boxShadow: "0px 20px 45px rgba(0, 0, 0, 0.35)",
          ...featureCardSx,
        }}
        dividerProps={featureCardDivider}
        headerProps={featureCardHeader}
        contentProps={featureCardContent}
        {...restFeatureCardProps}
      >
        {helpfulInfoContent}
      </FeatureCard>
    </Box>
  );
}

export default HelpfulInformationSection;
