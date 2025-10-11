import React, { useCallback } from "react";
import { Alert, Container, Snackbar, Stack } from "@mui/material";

import { CAPABILITIES } from "../../../domain/capabilities";
import { useTranslation } from "../../../i18n";
import { useAccountLifecycle } from "../../../shared/context/AccountLifecycleContext";
import { useUserCapabilities } from "../../../shared/context/UserContext";
import { spacing } from "../../../styles";
import { useRequestLists } from "../hooks/useRequestLists";
import { useRequestProfiles } from "../hooks/useRequestProfiles";
import Guard from "../ui/Guard";
import IncomingRequestsList from "../ui/IncomingRequestsList";
import SentRequestsList from "../ui/SentRequestsList";

function MatchesContent({ onRequestCountChange = () => {}, accountLifecycle }) {
  const { groups } = useUserCapabilities();
  const { t } = useTranslation();

  const requestCapabilities = groups.requests;
  const canViewReceived = requestCapabilities.viewReceived.can;
  const canViewSent = requestCapabilities.viewSent.can;
  const canRespond = requestCapabilities.respond.can;
  const isDeactivated = accountLifecycle?.isDeactivated;

  const {
    requests,
    sentRequests,
    loading,
    receivedError,
    sentError,
    acceptRequest,
    rejectRequest,
    actionFeedback,
    clearActionFeedback,
    actionInProgress,
  } = useRequestLists({
    canViewReceived,
    canViewSent,
    onRequestCountChange,
  });

  const getSenderId = useCallback((request) => request.sender_id, []);
  const getReceiverId = useCallback((request) => request.receiver_id, []);

  const profiles = useRequestProfiles({
    requests,
    canView: canViewReceived,
    capability: CAPABILITIES.REQUESTS_VIEW_RECEIVED,
    getUserId: getSenderId,
  });

  const sentProfiles = useRequestProfiles({
    requests: sentRequests,
    canView: canViewSent,
    capability: CAPABILITIES.REQUESTS_VIEW_SENT,
    getUserId: getReceiverId,
  });

  const handleFeedbackClose = useCallback(
    (_, reason) => {
      if (reason === "clickaway") {
        return;
      }
      clearActionFeedback();
    },
    [clearActionFeedback]
  );

  const handleAccept = useCallback(
    (id) => {
      if (!canRespond) {
        return;
      }

      return acceptRequest(id);
    },
    [acceptRequest, canRespond]
  );

  const handleReject = useCallback(
    (id) => {
      if (!canRespond) {
        return;
      }

      return rejectRequest(id);
    },
    [canRespond, rejectRequest]
  );

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <Guard can={CAPABILITIES.REQUESTS_VIEW_RECEIVED}>
          <IncomingRequestsList
            requests={requests}
            profiles={profiles}
            loading={loading}
            error={receivedError}
            canRespond={canRespond}
            isDeactivated={isDeactivated}
            onAccept={handleAccept}
            onReject={handleReject}
            actionInProgress={actionInProgress}
          />
        </Guard>
        <Guard can={CAPABILITIES.REQUESTS_VIEW_SENT}>
          <SentRequestsList
            requests={sentRequests}
            profiles={sentProfiles}
            loading={loading}
            error={sentError}
          />
        </Guard>
      </Stack>
      <Snackbar
        open={Boolean(actionFeedback)}
        autoHideDuration={5000}
        onClose={handleFeedbackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {actionFeedback ? (
          <Alert
            onClose={handleFeedbackClose}
            severity={actionFeedback.severity}
            sx={{ width: "100%" }}
          >
            {t(actionFeedback.messageKey)}
          </Alert>
        ) : null}
      </Snackbar>
    </Container>
  );
}

function Matches(props) {
  const accountLifecycle = useAccountLifecycle();

  return <MatchesContent {...props} accountLifecycle={accountLifecycle} />;
}

export default Matches;
