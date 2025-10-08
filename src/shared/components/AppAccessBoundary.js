import React, { useEffect } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { CAPABILITIES } from "../../domain/capabilities";
import { cancelAllRequests } from "../services/api";
import { useWebSocket } from "../context/WebSocketProvider";
import { useUserCapabilities, useUserContext } from "../context/UserContext";

const AppAccessBoundary = ({ children }) => {
  const { hasCapability, getReason } = useUserCapabilities();
  const { clearConversationFacts } = useUserContext();
  const socket = useWebSocket();
  const canViewApp = hasCapability
    ? hasCapability(CAPABILITIES.APP_VIEW_SHELL)
    : true;
  const reason = getReason
    ? getReason(CAPABILITIES.APP_VIEW_SHELL)
    : null;

  useEffect(() => {
    if (canViewApp) {
      return;
    }

    cancelAllRequests();
    if (socket?.shutdown) {
      socket.shutdown();
    }
    if (clearConversationFacts) {
      clearConversationFacts();
    }
  }, [canViewApp, socket, clearConversationFacts]);

  if (!canViewApp) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Box maxWidth={480} width="100%">
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" component="p" gutterBottom>
              Access temporarily unavailable
            </Typography>
            <Typography variant="body2" component="p">
              {reason ||
                "Your account no longer has access to the app experience. Please contact support if you believe this is a mistake."}
            </Typography>
          </Alert>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AppAccessBoundary;
