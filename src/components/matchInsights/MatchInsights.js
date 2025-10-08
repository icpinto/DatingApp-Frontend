import React from "react";
import { Alert, Box, Stack } from "@mui/material";
import CorePreferencesForm from "./CorePreferencesForm";
import QuestionsComponent from "../questions/Questions";
import { spacing } from "../../styles";
import { useAccountLifecycle } from "../../context/AccountLifecycleContext";
import { CAPABILITIES } from "../../utils/capabilities";
import Guard from "./Guard";
import { useUserCapabilities, useUserContext } from "../../context/UserContext";

const QuestionnaireSection = ({ lifecycleLoading }) => {
  const { groups } = useUserCapabilities();
  const insightCapabilities = groups.insights;
  const answerCapability = insightCapabilities.answerQuestionnaire;
  const viewQuestionnaireCapability = insightCapabilities.viewQuestionnaire;
  const viewDashboardCapability = insightCapabilities.viewDashboard;
  const canAnswer = answerCapability.can;

  const questionnaireLockReason = canAnswer
    ? undefined
    : answerCapability.reason ||
      "Save your core match preferences to unlock the questionnaire.";

  const questionnaireFallback = (
    <Alert severity="info" sx={{ borderRadius: 2 }}>
      {viewQuestionnaireCapability.reason ||
        questionnaireLockReason ||
        "Match questionnaire is currently unavailable."}
    </Alert>
  );

  const dashboardFallback = (
    <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        {viewDashboardCapability.reason ||
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
  const { updateCorePreferencesStatus } = useUserContext();

  React.useEffect(() => {
    updateCorePreferencesStatus({ loading: accountLifecycle?.loading });
    return () => {
      updateCorePreferencesStatus({ loading: false });
    };
  }, [accountLifecycle?.loading, updateCorePreferencesStatus]);

  return (
    <QuestionnaireSection lifecycleLoading={accountLifecycle?.loading} />
  );
}

export default MatchInsights;
