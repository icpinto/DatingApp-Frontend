import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import ChatDrawer from "./ChatDrawer";
import api from "../../services/api";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [profiles, setProfiles] = useState({});

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/conversations", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setConversations(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch conversations");
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch profile previews for conversation partners
  useEffect(() => {
    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      const currentUserId = Number(localStorage.getItem("user_id"));
      const uniqueIds = new Set();
      conversations.forEach((conv) => {
        const otherId =
          conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
        uniqueIds.add(otherId);
      });
      const profilesData = {};
      await Promise.all(
        Array.from(uniqueIds).map(async (id) => {
          try {
            const res = await api.get(`/user/profile/${id}`, {
              headers: { Authorization: `${token}` },
            });
            profilesData[id] = res.data;
          } catch (e) {
            // ignore individual profile fetch errors
          }
        })
      );
      setProfiles(profilesData);
    };
    if (conversations.length > 0) {
      fetchProfiles();
    }
  }, [conversations]);

  // Handle opening the drawer and selecting a conversation
  const handleOpenDrawer = (conversation) => {
    setSelectedConversation(conversation);
    setOpenDrawer(true);
  };

  // Handle closing the drawer
  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setSelectedConversation(null);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      {(!conversations || conversations.length === 0) ? (
        <Typography variant="body1" color="text.secondary">
          No conversations found.
        </Typography>
      ) : (
        <List>
          {conversations.map((conversation) => {
            const currentUserId = Number(localStorage.getItem("user_id"));
            const otherUserId =
              conversation.user1_id === currentUserId
                ? conversation.user2_id
                : conversation.user1_id;
            const otherUsername =
              conversation.user1_id === currentUserId
                ? conversation.user2_username
                : conversation.user1_username;
            const otherProfile = profiles[otherUserId];
            return (
              <ListItem
                key={conversation.id}
                button
                onClick={() => handleOpenDrawer(conversation)}
              >
                <ListItemAvatar>
                  <Avatar>{otherUsername?.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={otherUsername}
                  secondary={otherProfile?.bio || "No bio available"}
                />
              </ListItem>
            );
          })}
        </List>
      )}

      {/* Drawer for Chat */}
      {selectedConversation && (
        <ChatDrawer
          conversationId={selectedConversation.id}
          user1_id={selectedConversation.user1_id}
          user2_id={selectedConversation.user2_id}
          open={openDrawer}
          onClose={handleCloseDrawer}
        />
      )}
    </Box>
  );
}

export default Messages;
