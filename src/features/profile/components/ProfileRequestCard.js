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
import { Forum } from "@mui/icons-material";
import Guard from "../Guard";
import { CAPABILITIES } from "../../../domain/capabilities";
import { spacing } from "../../../styles";

const ProfileRequestCard = ({
  displayName,
  requestMessage,
  requestMessageError,
  requestStatus,
  sendingRequest,
  sendRequestReason,
  feedback,
  onRequestMessageChange,
  onSendRequest,
  t,
}) => (
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
      <Guard can={CAPABILITIES.PROFILE_SEND_REQUEST}>
        {({ isAllowed }) => {
          const helperText = requestMessageError
            ? t(requestMessageError)
            : isAllowed
            ? t("home.helpers.requestMessage")
            : sendRequestReason ||
              "Activate your profile to send a connection request.";

          const isRequestDisabled = requestStatus || sendingRequest || !isAllowed;

          return (
            <Stack spacing={spacing.section}>
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
                  onClick={() => {
                    if (!isAllowed) {
                      return;
                    }
                    onSendRequest();
                  }}
                  disabled={isRequestDisabled}
                >
                  {requestStatus
                    ? t("home.labels.requestSent")
                    : t("home.labels.sendRequest")}
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
          );
        }}
      </Guard>
    </CardContent>
  </Card>
);

export default ProfileRequestCard;
