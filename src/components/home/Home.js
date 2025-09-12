import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Collapse,
  Button,
  Container,
  Stack,
  CardHeader,
  Avatar,
  Grow,
  Skeleton,
} from "@mui/material";
import { Group } from "@mui/icons-material";
import api from "../../services/api";
import { spacing } from "../../styles";

function Home() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null); // Track expanded user ID
  const [profileData, setProfileData] = useState({}); // Store profile data
  const [message, setMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/profiles", {
          headers: {
            Authorization: `${token}`,
          },
        });
        const rawUsers = Array.isArray(response.data) ? response.data : [];
        const currentUserId = Number(localStorage.getItem("user_id"));
        const users = rawUsers
          .filter(
            (user) => user.user_id !== currentUserId && user.id !== currentUserId
          )
          .map((user) => ({
            ...user,
            profile_image: user.profile_image_url,
          }));
        setActiveUsers(users);
        // No active users message handled in render
      } catch (error) {
        setMessage("Failed to load active users. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchActiveUsers();
  }, []);

  // Toggle and fetch detailed profile data
  const handleToggleExpand = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null); // Collapse if already expanded
    } else {
      setExpandedUserId(userId);
      setLoadingProfile(true);
      setProfileData({});
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/user/profile/${userId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        const requestStatusResponse = await api.get(
          `/user/checkReqStatus/${userId}`,
          { headers: { Authorization: `${token}` } }
        );

        setProfileData({
          ...response.data,
          requestStatus: requestStatusResponse.data.requestStatus,
        });
      } catch (error) {
        setMessage("Failed to load user profile.");
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/user/sendRequest`,
        { receiver_id: parseInt(userId, 10) },
        { headers: { Authorization: `${token}` } }
      );
      setProfileData((prev) => ({ ...prev, requestStatus: true }));
      setMessage("Friend request sent successfully!");
    } catch (error) {
      setMessage("Failed to send friend request. Please try again.");
    }
  };

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Typography variant="h2">Active Users</Typography>
      {message && <Typography>{message}</Typography>}
      <Grid container spacing={3} direction="column">
        {loadingUsers ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardHeader
                  avatar={<Skeleton variant="circular" width={40} height={40} />}
                  title={<Skeleton width="80%" />}
                  subheader={<Skeleton width="40%" />}
                />
                <CardContent>
                  <Skeleton width="100%" />
                  <Skeleton width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : Array.isArray(activeUsers) && activeUsers.length > 0 ? (
          activeUsers.map((user) => (
            <Grid item xs={12} key={user.id}>
              <Card
                onClick={() => handleToggleExpand(user.user_id)}
                sx={{ cursor: "pointer" }}
              >
                <CardHeader
                  avatar={
                    <Avatar src={user.profile_image} alt={user.username} />
                  }
                  title={
                    <Typography variant="h6" component="div">
                      {user.username}
                    </Typography>
                  }
                  subheader={user.location || ""}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {user.bio || "No bio available"}
                  </Typography>
                </CardContent>

                {/* Expanded Profile View */}
                <Collapse
                  in={expandedUserId === user.user_id}
                  timeout="auto"
                  unmountOnExit
                >
                  {loadingProfile ? (
                    <CardContent>
                      <Stack spacing={spacing.section}>
                        <Skeleton width="80%" />
                        <Skeleton width="60%" />
                        <Skeleton width="40%" />
                        <Skeleton variant="rectangular" width={120} height={36} />
                      </Stack>
                    </CardContent>
                  ) : (
                    profileData && expandedUserId === user.user_id && (
                      <Grow in={expandedUserId === user.user_id}>
                        <CardContent>
                          <Stack spacing={spacing.section}>
                            <Typography variant="body1">
                              <strong>Bio:</strong> {profileData.bio || "No bio available"}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Age:</strong> {profileData.age || "N/A"}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Location:</strong> {profileData.location || "N/A"}
                            </Typography>
                            <Button
                              variant="contained"
                              color={
                                profileData.requestStatus ? "secondary" : "primary"
                              }
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent collapse toggle
                                handleSendRequest(user.user_id);
                              }}
                              disabled={profileData.requestStatus}
                              sx={{ alignSelf: "flex-start" }}
                            >
                              {profileData.requestStatus
                                ? "Request Sent"
                                : "Send Request"}
                            </Button>
                            {message && (
                              <Typography color="success.main">{message}</Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Grow>
                    )
                  )}
                </Collapse>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Stack alignItems="center" spacing={1}>
              <Group fontSize="large" color="disabled" />
              <Typography>No active users available.</Typography>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Home;
