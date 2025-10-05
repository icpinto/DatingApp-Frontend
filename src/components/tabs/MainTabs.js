import React, { useState, useEffect, useMemo } from "react";
import {
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
import { useCapabilities } from "../../context/UserContext";

function MainTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const { hydrateConversations, totalUnreadCount } = useWebSocket();
  const capabilities = useCapabilities();
  const unreadMessages = useMemo(
    () => (typeof totalUnreadCount === "number" ? totalUnreadCount : 0),
    [totalUnreadCount]
  );

  const tabDefinitions = useMemo(
    () => [
      {
        key: "home",
        label: "Home",
        icon: <HomeIcon />,
        can: "accessAppShell",
        render: () => <Home />,
      },
      {
        key: "requests",
        label: "Matches",
        icon: (
          <Badge color="error" badgeContent={requestCount || 0}>
            <FavoriteIcon />
          </Badge>
        ),
        can: "viewMatchRequests",
        render: () => <Requests onRequestCountChange={setRequestCount} />,
      },
      {
        key: "insights",
        label: "Match Insights",
        icon: <QuizIcon />,
        can: "viewInsights",
        render: () => <MatchInsights />,
      },
      {
        key: "messages",
        label: "Messages",
        icon: (
          <Badge color="error" badgeContent={unreadMessages || 0}>
            <ChatIcon />
          </Badge>
        ),
        can: "readMessages",
        render: () => <Messages />,
      },
      {
        key: "profile",
        label: "Profile",
        icon: <PersonIcon />,
        can: "editProfile",
        render: () => <OwnerProfile />,
      },
    ],
    [requestCount, unreadMessages]
  );

  const availableTabs = useMemo(() => {
    const allowed = tabDefinitions.filter(
      (tab) => !tab.can || capabilities?.[tab.can]
    );
    if (allowed.length === 0) {
      return tabDefinitions.slice(0, 1);
    }
    return allowed;
  }, [tabDefinitions, capabilities]);

  const availableTabsLength = availableTabs.length;
  const normalizedActiveIndex = availableTabsLength
    ? Math.min(activeTab, availableTabsLength - 1)
    : 0;
  const currentTab = availableTabs[normalizedActiveIndex];
  const currentTabContent = currentTab?.render ? currentTab.render() : null;

  useEffect(() => {
    if (!availableTabsLength) {
      setActiveTab(0);
      return;
    }
    if (activeTab >= availableTabsLength) {
      setActiveTab(0);
    }
  }, [activeTab, availableTabsLength]);

  useEffect(() => {
    if (!capabilities?.viewMatchRequests) {
      setRequestCount(0);
      return;
    }

    const fetchRequestCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/requests", {
          headers: { Authorization: `${token}` },
        });
        const count = Array.isArray(res.data.requests)
          ? res.data.requests.length
          : 0;
        setRequestCount(count);
      } catch (e) {
        setRequestCount(0);
      }
    };

    fetchRequestCount();
  }, [capabilities?.viewMatchRequests]);

  useEffect(() => {
    if (!capabilities?.readMessages) {
      return;
    }

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await chatService.get("/conversations", {
          headers: { Authorization: `${token}` },
        });

        const conversations = normalizeConversationList(response.data)
          .map(flattenConversationEntry)
          .filter(Boolean);

        hydrateConversations(conversations);
      } catch (error) {
        // Ignore initial unread fetch errors and default to existing socket state.
      }
    };

    fetchConversations();
  }, [hydrateConversations, capabilities?.readMessages]);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ pb: 7 }}>
      {currentTabContent}

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          value={normalizedActiveIndex}
          onChange={handleChange}
          showLabels
        >
          {availableTabs.map((tab) => (
            <BottomNavigationAction
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default MainTabs;
