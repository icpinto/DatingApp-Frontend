import React, {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Paper,
  Badge,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import QuizIcon from "@mui/icons-material/Quiz";
import Home from "../../../features/home/Home";
import Requests from "../../../features/requests/Requests";
import OwnerProfile from "../../../features/profile/OwnerProfile";
import api from "../../services/api";
import chatService from "../../services/chatService";
import {
  normalizeConversationList,
  flattenConversationEntry,
} from "../../../utils/conversationUtils";
import { useWebSocket } from "../../context/WebSocketProvider";
import { useUserCapabilities } from "../../context/UserContext";
import { CAPABILITIES } from "../../../domain/capabilities";
import useCapabilityQuery from "../../hooks/useCapabilityQuery";
import { isNetworkError } from "../../../utils/http";

const LazyMatchInsights = lazy(() =>
  import("../../../features/home/insights/MatchInsights")
);
const LazyMessages = lazy(() => import("../../../features/messages/Messages"));

const TabLoader = () => (
  <Box sx={{ px: 2, py: 4, display: "flex", justifyContent: "center" }}>
    <CircularProgress size={24} thickness={5} />
  </Box>
);

const buildTabDefinitions = ({ requestCount, unreadMessages, setRequestCount }) => [
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
    icon: () => (
      <Badge color="error" badgeContent={requestCount}>
        <FavoriteIcon />
      </Badge>
    ),
    render: () => <Requests onRequestCountChange={setRequestCount} />,
  },
  {
    key: "insights",
    label: "Match Insights",
    capability: CAPABILITIES.NAV_ACCESS_INSIGHTS,
    icon: () => <QuizIcon />,
    render: () => (
      <Suspense fallback={<TabLoader />}>
        <LazyMatchInsights />
      </Suspense>
    ),
  },
  {
    key: "messages",
    label: "Messages",
    capability: CAPABILITIES.NAV_ACCESS_MESSAGES,
    icon: () => (
      <Badge color="error" badgeContent={unreadMessages}>
        <ChatIcon />
      </Badge>
    ),
    render: () => (
      <Suspense fallback={<TabLoader />}>
        <LazyMessages />
      </Suspense>
    ),
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
  const { select } = useUserCapabilities();
  const [requestCount, setRequestCount] = useState(0);
  const { hydrateConversations, totalUnreadCount } = useWebSocket();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const unreadMessages = useMemo(
    () => (typeof totalUnreadCount === "number" ? totalUnreadCount : 0),
    [totalUnreadCount]
  );
  const tabs = useMemo(
    () => buildTabDefinitions({ requestCount, unreadMessages, setRequestCount }),
    [requestCount, unreadMessages, setRequestCount]
  );
  const visibleTabs = useMemo(() => {
    const selection = select(tabs.map((tab) => tab.capability));
    return tabs.filter((tab, index) => selection[index]?.can);
  }, [select, tabs]);
  const [activeTab, setActiveTab] = useState(() => visibleTabs[0]?.key ?? null);
  const canViewMatchesTab = useMemo(
    () => visibleTabs.some((tab) => tab.key === "matches"),
    [visibleTabs]
  );
  const canViewMessagesTab = useMemo(
    () => visibleTabs.some((tab) => tab.key === "messages"),
    [visibleTabs]
  );

  const requestCountQuery = useCapabilityQuery(
    CAPABILITIES.REQUESTS_VIEW_RECEIVED,
    ["requests", "received", "count"],
    async ({ signal }) => {
      const res = await api.get("/user/requests", { signal });
      const requests = Array.isArray(res.data?.requests)
        ? res.data.requests
        : [];
      return requests.length;
    },
    {
      enabled: canViewMatchesTab,
      staleTime: 60_000,
      cacheTime: 5 * 60_000,
      refetchInterval: () => 120_000,
    }
  );

  const conversationBootstrapQuery = useCapabilityQuery(
    [
      CAPABILITIES.MESSAGING_VIEW_CONVERSATIONS,
      CAPABILITIES.MESSAGING_VIEW_INBOX,
    ],
    ["messaging", "conversations", "bootstrap"],
    async ({ signal }) => {
      const token = localStorage.getItem("token");
      if (!token) {
        return [];
      }
      try {
        const response = await chatService.get("/conversations", { signal });
        return normalizeConversationList(response.data)
          .map(flattenConversationEntry)
          .filter(Boolean);
      } catch (error) {
        if (isNetworkError(error)) {
          return [];
        }
        throw error;
      }
    },
    {
      enabled: canViewMessagesTab,
      staleTime: 30_000,
      cacheTime: 2 * 60_000,
      refetchInterval: () => 60_000,
    }
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
      return;
    }

    if (typeof requestCountQuery.data === "number") {
      setRequestCount(requestCountQuery.data);
    } else if (requestCountQuery.isError) {
      setRequestCount(0);
    }
  }, [canViewMatchesTab, requestCountQuery.data, requestCountQuery.isError]);

  const lastHydratedRef = useRef(0);
  useEffect(() => {
    if (!canViewMessagesTab) {
      lastHydratedRef.current = 0;
      return;
    }

    if (!conversationBootstrapQuery.isSuccess) {
      return;
    }

    if (
      conversationBootstrapQuery.updatedAt &&
      conversationBootstrapQuery.updatedAt <= lastHydratedRef.current
    ) {
      return;
    }

    lastHydratedRef.current = conversationBootstrapQuery.updatedAt || Date.now();
    const conversations = Array.isArray(conversationBootstrapQuery.data)
      ? conversationBootstrapQuery.data
      : [];
    hydrateConversations(conversations);
  }, [
    canViewMessagesTab,
    conversationBootstrapQuery.data,
    conversationBootstrapQuery.isSuccess,
    conversationBootstrapQuery.updatedAt,
    hydrateConversations,
  ]);

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
    <Box sx={{ pb: isDesktop ? 0 : 7 }}>
      {isDesktop && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            zIndex: (muiTheme) => muiTheme.zIndex.appBar,
            mb: 3,
          }}
        >
          <Paper
            elevation={6}
            sx={(theme) => ({
              px: 2,
              py: 1,
              borderRadius: 3,
              background:
                theme.palette.mode === "light"
                  ? `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  : theme.palette.background.paper,
              color:
                theme.palette.mode === "light"
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              backdropFilter: "blur(14px)",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 18px 40px rgba(194, 24, 91, 0.25)"
                  : "0 18px 40px rgba(0, 0, 0, 0.55)",
            })}
          >
            <Tabs
              value={activeTab}
              onChange={handleChange}
              variant="fullWidth"
              textColor="inherit"
              TabIndicatorProps={{ children: <span /> }}
              sx={(theme) => ({
                minHeight: 70,
                "& .MuiTabs-flexContainer": {
                  gap: theme.spacing(1),
                },
                "& .MuiTabs-indicator": {
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  "& > span": {
                    width: "100%",
                    borderRadius: theme.shape.borderRadius * 2,
                    background:
                      theme.palette.mode === "light"
                        ? "rgba(255, 255, 255, 0.85)"
                        : theme.palette.primary.main,
                    boxShadow:
                      theme.palette.mode === "light"
                        ? "0 8px 20px rgba(0,0,0,0.18)"
                        : "0 8px 20px rgba(0,0,0,0.4)",
                  },
                },
              })}
            >
              {visibleTabs.map((tab) => (
                <Tab
                  key={tab.key}
                  label={tab.label}
                  value={tab.key}
                  disableRipple
                  icon={
                    typeof tab.icon === "function"
                      ? tab.icon({ requestCount, unreadMessages })
                      : tab.icon
                  }
                  iconPosition="start"
                  sx={(theme) => ({
                    minHeight: 60,
                    px: 3,
                    py: 1.5,
                    borderRadius: theme.shape.borderRadius * 2,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    textTransform: "none",
                    fontWeight: 600,
                    color:
                      theme.palette.mode === "light"
                        ? "rgba(255, 255, 255, 0.78)"
                        : theme.palette.text.secondary,
                    transition: theme.transitions.create(
                      ["background-color", "color", "transform"],
                      {
                        duration: theme.transitions.duration.shorter,
                      }
                    ),
                    "& .MuiTab-iconWrapper": {
                      fontSize: "1.75rem",
                      mr: 1.5,
                    },
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? "rgba(255, 255, 255, 0.18)"
                          : theme.palette.action.hover,
                      color:
                        theme.palette.mode === "light"
                          ? theme.palette.common.white
                          : theme.palette.text.primary,
                      transform: "translateY(-2px)",
                    },
                    "&.Mui-selected": {
                      color:
                        theme.palette.mode === "light"
                          ? theme.palette.primary.contrastText
                          : theme.palette.primary.main,
                    },
                  })}
                />
              ))}
            </Tabs>
          </Paper>
        </Box>
      )}

      {renderActiveTab()}

      {!isDesktop && (
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
      )}
    </Box>
  );
}

export default MainTabs;
