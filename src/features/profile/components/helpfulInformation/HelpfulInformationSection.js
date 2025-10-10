import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "../../../../i18n";
import ProfileLegalInformation from "../../ProfileLegalInformation";

function HelpfulInformationSection({ sectionTitleStyles, sx }) {
  const { t } = useTranslation();

  return (
    <Box component="section" sx={sx}>
      <Typography variant="overline" sx={sectionTitleStyles}>
        {t("profile.sections.trustSafety", {
          defaultValue: "TRUST & SAFETY",
        })}
      </Typography>
      <ProfileLegalInformation />
    </Box>
  );
}

export default HelpfulInformationSection;
