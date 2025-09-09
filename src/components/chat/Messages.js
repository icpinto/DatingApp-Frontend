import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText, Typography, Box, CircularProgress } from "@mui/material";
import ChatDrawer from "./ChatDrawer";
import api from "../../services/api";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false); 
  const [selectedConversation, setSelectedConversation] = useState(null); 

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
          {conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              button
              onClick={() => handleOpenDrawer(conversation)}
            >
              <ListItemText
                primary={`User 1: ${conversation.user1_id}`}
                secondary={`User 2: ${conversation.user2_id}`}
              />
            </ListItem>
          ))}
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
