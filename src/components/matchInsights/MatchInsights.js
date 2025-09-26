import React, { useCallback, useState } from "react";
import { Box, Stack } from "@mui/material";
import CorePreferencesForm from "./CorePreferencesForm";
import QuestionsComponent from "../questions/Questions";
import { spacing } from "../../styles";

const defaultStatus = { isLoading: true, isReady: false };

function MatchInsights() {
  const [coreStatus, setCoreStatus] = useState(defaultStatus);

  const handleStatusChange = useCallback((status = defaultStatus) => {
    setCoreStatus((prev) => {
      if (
        prev.isLoading === status.isLoading &&
        prev.isReady === status.isReady
      ) {
        return prev;
      }
      return status;
    });
  }, []);

  const isQuestionnaireLocked = coreStatus.isLoading ? true : !coreStatus.isReady;
  const lockReason = coreStatus.isLoading
    ? "Loading your preferences..."
    : "Save your core match preferences to unlock the questionnaire.";

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 }, pb: 12 }}>
      <Stack spacing={spacing.pagePadding}>
        <CorePreferencesForm onStatusChange={handleStatusChange} />
        <QuestionsComponent isLocked={isQuestionnaireLocked} lockReason={lockReason} />
      </Stack>
    </Box>
  );
}

export default MatchInsights;
