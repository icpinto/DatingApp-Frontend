import React, { useState, useEffect } from "react";
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
  extractUnreadCount,
  computeUnreadFromMessageHistory,
  pickFirst,
  toNumberOrUndefined,
} from "../../utils/conversationUtils";
import { useWebSocket } from "../../context/WebSocketProvider";

function MainTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { conversations: wsConversations } = useWebSocket() || {};

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
    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUnreadMessages(0);
          return;
        }

        const response = await chatService.get("/conversations", {
          headers: { Authorization: `${token}` },
        });

        const conversations = normalizeConversationList(response.data)
          .map(flattenConversationEntry)
          .filter(Boolean);

        const totalUnread = conversations.reduce(
          (sum, conversation) => sum + extractUnreadCount(conversation),
          0
        );

        setUnreadMessages(totalUnread);
      } catch (error) {
        setUnreadMessages(0);
      }
    };

    fetchUnreadMessages();
  }, []);

  useEffect(() => {
    if (!wsConversations || typeof wsConversations !== "object") {
      return;
    }

    const currentUserId = toNumberOrUndefined(localStorage.getItem("user_id"));

    const totalUnread = Object.values(wsConversations).reduce(
      (sum, conversation) => {
        if (!conversation || typeof conversation !== "object") {
          return sum;
        }

        const wsUnreadCandidate = pickFirst(
          conversation.__localUnreadCount,
          conversation.unread_count,
          conversation.unreadCount,
          conversation.unread_messages_count,
          conversation.unreadMessagesCount,
          conversation.unread_messages_total,
          conversation.unreadMessagesTotal,
          conversation.unread_message_total,
          conversation.unreadMessageTotal,
          conversation.unread_messages,
          conversation.unreadMessages,
          conversation.unread_total,
          conversation.unreadTotal,
          conversation.unread
        );

        const wsUnreadCount = toNumberOrUndefined(wsUnreadCandidate);

        if (wsUnreadCount !== undefined && wsUnreadCount !== null) {
          return sum + wsUnreadCount;
        }

        const messages = Array.isArray(conversation.messages)
          ? conversation.messages
          : [];

        if (messages.length === 0) {
          return sum;
        }

        const lastReadCandidate = pickFirst(
          conversation.__lastReadMessageId,
          conversation.last_read_message_id,
          conversation.lastReadMessageId,
          conversation.lastRead,
          conversation.last_read,
          conversation.last_read_message,
          conversation.lastReadMessage,
          conversation.last_read_id,
          conversation.lastReadId
        );

        const computedUnread = computeUnreadFromMessageHistory(
          messages,
          lastReadCandidate,
          currentUserId
        );

        return sum + computedUnread;
      },
      0
    );

    setUnreadMessages((prev) => (prev === totalUnread ? prev : totalUnread));
  }, [wsConversations]);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ pb: 7 }}>
      {activeTab === 0 && <Home />}
      {activeTab === 1 && <Requests onRequestCountChange={setRequestCount} />}
      {activeTab === 2 && <QuestionsComponent />}
      {activeTab === 3 && (
        <Messages onUnreadCountChange={setUnreadMessages} />
      )}
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
