import React, { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import QuizIcon from "@mui/icons-material/Quiz";
import Home from "../home/Home";
import Requests from "../requests/Requests";
import Messages from "../chat/Messages";
import OwnerProfile from "../profile/OwnerProfile";
import MatchInsights from "../matchInsights/MatchInsights";
import api from "../../services/api";
import chatService from "../../services/chatService";
import {
  normalizeConversationList,
  flattenConversationEntry,
} from "../../utils/conversationUtils";
import { useWebSocket } from "../../context/WebSocketProvider";
import { useUserCapabilities } from "../../context/UserContext";
import { CAPABILITIES } from "../../utils/capabilities";
import { isAbortError } from "../../utils/http";

const TAB_CONFIG = [
  {
    key: "home",
    label: "Home",
    capability: CAPABILITIES.NAV_ACCESS_HOME,
    icon: () => <HomeIcon />,
    render: () => <Home />,
  },
  {
    key: "matches",
    label: "Matches",
    capability: CAPABILITIES.NAV_ACCESS_MATCHES,
    icon: ({ requestCount }) => (
      <Badge color="error" badgeContent={requestCount}>
        <FavoriteIcon />
      </Badge>
    ),
    render: ({ setRequestCount }) => (
      <Requests onRequestCountChange={setRequestCount} />
    ),
  },
  {
    key: "insights",
    label: "Match Insights",
    capability: CAPABILITIES.NAV_ACCESS_INSIGHTS,
    icon: () => <QuizIcon />,
    render: () => <MatchInsights />,
  },
  {
    key: "messages",
    label: "Messages",
    capability: CAPABILITIES.NAV_ACCESS_MESSAGES,
    icon: ({ unreadMessages }) => (
      <Badge color="error" badgeContent={unreadMessages}>
        <ChatIcon />
      </Badge>
    ),
    render: () => <Messages />,
  },
  {
    key: "profile",
    label: "Profile",
    capability: CAPABILITIES.NAV_ACCESS_PROFILE,
    icon: () => <PersonIcon />,
    render: () => <OwnerProfile />,
  },
];

function MainTabs() {
  const { hasCapability } = useUserCapabilities();
  const visibleTabs = useMemo(
    () => TAB_CONFIG.filter((tab) => hasCapability(tab.capability)),
    [hasCapability]
  );
  const [activeTab, setActiveTab] = useState(() => visibleTabs[0]?.key ?? null);
  const [requestCount, setRequestCount] = useState(0);
  const { hydrateConversations, totalUnreadCount } = useWebSocket();
  const unreadMessages = useMemo(
    () => (typeof totalUnreadCount === "number" ? totalUnreadCount : 0),
    [totalUnreadCount]
  );
  const canViewMatchesTab = useMemo(
    () => visibleTabs.some((tab) => tab.key === "matches"),
    [visibleTabs]
  );
  const canViewMessagesTab = useMemo(
    () => visibleTabs.some((tab) => tab.key === "messages"),
    [visibleTabs]
  );

  useEffect(() => {
    if (!visibleTabs.length) {
      setActiveTab(null);
      return;
    }
    if (!visibleTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);

  useEffect(() => {
    if (!canViewMatchesTab) {
      setRequestCount(0);
      return () => {};
    }

    const controller = new AbortController();

    const fetchRequestCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/requests", {
          headers: { Authorization: `${token}` },
          signal: controller.signal,
        });
        const count = Array.isArray(res.data.requests)
          ? res.data.requests.length
          : 0;
        setRequestCount(count);
      } catch (e) {
        if (!isAbortError(e)) {
          setRequestCount(0);
        }
      }
    };

    fetchRequestCount();

    return () => {
      controller.abort();
    };
  }, [canViewMatchesTab]);

  useEffect(() => {
    if (!canViewMessagesTab) {
      return () => {};
    }

    const controller = new AbortController();

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await chatService.get("/conversations", {
          headers: { Authorization: `${token}` },
          signal: controller.signal,
        });

        const conversations = normalizeConversationList(response.data)
          .map(flattenConversationEntry)
          .filter(Boolean);

        hydrateConversations(conversations);
      } catch (error) {
        if (!isAbortError(error)) {
          // Ignore initial unread fetch errors and default to existing socket state.
        }
      }
    };

    fetchConversations();

    return () => {
      controller.abort();
    };
  }, [canViewMessagesTab, hydrateConversations]);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const activeTabConfig = visibleTabs.find((tab) => tab.key === activeTab);
  const renderActiveTab = () => {
    if (!activeTabConfig) {
      return (
        <Box sx={{ px: 2, pt: 4 }}>
          <Alert severity="info">
            Navigation is currently unavailable for your account.
          </Alert>
        </Box>
      );
    }
    return activeTabConfig.render({
      setRequestCount,
      requestCount,
      unreadMessages,
    });
  };

  return (
    <Box sx={{ pb: 7 }}>
      {renderActiveTab()}

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation value={activeTab} onChange={handleChange} showLabels>
          {visibleTabs.map((tab) => (
            <BottomNavigationAction
              key={tab.key}
              label={tab.label}
              value={tab.key}
              icon={
                typeof tab.icon === "function"
                  ? tab.icon({ requestCount, unreadMessages })
                  : tab.icon
              }
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default MainTabs;
