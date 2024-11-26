import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List, ListItem, ListItemText, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/user/conversations", {
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
  

  if (loading) return <CircularProgress />; 
  if (error) return <Typography color="error">{error}</Typography>; 

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      {(!conversations || conversations.length === 0)
 ? (
        <Typography variant="body1" color="text.secondary">
          No conversations found.
        </Typography>
      ) : (
        <List>
          {conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              button
              onClick={() => navigate(`/conversations/${conversation.id}`, {
                state: { user1_id: conversation.user1_id, user2_id: conversation.user2_id }
              })}
            >
              <ListItemText
                primary={conversation.user1_id}
                secondary={conversation.user2_id}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default Messages;
