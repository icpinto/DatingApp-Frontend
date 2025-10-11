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
import { alpha, darken, lighten, useTheme } from "@mui/material/styles";
import { useTranslation } from "../../../../i18n";
import useLegalContent from "../../../../shared/components/layout/useLegalContent";
import FeatureCard from "../../../../shared/components/FeatureCard";
import {
  createSectionCardStyles,
  getSectionBackground,
  getSectionDividerColor,
  getSectionSubtextColor,
  getSectionTextColor,
} from "../accountSettings/accountSectionTheme";

function HelpfulInformationSection({
  sectionTitleStyles,
  sx,
  useFeatureCard = true,
  featureCardProps = {},
  featureCardContentProps = {},
  featureCardHeaderProps = {},
  featureCardDividerProps = {},
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { tagline, sections, copyright } = useLegalContent();
  const [expanded, setExpanded] = useState(null);

  const isDarkMode = theme.palette.mode === "dark";
  const sectionBackground = getSectionBackground(theme, "legal");
  const sectionTextColor = getSectionTextColor(theme);
  const sectionSubtextColor = getSectionSubtextColor(theme);
  const sectionDividerColor = getSectionDividerColor(theme);
  const cardBaseSx = createSectionCardStyles("legal");
  const summaryHoverBase = isDarkMode
    ? lighten(sectionBackground, 0.08)
    : darken(sectionBackground, 0.04);
  const summaryActiveBase = isDarkMode
    ? lighten(sectionBackground, 0.12)
    : darken(sectionBackground, 0.06);
  const summaryHoverColor = alpha(summaryHoverBase, isDarkMode ? 0.9 : 0.85);
  const summaryActiveColor = alpha(summaryActiveBase, isDarkMode ? 0.95 : 0.9);
  const detailBaseColor = alpha(sectionBackground, isDarkMode ? 0.92 : 0.97);
  const detailActiveColor = alpha(
    isDarkMode ? lighten(sectionBackground, 0.05) : darken(sectionBackground, 0.02),
    isDarkMode ? 0.98 : 0.99
  );
  const cardShadow = isDarkMode
    ? "0px 20px 45px rgba(0, 0, 0, 0.35)"
    : "0px 18px 36px rgba(0, 0, 0, 0.12)";
  const accordionShadow = isDarkMode
    ? "0px 12px 32px rgba(0, 0, 0, 0.45)"
    : "0px 12px 24px rgba(0, 0, 0, 0.15)";

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
              border: `1px solid ${sectionDividerColor}`,
              borderLeft: "3px solid transparent",
              backgroundColor: alpha(sectionBackground, isDarkMode ? 0.75 : 0.9),
              transition:
                "transform 0.2s ease, box-shadow 0.2s ease, border-left-color 0.2s ease",
              "&::before": {
                display: "none",
              },
              "&.Mui-expanded": {
                boxShadow: accordionShadow,
                borderLeftColor: (theme) => theme.palette.primary.light,
              },
              "&:hover": {
                boxShadow: accordionShadow,
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
                  expanded === section.id ? summaryActiveColor : "transparent",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: summaryHoverColor,
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
                  <Typography variant="body2" sx={{ color: sectionSubtextColor }}>
                    {section.summary}
                  </Typography>
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: 2.5,
                py: 2.5,
                borderTop: `1px solid ${sectionDividerColor}`,
                backgroundColor:
                  expanded === section.id ? detailActiveColor : detailBaseColor,
              }}
            >
              <Stack spacing={1.75}>
                {section.body.map((paragraph, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ color: sectionSubtextColor }}
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
      borderColor: sectionDividerColor,
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
        color: sectionTextColor,
        letterSpacing: "0.02em",
        ...titleTypographyProps.sx,
      },
      ...titleTypographyProps,
    },
    subheaderTypographyProps: {
      sx: { color: sectionSubtextColor, ...subheaderTypographyProps.sx },
      ...subheaderTypographyProps,
    },
    ...restHeaderProps,
  };

  const { sx: contentSx = {}, ...restContentProps } = featureCardContentProps;
  const featureCardContent = {
    sx: {
      "& .MuiTypography-root": {
        color: sectionTextColor,
      },
      "& .MuiTypography-root.MuiTypography-colorTextSecondary": {
        color: sectionSubtextColor,
      },
      "& .MuiDivider-root": {
        borderColor: sectionDividerColor,
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
            border: `1px solid ${sectionDividerColor}`,
            backgroundColor: sectionBackground,
            color: sectionTextColor,
            boxShadow: cardShadow,
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
              <Typography variant="body2" sx={{ color: sectionSubtextColor }}>
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
        sx={[cardBaseSx, { border: `1px solid ${sectionDividerColor}`, boxShadow: cardShadow }, featureCardSx]}
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
