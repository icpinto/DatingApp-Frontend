import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  Button,
  Container,
  Stack,
  CardHeader,
  Avatar,
  Grow,
  Skeleton,
  Divider,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";
import { Group } from "@mui/icons-material";
import api from "../../services/api";
import { spacing } from "../../styles";
import MatchRecommendations from "../matches/MatchRecommendations";

const FILTER_DEFAULTS = {
  gender: "",
  civil_status: "",
  religion: "",
  dietary_preference: "",
  smoking: "",
  country_code: "",
  highest_education: "",
  employment_status: "",
  age: "",
  horoscope_available: "",
};

function Home() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null); // Track expanded user ID
  const [profileData, setProfileData] = useState({}); // Store profile data
  const [message, setMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...FILTER_DEFAULTS }));
  const [showFilters, setShowFilters] = useState(false);

  const getUserIdentifier = useCallback((user) => {
    if (!user) {
      return undefined;
    }
    const value = user.user_id ?? user.id;
    if (value === undefined || value === null) {
      return undefined;
    }
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : numericValue;
  }, []);

  const fetchActiveUsers = useCallback(
    async (params = {}) => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/profiles", {
          headers: {
            Authorization: `${token}`,
          },
          params,
        });
        const rawUsers = Array.isArray(response.data) ? response.data : [];
        const currentUserId = Number(localStorage.getItem("user_id"));
        const users = rawUsers
          .filter((user) => {
            const userId = getUserIdentifier(user);
            return userId !== currentUserId;
          })
          .map((user) => ({
            ...user,
            profile_image: user.profile_image_url,
          }));
        setActiveUsers(users);
        setExpandedUserId(null);
        setProfileData({});
      } catch (error) {
        setMessage("Failed to load active users. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    },
    [getUserIdentifier]
  );

  const buildFilterParams = useCallback(() => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (key === "age") {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue) && numericValue > 0) {
          params[key] = numericValue;
        }
        return;
      }

      params[key] = value;
    });

    return params;
  }, [filters]);

  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    const params = buildFilterParams();
    fetchActiveUsers(params);
  }, [buildFilterParams, fetchActiveUsers]);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...FILTER_DEFAULTS });
    fetchActiveUsers();
  }, [fetchActiveUsers]);

  useEffect(() => {
    fetchActiveUsers();
  }, [fetchActiveUsers]);

  // Toggle and fetch detailed profile data
  const handleToggleExpand = async (rawUserId) => {
    const userId = Number(rawUserId);
    const normalizedUserId = Number.isNaN(userId) ? rawUserId : userId;

    if (normalizedUserId === undefined || normalizedUserId === null || normalizedUserId === "") {
      return;
    }

    if (expandedUserId === normalizedUserId) {
      setExpandedUserId(null); // Collapse if already expanded
    } else {
      setExpandedUserId(normalizedUserId);
      setLoadingProfile(true);
      setProfileData({});
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/user/profile/${normalizedUserId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        const requestStatusResponse = await api.get(
          `/user/checkReqStatus/${normalizedUserId}`,
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

  const handleSendRequest = async (rawUserId) => {
    const userId = Number(rawUserId);
    const normalizedUserId = Number.isNaN(userId) ? rawUserId : userId;

    if (normalizedUserId === undefined || normalizedUserId === null || normalizedUserId === "") {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const parsedId = parseInt(normalizedUserId, 10);
      await api.post(
        `/user/sendRequest`,
        {
          receiver_id: Number.isNaN(parsedId) ? normalizedUserId : parsedId,
        },
        { headers: { Authorization: `${token}` } }
      );
      setProfileData((prev) => ({ ...prev, requestStatus: true }));
      setMessage("Friend request sent successfully!");
    } catch (error) {
      setMessage("Failed to send friend request. Please try again.");
    }
  };

  const orderedUsers = useMemo(() => {
    return Array.isArray(activeUsers) ? activeUsers : [];
  }, [activeUsers]);

  const renderActiveUser = (user, index) => {
    const userId = getUserIdentifier(user);
    const isExpanded = expandedUserId === userId;
    const isTopUser = index === 0;
    const displayName = user?.username || (userId ? `User #${userId}` : "User");
    const avatarFallback = displayName.charAt(0)?.toUpperCase() || "?";

    return (
      <Box
        key={userId ?? index}
        onClick={() => {
          if (userId === undefined || userId === null || userId === "") {
            return;
          }
          handleToggleExpand(userId);
        }}
        sx={{
          p: 2,
          borderRadius: 2,
          cursor: "pointer",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) =>
            isTopUser ? theme.palette.action.hover : theme.palette.background.paper,
          transition: "background-color 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            bgcolor: (theme) => theme.palette.action.hover,
          },
        }}
      >
        <Stack spacing={spacing.section}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={user?.profile_image}
              alt={displayName}
              sx={{ width: isTopUser ? 72 : 56, height: isTopUser ? 72 : 56 }}
            >
              {avatarFallback}
            </Avatar>
            <Stack spacing={0.5} flexGrow={1} minWidth={0}>
              {isTopUser && (
                <Typography variant="subtitle2" color="text.secondary">
                  Most recently active
                </Typography>
              )}
              <Typography
                variant={isTopUser ? "h6" : "subtitle1"}
                sx={{ fontWeight: 600, lineHeight: 1.3 }}
                noWrap
              >
                {displayName}
              </Typography>
              {user?.location && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.location}
                </Typography>
              )}
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {user?.bio || "No bio available"}
          </Typography>
        </Stack>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          {loadingProfile && isExpanded ? (
            <Box sx={{ mt: spacing.section }}>
              <Stack spacing={spacing.section}>
                <Skeleton width="80%" />
                <Skeleton width="60%" />
                <Skeleton width="40%" />
                <Skeleton variant="rectangular" width={160} height={40} />
              </Stack>
            </Box>
          ) : (
            profileData && isExpanded && (
              <Grow in={isExpanded}>
                <Box sx={{ mt: spacing.section }}>
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
                      color={profileData.requestStatus ? "secondary" : "primary"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (userId !== undefined && userId !== null && userId !== "") {
                          handleSendRequest(userId);
                        }
                      }}
                      disabled={
                        profileData.requestStatus ||
                        userId === undefined ||
                        userId === null ||
                        userId === ""
                      }
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {profileData.requestStatus ? "Request Sent" : "Send Request"}
                    </Button>
                    {message && (
                      <Typography
                        color={
                          message.toLowerCase().includes("failed")
                            ? "error.main"
                            : "success.main"
                        }
                      >
                        {message}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Grow>
            )
          )}
        </Collapse>
      </Box>
    );
  };

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <MatchRecommendations limit={12} />
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title="Active Users"
            subheader="See who has been active recently"
            avatar={
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <Group />
              </Avatar>
            }
          />
          <Divider />
          <CardContent>
            <Box sx={{ mb: spacing.section }}>
              <Stack spacing={spacing.section}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Filter Active Users
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowFilters((prev) => !prev)}
                  >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                </Stack>
                <Collapse in={showFilters} timeout="auto" unmountOnExit>
                  <Stack spacing={spacing.section}>
                    <Grid container spacing={2}>
                      {[
                        { name: "gender", label: "Gender" },
                        { name: "civil_status", label: "Civil Status" },
                        { name: "religion", label: "Religion" },
                        { name: "dietary_preference", label: "Dietary Preference" },
                        { name: "smoking", label: "Smoking Preference" },
                        { name: "country_code", label: "Country" },
                        { name: "highest_education", label: "Highest Education" },
                        { name: "employment_status", label: "Employment Status" },
                      ].map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field.name}>
                          <TextField
                            fullWidth
                            size="small"
                            label={field.label}
                            name={field.name}
                            value={filters[field.name]}
                            onChange={handleFilterChange}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Age"
                          name="age"
                          type="number"
                          value={filters.age}
                          onChange={handleFilterChange}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Horoscope Available"
                          name="horoscope_available"
                          value={filters.horoscope_available}
                          onChange={handleFilterChange}
                        >
                          <MenuItem value="">Any</MenuItem>
                          <MenuItem value="true">Yes</MenuItem>
                          <MenuItem value="false">No</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="flex-end"
                      spacing={2}
                    >
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearFilters}
                        disabled={loadingUsers}
                      >
                        Clear Filters
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        disabled={loadingUsers}
                      >
                        Apply Filters
                      </Button>
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
            </Box>
            {message && !loadingUsers && (
              <Typography
                variant="body2"
                color={
                  message.toLowerCase().includes("failed")
                    ? "error.main"
                    : "success.main"
                }
                sx={{ mb: spacing.section }}
              >
                {message}
              </Typography>
            )}
            {loadingUsers ? (
              <Stack spacing={spacing.section}>
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
              </Stack>
            ) : orderedUsers.length > 0 ? (
              <Stack
                spacing={spacing.section}
                divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}
              >
                {orderedUsers.map((user, index) => renderActiveUser(user, index))}
              </Stack>
            ) : (
              <Stack alignItems="center" spacing={1} sx={{ py: spacing.section }}>
                <Group fontSize="large" color="disabled" />
                <Typography color="text.secondary">
                  No active users available.
                </Typography>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

export default Home;
