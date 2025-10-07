import React from "react";
import { Alert, Box, Stack } from "@mui/material";
import CorePreferencesForm from "./CorePreferencesForm";
import QuestionsComponent from "../questions/Questions";
import { spacing } from "../../styles";
import { useAccountLifecycle } from "../../context/AccountLifecycleContext";
import { CAPABILITIES } from "../../utils/capabilities";
import Guard from "./Guard";
import { UserProvider, useUserCapabilities } from "./UserContext";

const QuestionnaireSection = ({ lifecycleLoading }) => {
  const { hasCapability, getReason } = useUserCapabilities();
  const canAnswer = hasCapability(CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE);

  const questionnaireLockReason = canAnswer
    ? undefined
    : getReason(CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE) ||
      "Save your core match preferences to unlock the questionnaire.";

  const questionnaireFallback = (
    <Alert severity="info" sx={{ borderRadius: 2 }}>
      {getReason(CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE) ||
        questionnaireLockReason ||
        "Match questionnaire is currently unavailable."}
    </Alert>
  );

  const dashboardFallback = (
    <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        {getReason(CAPABILITIES.INSIGHTS_VIEW_DASHBOARD) ||
          "Match insights are currently unavailable."}
      </Alert>
    </Box>
  );

  return (
    <Guard can={CAPABILITIES.INSIGHTS_VIEW_DASHBOARD} fallback={dashboardFallback}>
      <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 }, pb: 12 }}>
        <Stack spacing={spacing.pagePadding}>
          <CorePreferencesForm lifecycleLoading={lifecycleLoading} />
          <Guard can={CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE} fallback={questionnaireFallback}>
            <QuestionsComponent
              isLocked={!canAnswer}
              lockReason={canAnswer ? undefined : questionnaireLockReason}
            />
          </Guard>
        </Stack>
      </Box>
    </Guard>
  );
};

function MatchInsights() {
  const accountLifecycle = useAccountLifecycle();

  return (
    <UserProvider
      accountStatus={accountLifecycle?.status}
      lifecycleLoading={accountLifecycle?.loading}
    >
      <QuestionnaireSection lifecycleLoading={accountLifecycle?.loading} />
    </UserProvider>
  );
}

export default MatchInsights;
