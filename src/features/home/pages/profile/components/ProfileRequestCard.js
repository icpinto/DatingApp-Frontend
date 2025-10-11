import React from "react";
import { Alert, Button, Stack, TextField } from "@mui/material";
import Forum from "@mui/icons-material/Forum";
import FeatureCard from "../../../../../shared/components/FeatureCard";

function ProfileRequestCard({
  displayName,
  requestMessage,
  onRequestMessageChange,
  onSendRequest,
  helperText,
  requestMessageError,
  isAllowed,
  isRequestDisabled,
  requestStatus,
  sendingRequest,
  sendRequestReason,
  feedback,
  t,
}) {
  const buttonLabel = sendingRequest
    ? t("home.labels.sendingRequest", { defaultValue: "Sending..." })
    : requestStatus
    ? t("home.labels.requestSent")
    : t("home.labels.sendRequest");

  return (
    <FeatureCard
      icon={Forum}
      avatarProps={{ sx: { bgcolor: "secondary.main" } }}
      title={t("profile.viewer.requestCard.title", { name: displayName })}
      subheader={t("profile.viewer.requestCard.description")}
    >
      <Stack spacing={3}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label={t("home.labels.requestMessage")}
          value={requestMessage}
          onChange={onRequestMessageChange}
          helperText={helperText}
          error={Boolean(requestMessageError)}
          disabled={requestStatus || !isAllowed}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            onClick={onSendRequest}
            disabled={isRequestDisabled}
          >
            {buttonLabel}
          </Button>
        </Stack>
        {!isAllowed && sendRequestReason && (
          <Alert severity="info">{sendRequestReason}</Alert>
        )}
        {feedback?.key && (
          <Alert severity={feedback.type === "error" ? "error" : "success"}>
            {t(feedback.key)}
          </Alert>
        )}
      </Stack>
    </FeatureCard>
  );
}

export default ProfileRequestCard;
