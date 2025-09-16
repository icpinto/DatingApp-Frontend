import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Box,
  Avatar,
  Skeleton,
  Stack,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { HourglassEmpty } from "@mui/icons-material";
import api from "../../services/api";

function Requests({ onRequestCountChange = () => {} }) {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedError, setReceivedError] = useState(null);
  const [sentError, setSentError] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [sentProfiles, setSentProfiles] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const normalizeRequests = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload.requests)) return payload.requests;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `${token}` } : {};

      const [receivedRes, sentRes] = await Promise.allSettled([
        api.get("/user/requests", { headers }),
        api.get("/sentRequests", { headers }),
      ]);

      if (receivedRes.status === "fulfilled") {
        setRequests(normalizeRequests(receivedRes.value.data));
        setReceivedError(null);
      } else {
        setRequests([]);
        setReceivedError("Failed to fetch received requests.");
      }

      if (sentRes.status === "fulfilled") {
        setSentRequests(normalizeRequests(sentRes.value.data));
        setSentError(null);
      } else {
        setSentRequests([]);
        setSentError("Failed to fetch sent requests.");
      }

      setLoading(false);
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    onRequestCountChange(requests.length);
  }, [requests, onRequestCountChange]);

  // Fetch profile previews for senders
  useEffect(() => {
    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      const profilesData = {};
      await Promise.all(
        requests.map(async (req) => {
          try {
            const res = await api.get(`/user/profile/${req.sender_id}`, {
              headers: { Authorization: `${token}` },
            });
            profilesData[req.sender_id] = res.data;
          } catch (e) {
            // ignore
          }
        })
      );
      setProfiles(profilesData);
    };
    if (requests.length > 0) {
      fetchProfiles();
    } else {
      setProfiles({});
    }
  }, [requests]);

  useEffect(() => {
    const fetchSentProfiles = async () => {
      const token = localStorage.getItem("token");
      const profilesData = {};
      await Promise.all(
        sentRequests.map(async (req) => {
          if (!req.receiver_id) return;
          try {
            const res = await api.get(`/user/profile/${req.receiver_id}`, {
              headers: { Authorization: `${token}` },
            });
            profilesData[req.receiver_id] = res.data;
          } catch (e) {
            // ignore
          }
        })
      );
      setSentProfiles(profilesData);
    };
    if (sentRequests.length > 0) {
      fetchSentProfiles();
    } else {
      setSentProfiles({});
    }
  }, [sentRequests]);

  // Handle accept request
  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/user/acceptRequest`,
        { id: parseInt(id, 10) },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setRequests(requests.filter((request) => request.id !== id));
    } catch (err) {
      alert("Failed to accept the request. Please try again.");
    }
  };

  // Handle reject request
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/user/rejectRequest`,
        { id: parseInt(id, 10) },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setRequests(requests.filter((request) => request.id !== id));
    } catch (err) {
      alert("Failed to reject the request. Please try again.");
    }
  };

  if (loading)
    return (
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ maxWidth: 345 }}>
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
          ))}
        </Grid>
      </Box>
    );
  const getStatusColor = (status) => {
    if (!status) return "default";
    const normalized = String(status).toLowerCase();
    if (normalized === "accepted") return "success";
    if (normalized === "pending") return "warning";
    if (normalized === "rejected") return "error";
    return "info";
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderReceivedRequests = () => {
    if (receivedError) {
      return (
        <Stack alignItems="center" spacing={1}>
          <Typography color="error" variant="body1">
            {receivedError}
          </Typography>
        </Stack>
      );
    }

    if (!requests.length) {
      return (
        <Stack alignItems="center" spacing={1}>
          <HourglassEmpty color="disabled" fontSize="large" />
          <Typography variant="body1" color="text.secondary">
            You have no pending requests.
          </Typography>
        </Stack>
      );
    }

    return (
      <Grid container spacing={3}>
        {requests.map((request) => {
          const profile = profiles[request.sender_id];
          const username = request.sender_username || "Unknown user";
          return (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <Card variant="outlined" sx={{ maxWidth: 345 }}>
                <CardHeader
                  avatar={
                    <Avatar variant="rounded">
                      {username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={username}
                  subheader={profile?.bio || "No bio available"}
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ marginY: 1 }}
                  >
                    {request.description || "No message provided."}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAccept(request.id)}
                      >
                        Accept
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderSentRequests = () => {
    if (sentError) {
      return (
        <Stack alignItems="center" spacing={1}>
          <Typography color="error" variant="body1">
            {sentError}
          </Typography>
        </Stack>
      );
    }

    if (!sentRequests.length) {
      return (
        <Stack alignItems="center" spacing={1}>
          <HourglassEmpty color="disabled" fontSize="large" />
          <Typography variant="body1" color="text.secondary">
            You haven't sent any requests yet.
          </Typography>
        </Stack>
      );
    }

    return (
      <Grid container spacing={3}>
        {sentRequests.map((request) => {
          const profile = sentProfiles[request.receiver_id];
          const username = request.receiver_username || "Unknown user";
          return (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <Card variant="outlined" sx={{ maxWidth: 345 }}>
                <CardHeader
                  avatar={
                    <Avatar variant="rounded">
                      {username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={username}
                  subheader={profile?.bio || "No bio available"}
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ marginY: 1 }}
                  >
                    {request.description || "No message provided."}
                  </Typography>
                  {request.status && (
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Match Requests
      </Typography>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="Match request categories"
        sx={{ marginBottom: 2 }}
      >
        <Tab label={`Received (${requests.length})`} />
        <Tab label={`Sent (${sentRequests.length})`} />
      </Tabs>
      {activeTab === 0 ? renderReceivedRequests() : renderSentRequests()}
    </Box>
  );
}

export default Requests;
