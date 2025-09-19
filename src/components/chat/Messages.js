import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ChatDrawer from "./ChatDrawer";
import api from "../../services/api";
import chatService from "../../services/chatService";
import { spacing } from "../../styles";

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
  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section} sx={{ height: "100%" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Messages
        </Typography>
        <Grid
          container
          spacing={3}
          sx={{
            minHeight: { xs: "60vh", md: "70vh" },
          }}
          alignItems="stretch"
        >
          {showListPane && (
            <Grid item xs={12} md={4} sx={{ display: "flex", minHeight: 0 }}>
              <Card
                elevation={3}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <CardHeader
                  title="Conversations"
                  subheader="Stay in touch with people you've connected with"
                  avatar={
                    <Avatar
                      variant="rounded"
                      sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
                    >
                      <ForumRoundedIcon />
                    </Avatar>
                  }
                  sx={{ px: spacing.section, py: spacing.section }}
                />
                <Divider sx={{ borderStyle: "dashed" }} />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 0,
                    minHeight: 0,
                  }}
                >
                  <Box
                    sx={{
                      flexGrow: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      px: spacing.section,
                      py: spacing.section,
                      display: "flex",
                    }}
                  >
                    {loading ? (
                      <Stack spacing={spacing.section} sx={{ width: "100%" }}>
                        <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
                        <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
                        <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
                      </Stack>
                    ) : error ? (
                      <Stack
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          flexGrow: 1,
                          textAlign: "center",
                          color: "error.main",
                        }}
                      >
                        <Typography color="inherit">{error}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try refreshing the page to load your conversations again.
                        </Typography>
                      </Stack>
                    ) : Array.isArray(conversations) && conversations.length > 0 ? (
                      <Stack
                        spacing={spacing.section}
                        divider={<Divider flexItem sx={{ borderStyle: "dashed", opacity: 0.4 }} />}
                        sx={{ width: "100%" }}
                      >
                        {conversations.map((conversation, index) => {
                          const { displayName } = getConversationPartnerDetails(
                            conversation,
                            currentUserId,
                            profiles
                          );
                          const { body, mime_type, timestamp } =
                            extractLastMessageInfo(conversation);
                          const messagePreview = buildMessagePreview(body, mime_type);
                          const formattedTimestamp = formatLastMessageTimestamp(timestamp);
                          const avatarInitial = displayName
                            ? displayName.charAt(0).toUpperCase()
                            : "?";
                          const isSelected = selectedConversation?.id === conversation.id;
                          const isTopConversation = index === 0;

                          return (
                            <Box
                              key={`${conversation.id}-panel`}
                              onClick={() => handleOpenConversation(conversation)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  handleOpenConversation(conversation);
                                }
                              }}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                px: 2,
                                py: 1.75,
                                borderRadius: 2,
                                cursor: "pointer",
                                border: (theme) =>
                                  `1px solid ${
                                    isSelected
                                      ? theme.palette.primary.main
                                      : alpha(theme.palette.divider, 0.8)
                                  }`,
                                bgcolor: (theme) =>
                                  isSelected
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : isTopConversation
                                    ? alpha(theme.palette.primary.main, 0.04)
                                    : theme.palette.background.paper,
                                boxShadow: (theme) =>
                                  isSelected
                                    ? `0px 12px 24px ${alpha(
                                        theme.palette.primary.main,
                                        0.18
                                      )}`
                                    : `0px 6px 18px ${alpha(
                                        theme.palette.common.black,
                                        0.05
                                      )}`,
                                transition: "all 0.2s ease",
                                '&:hover': {
                                  transform: "translateY(-2px)",
                                  borderColor: (theme) => theme.palette.primary.main,
                                  boxShadow: (theme) =>
                                    `0px 12px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                                },
                                outline: "none",
                              }}
                            >
                              <Avatar variant="rounded" sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                                {avatarInitial}
                              </Avatar>
                              <Stack spacing={0.5} flexGrow={1} minWidth={0}>
                                {isTopConversation && (
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Most recent conversation
                                  </Typography>
                                )}
                                <Typography
                                  variant="subtitle1"
                                  noWrap
                                  sx={{ fontWeight: 600 }}
                                >
                                  {displayName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {messagePreview}
                                </Typography>
                              </Stack>
                              {formattedTimestamp ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ whiteSpace: "nowrap" }}
                                >
                                  {formattedTimestamp}
                                </Typography>
                              ) : null}
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Stack
                        alignItems="center"
                        spacing={1}
                        justifyContent="center"
                        sx={{
                          flexGrow: 1,
                          textAlign: "center",
                          color: "text.secondary",
                        }}
                      >
                        <Typography variant="body1">
                          You have no conversations yet.
                        </Typography>
                        <Typography variant="body2">
                          Start connecting to see your messages here.
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {showChatPane && (
            <Grid item xs={12} md={8} sx={{ display: "flex", minHeight: 0 }}>
              <Card
                elevation={3}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  minHeight: { xs: "50vh", md: "100%" },
                  overflow: "hidden",
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
                  <>
                    <CardHeader
                      title="Select a conversation"
                      subheader="Choose someone from the list to start chatting"
                      avatar={
                        <Avatar
                          variant="rounded"
                          sx={{ bgcolor: "secondary.light", color: "secondary.dark" }}
                        >
                          <ChatBubbleOutlineRoundedIcon />
                        </Avatar>
                      }
                      sx={{ px: spacing.section, py: spacing.section }}
                    />
                    <Divider sx={{ borderStyle: "dashed" }} />
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <Stack spacing={1.5} alignItems="center" color="text.secondary">
                        <Typography variant="body1">
                          Select a conversation from the left to view messages.
                        </Typography>
                        <Typography variant="body2">
                          Once you pick someone, you can continue your conversation here.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </>
                )}
              </Card>
            </Grid>
          )}
        </Grid>
      </Stack>
    </Container>
  );
}

export default Messages;
