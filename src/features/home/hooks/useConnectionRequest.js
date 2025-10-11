import { useCallback } from "react";
import { sendConnectionRequestApi } from "../api/home.api";
import { normalizeUserId } from "../utils/normalizeUserId";
import { isAbortError } from "../../../utils/http";

const REQUEST_MESSAGE_ERROR_KEY = "home.validation.requestMessageRequired";

export function useConnectionRequest({
  discoveryDisabled,
  canSendRequest,
  requestMessage,
  setRequestMessage,
  setRequestMessageError,
  setFeedback,
  setProfileData,
}) {
  return useCallback(
    async (rawUserId) => {
      if (discoveryDisabled || !canSendRequest) {
        return;
      }

      const normalizedUserId = normalizeUserId(rawUserId);
      if (normalizedUserId === undefined) {
        return;
      }

      const trimmedMessage = requestMessage.trim();
      if (!trimmedMessage) {
        setRequestMessageError(REQUEST_MESSAGE_ERROR_KEY);
        return;
      }

      setRequestMessageError("");

      try {
        const parsedId = Number(normalizedUserId);
        const receiverId = Number.isNaN(parsedId) ? normalizedUserId : parsedId;
        await sendConnectionRequestApi(receiverId, trimmedMessage);
        setProfileData((prev) => ({ ...prev, requestStatus: true }));
        setFeedback({ type: "success", key: "home.messages.requestSuccess" });
        setRequestMessage(trimmedMessage);
      } catch (error) {
        if (!isAbortError(error)) {
          setFeedback({ type: "error", key: "home.messages.requestError" });
        }
      }
    },
    [
      canSendRequest,
      discoveryDisabled,
      requestMessage,
      setFeedback,
      setProfileData,
      setRequestMessage,
      setRequestMessageError,
    ]
  );
}

export { REQUEST_MESSAGE_ERROR_KEY };
