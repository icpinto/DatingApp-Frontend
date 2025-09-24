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
import QuestionsComponent from "../questions/Questions";
import api from "../../services/api";
import chatService from "../../services/chatService";
import {
  normalizeConversationList,
  flattenConversationEntry,
} from "../../utils/conversationUtils";
import { useWebSocket } from "../../context/WebSocketProvider";

function MainTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const { hydrateConversations, totalUnreadCount } = useWebSocket();
  const unreadMessages = useMemo(
    () => (typeof totalUnreadCount === "number" ? totalUnreadCount : 0),
    [totalUnreadCount]
  );

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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
  }, [hydrateConversations]);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ pb: 7 }}>
      {activeTab === 0 && <Home />}
      {activeTab === 1 && <Requests onRequestCountChange={setRequestCount} />}
      {activeTab === 2 && <QuestionsComponent />}
      {activeTab === 3 && <Messages />}
      {activeTab === 4 && <OwnerProfile />}

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation value={activeTab} onChange={handleChange} showLabels>
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction
            label="Matches"
            icon={
              <Badge color="error" badgeContent={requestCount}>
                <FavoriteIcon />
              </Badge>
            }
          />
          <BottomNavigationAction label="Match Insights" icon={<QuizIcon />} />
          <BottomNavigationAction
            label="Messages"
            icon={
              <Badge color="error" badgeContent={unreadMessages}>
                <ChatIcon />
              </Badge>
            }
          />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default MainTabs;
