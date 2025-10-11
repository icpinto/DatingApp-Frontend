import { useCallback, useState } from "react";

export function useRequestMessaging() {
  const [feedback, setFeedback] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestMessageError, setRequestMessageError] = useState("");

  const resetRequestMessaging = useCallback(() => {
    setFeedback(null);
    setRequestMessage("");
    setRequestMessageError("");
  }, []);

  return {
    feedback,
    setFeedback,
    requestMessage,
    setRequestMessage,
    requestMessageError,
    setRequestMessageError,
    resetRequestMessaging,
  };
}
