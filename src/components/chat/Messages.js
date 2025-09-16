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

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const normalizeConversationList = (payload) => {
  const visited = new WeakSet();

  const explore = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    if (visited.has(value)) {
      return [];
    }

    visited.add(value);

    const preferredKeys = ["conversations", "data", "results", "items"];
    for (const key of preferredKeys) {
      if (Array.isArray(value[key])) {
        return value[key];
      }
    }

    for (const child of Object.values(value)) {
      const nested = explore(child);
      if (nested.length) {
        return nested;
      }
    }

    return [];
  };

  return explore(payload);
};

const flattenConversationEntry = (entry) => {
  if (entry && typeof entry === "object" && entry.conversation) {
    const { conversation, ...rest } = entry;
    return { ...conversation, ...rest };
  }

  return entry;
};

const extractLastMessageInfo = (conversation = {}) => {
  const lastMessage = pickFirst(
    conversation.last_message,
    conversation.lastMessage,
    conversation.latest_message,
    conversation.latestMessage,
    conversation.most_recent_message,
    conversation.mostRecentMessage
  );

  let body = pickFirst(
    conversation.last_message_body,
    conversation.lastMessageBody
  );
  let mime_type = pickFirst(
    conversation.last_message_mime_type,
    conversation.lastMessageMimeType
  );
  let timestamp = pickFirst(
    conversation.last_message_timestamp,
    conversation.lastMessageTimestamp,
    conversation.last_message_sent_at,
    conversation.lastMessageSentAt,
    conversation.last_message_time,
    conversation.lastMessageTime
  );

  if (
    lastMessage &&
    typeof lastMessage === "object" &&
    !Array.isArray(lastMessage)
  ) {
    body = pickFirst(
      body,
      lastMessage.body,
      lastMessage.message,
      lastMessage.text,
      lastMessage.content,
      lastMessage.Body,
      lastMessage.Message
    );
    mime_type = pickFirst(
      mime_type,
      lastMessage.mime_type,
      lastMessage.mimeType,
      lastMessage.MimeType
    );
    timestamp = pickFirst(
      timestamp,
      lastMessage.timestamp,
      lastMessage.created_at,
      lastMessage.createdAt,
      lastMessage.sent_at,
      lastMessage.sentAt,
      lastMessage.updated_at,
      lastMessage.updatedAt
    );
  } else if (lastMessage !== undefined && lastMessage !== null) {
    body = pickFirst(body, lastMessage);
  }

  return {
    body,
    mime_type,
    timestamp,
  };
};

const buildMessagePreview = (body, mimeType) => {
  if (mimeType && mimeType !== "text/plain") {
    return "Media message";
  }

  if (typeof body === "string") {
    const trimmed = body.trim();
    return trimmed.length ? trimmed : "No messages yet";
  }

  if (body !== undefined && body !== null) {
    try {
      const stringified = String(body);
      return stringified.trim().length ? stringified : "No messages yet";
    } catch (err) {
      return "No messages yet";
    }
  }

  return "No messages yet";
};

const formatLastMessageTimestamp = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

const toTrimmedStringOrUndefined = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const stringified = String(value).trim();
  return stringified.length ? stringified : undefined;
};

const parseUserLikeObject = (value) => {
  if (!value || typeof value !== "object") {
    return { id: undefined, username: undefined };
  }

  const id = toNumberOrUndefined(
    pickFirst(
      value.user_id,
      value.id,
      value.userId,
      value.UserID,
      value.UserId,
      value.profile_id,
      value.profileId,
      value.user?.id,
      value.user?.user_id
    )
  );

  const username = toTrimmedStringOrUndefined(
    pickFirst(
      value.username,
      value.user_name,
      value.name,
      value.display_name,
      value.displayName,
      value.handle,
      value.user?.username,
      value.user?.name,
      value.profile?.username,
      value.profile?.name
    )
  );

  return { id, username };
};

const getUserInfoFromKeys = (conversation, keys = []) => {
  let id;
  let username;

  keys.forEach((key) => {
    if (!key) return;

    const directId = toNumberOrUndefined(
      pickFirst(
        conversation?.[`${key}_id`],
        conversation?.[`${key}Id`],
        conversation?.[`${key}ID`],
        conversation?.[`${key}_user_id`]
      )
    );

    if (id === undefined && directId !== undefined) {
      id = directId;
    }

    const directUsername = toTrimmedStringOrUndefined(
      pickFirst(
        conversation?.[`${key}_username`],
        conversation?.[`${key}_name`],
        conversation?.[`${key}Username`],
        conversation?.[`${key}Name`]
      )
    );

    if (!username && directUsername) {
      username = directUsername;
    }

    const nested = conversation?.[key];
    const nestedInfo = parseUserLikeObject(nested);

    if (id === undefined && nestedInfo.id !== undefined) {
      id = nestedInfo.id;
    }

    if (!username && nestedInfo.username) {
      username = nestedInfo.username;
    }
  });

  return { id, username };
};

const getConversationUsers = (conversation = {}) => ({
  user1: getUserInfoFromKeys(conversation, [
    "user1",
    "user_one",
    "userOne",
    "user_1",
    "first_user",
    "firstUser",
  ]),
  user2: getUserInfoFromKeys(conversation, [
    "user2",
    "user_two",
    "userTwo",
    "user_2",
    "second_user",
    "secondUser",
  ]),
});

const getProfileDisplayName = (profile) => {
  if (!profile || typeof profile !== "object") {
    return undefined;
  }

  const preferred = toTrimmedStringOrUndefined(
    pickFirst(
      profile.username,
      profile.display_name,
      profile.displayName,
      profile.name,
      profile.preferred_name,
      profile.preferredName,
      profile.user?.username,
      profile.user?.name
    )
  );

  if (preferred) {
    return preferred;
  }

  const fullName = [
    toTrimmedStringOrUndefined(
      pickFirst(profile.first_name, profile.firstName)
    ),
    toTrimmedStringOrUndefined(
      pickFirst(profile.last_name, profile.lastName)
    ),
  ]
    .filter(Boolean)
    .join(" ");

  if (fullName.trim().length) {
    return fullName.trim();
  }

  const email = toTrimmedStringOrUndefined(profile.email);
  if (email) {
    const usernamePart = email.split("@")[0];
    return usernamePart || undefined;
  }

  return undefined;
};

const getConversationPartnerDetails = (
  conversation = {},
  currentUserId,
  profiles = {}
) => {
  const { user1, user2 } = getConversationUsers(conversation);

  let otherUserId;
  let conversationUsername;

  if (
    user1.id !== undefined &&
    currentUserId !== undefined &&
    user1.id === currentUserId
  ) {
    otherUserId = user2.id;
    conversationUsername = user2.username;
  } else if (
    user2.id !== undefined &&
    currentUserId !== undefined &&
    user2.id === currentUserId
  ) {
    otherUserId = user1.id;
    conversationUsername = user1.username;
  } else {
    if (user1.id !== undefined && user1.id !== currentUserId) {
      otherUserId = user1.id;
      conversationUsername = user1.username;
    } else if (user2.id !== undefined && user2.id !== currentUserId) {
      otherUserId = user2.id;
      conversationUsername = user2.username;
    } else {
      conversationUsername = user1.username || user2.username;
    }
  }

  if (otherUserId === undefined || otherUserId === currentUserId) {
    const candidateArrays = [
      conversation.users,
      conversation.participants,
      conversation.members,
      conversation.memberships,
      conversation.userProfiles,
      conversation.profileUsers,
    ];

    for (const arr of candidateArrays) {
      if (!Array.isArray(arr)) continue;

      for (const entry of arr) {
        const parsed = parseUserLikeObject(entry);

        if (!conversationUsername && parsed.username) {
          conversationUsername = parsed.username;
        }

        if (
          parsed.id !== undefined &&
          (currentUserId === undefined || parsed.id !== currentUserId)
        ) {
          otherUserId = parsed.id;
          if (!conversationUsername && parsed.username) {
            conversationUsername = parsed.username;
          }
          break;
        }
      }

      if (
        otherUserId !== undefined &&
        otherUserId !== currentUserId
      ) {
        break;
      }
    }
  }

  const profile =
    otherUserId !== undefined && otherUserId !== null
      ? profiles?.[otherUserId]
      : undefined;

  const profileName = getProfileDisplayName(profile);
  const displayName =
    toTrimmedStringOrUndefined(conversationUsername) ||
    toTrimmedStringOrUndefined(profileName) ||
    "Unknown user";

  const bio =
    toTrimmedStringOrUndefined(profile?.bio) || "No bio available";

  return { otherUserId, displayName, bio };
};

const getCurrentUserId = () =>
  toNumberOrUndefined(localStorage.getItem("user_id"));

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [profiles, setProfiles] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const currentUserId = getCurrentUserId();

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
        const normalized = normalizeConversationList(response.data)
          .map(flattenConversationEntry)
          .filter(Boolean);
        setConversations(normalized);
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
      const uniqueIds = new Set();
      conversations.forEach((conv) => {
        const { otherUserId } = getConversationPartnerDetails(
          conv,
          getCurrentUserId()
        );
        if (otherUserId !== undefined) {
          uniqueIds.add(otherUserId);
        }
      });
      if (uniqueIds.size === 0) {
        setProfiles({});
        return;
      }
      const profilesData = {};
      await Promise.all(
        Array.from(uniqueIds)
          .map((id) => toNumberOrUndefined(id))
          .filter((id) => id !== undefined)
          .map(async (id) => {
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
  const selectedConversationDetails = selectedConversation
    ? getConversationPartnerDetails(
        selectedConversation,
        currentUserId,
        profiles
      )
    : null;

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
                      const { displayName } =
                        getConversationPartnerDetails(
                          conversation,
                          currentUserId,
                          profiles
                        );
                      const { body, mime_type, timestamp } =
                        extractLastMessageInfo(conversation);
                      const messagePreview = buildMessagePreview(
                        body,
                        mime_type
                      );
                      const formattedTimestamp =
                        formatLastMessageTimestamp(timestamp);
                      const avatarInitial = displayName
                        ? displayName.charAt(0).toUpperCase()
                        : "?";
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
                            <Avatar variant="rounded">{avatarInitial}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  component="span"
                                  variant="subtitle1"
                                  noWrap
                                  sx={{
                                    flexGrow: 1,
                                    fontWeight: 600,
                                  }}
                                >
                                  {displayName}
                                </Typography>
                                {formattedTimestamp ? (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    {formattedTimestamp}
                                  </Typography>
                                ) : null}
                              </Box>
                            }
                            secondary={
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {messagePreview}
                              </Typography>
                            }
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
                  partnerName={selectedConversationDetails?.displayName}
                  partnerBio={selectedConversationDetails?.bio}
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
