import React from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import Forum from "@mui/icons-material/Forum";

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
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "secondary.main" }}>
            <Forum />
          </Avatar>
        }
        title={t("profile.viewer.requestCard.title", { name: displayName })}
        subheader={t("profile.viewer.requestCard.description")}
      />
      <Divider />
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

export default ProfileRequestCard;
