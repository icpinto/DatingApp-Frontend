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
  Grid,
  Paper,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatDrawer from "./ChatDrawer";
import api from "../../services/api";
import chatService from "../../services/chatService";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [profiles, setProfiles] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await chatService.get("/conversations", {
          headers: {
            Authorization: `${token}`,
          },
        });
        // Ensure conversations is always an array to avoid null map errors
        setConversations(Array.isArray(response.data) ? response.data : []);
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
  const handleOpenConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle closing the drawer
  const handleCloseConversation = () => {
    setSelectedConversation(null);
  };

  const showListPane = !isMobile || !selectedConversation;
  const showChatPane = !isMobile || Boolean(selectedConversation);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          mt: 2,
          minHeight: { xs: "60vh", md: "70vh" },
        }}
        alignItems="stretch"
      >
        {showListPane && (
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                p: 2,
                flexGrow: 1,
              }}
            >
              <Typography variant="h6">Conversations</Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
                {Array.isArray(conversations) && conversations.length > 0 ? (
                  <List>
                    {conversations.map((conversation) => {
                      const currentUserId = Number(
                        localStorage.getItem("user_id")
                      );
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
                          key={`${conversation.id}-panel`}
                          button
                          onClick={() => handleOpenConversation(conversation)}
                          selected={selectedConversation?.id === conversation.id}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            '&.Mui-selected': {
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              '& .MuiListItemText-secondary': {
                                color: 'inherit',
                                opacity: 0.85,
                              },
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar variant="rounded">
                              {otherUsername?.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={otherUsername}
                            secondary={otherProfile?.bio || "No bio available"}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      color: "text.secondary",
                      px: 2,
                    }}
                  >
                    <Typography variant="body1">
                      You have no conversations yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
        {showChatPane && (
          <Grid item xs={12} md={8} sx={{ display: "flex" }}>
            <Paper
              elevation={3}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                p: 2,
                flexGrow: 1,
              }}
            >
              {selectedConversation ? (
                <ChatDrawer
                  conversationId={selectedConversation.id}
                  user1_id={selectedConversation.user1_id}
                  user2_id={selectedConversation.user2_id}
                  open={Boolean(selectedConversation)}
                  onClose={handleCloseConversation}
                  partnerName={(() => {
                    const currentUserId = Number(localStorage.getItem("user_id"));
                    return selectedConversation.user1_id === currentUserId
                      ? selectedConversation.user2_username
                      : selectedConversation.user1_username;
                  })()}
                  partnerBio={(() => {
                    const currentUserId = Number(localStorage.getItem("user_id"));
                    const otherUserId =
                      selectedConversation.user1_id === currentUserId
                        ? selectedConversation.user2_id
                        : selectedConversation.user1_id;
                    return profiles[otherUserId]?.bio || "No bio available";
                  })()}
                />
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Select a conversation
                  </Typography>
                  <Typography variant="body2">
                    Choose someone from the list to start chatting.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Messages;
