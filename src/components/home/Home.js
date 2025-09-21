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
import { Group, Verified as VerifiedIcon } from "@mui/icons-material";
import api from "../../services/api";
import { spacing } from "../../styles";
import MatchRecommendations from "../matches/MatchRecommendations";
import { useTranslation } from "../../i18n";

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

const FILTER_FIELDS = [
  { name: "gender", labelKey: "home.filters.gender" },
  { name: "civil_status", labelKey: "home.filters.civilStatus" },
  { name: "religion", labelKey: "home.filters.religion" },
  { name: "dietary_preference", labelKey: "home.filters.dietaryPreference" },
  { name: "smoking", labelKey: "home.filters.smoking" },
  { name: "country_code", labelKey: "home.filters.country" },
  { name: "highest_education", labelKey: "home.filters.highestEducation" },
  { name: "employment_status", labelKey: "home.filters.employmentStatus" },
];

function Home() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null); // Track expanded user ID
  const [profileData, setProfileData] = useState({}); // Store profile data
  const [message, setMessage] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...FILTER_DEFAULTS }));
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

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
        setMessage(null);
      } catch (error) {
        setMessage({ type: "error", key: "home.messages.loadActiveError" });
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
        setMessage({ type: "error", key: "home.messages.profileError" });
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
      setMessage({ type: "success", key: "home.messages.requestSuccess" });
    } catch (error) {
      setMessage({ type: "error", key: "home.messages.requestError" });
    }
  };

  const orderedUsers = useMemo(() => {
    return Array.isArray(activeUsers) ? activeUsers : [];
  }, [activeUsers]);

  const renderActiveUser = (user, index) => {
    const userId = getUserIdentifier(user);
    const isExpanded = expandedUserId === userId;
    const isTopUser = index === 0;
    const displayName =
      user?.username ||
      (userId
        ? t("common.placeholders.userNumber", { id: userId })
        : t("common.placeholders.user"));
    const avatarFallback = displayName.charAt(0)?.toUpperCase() || "?";
    const isVerified = Boolean(user?.contact_verified && user?.identity_verified);

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
                  {t("home.labels.mostRecent")}
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  minWidth: 0,
                }}
              >
                <Typography
                  variant={isTopUser ? "h6" : "subtitle1"}
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayName}
                </Typography>
                {isVerified ? (
                  <VerifiedIcon
                    color="primary"
                    fontSize={isTopUser ? "medium" : "small"}
                    titleAccess={t("common.status.verified")}
                  />
                ) : null}
              </Box>
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
            {user?.bio || t("common.placeholders.noBio")}
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
                      <strong>{t("home.labels.bio")}:</strong>{" "}
                      {profileData.bio || t("common.placeholders.noBio")}
                    </Typography>
                    <Typography variant="body1">
                      <strong>{t("home.labels.age")}:</strong>{" "}
                      {profileData.age || t("common.placeholders.notAvailable")}
                    </Typography>
                    <Typography variant="body1">
                      <strong>{t("home.labels.location")}:</strong>{" "}
                      {profileData.location || t("common.placeholders.notAvailable")}
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
                      {profileData.requestStatus
                        ? t("home.labels.requestSent")
                        : t("home.labels.sendRequest")}
                    </Button>
                    {message?.key && (
                      <Typography
                        color={message.type === "error" ? "error.main" : "success.main"}
                      >
                        {t(message.key)}
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
            title={t("home.headers.activeUsers")}
            subheader={t("home.headers.activeUsersSub")}
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
                    {t("home.headers.filterTitle")}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowFilters((prev) => !prev)}
                  >
                    {showFilters ? t("home.filters.hide") : t("home.filters.show")}
                  </Button>
                </Stack>
                <Collapse in={showFilters} timeout="auto" unmountOnExit>
                  <Stack spacing={spacing.section}>
                    <Grid container spacing={2}>
                      {FILTER_FIELDS.map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field.name}>
                          <TextField
                            fullWidth
                            size="small"
                            label={t(field.labelKey)}
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
                          label={t("home.filters.age")}
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
                          label={t("home.filters.horoscope")}
                          name="horoscope_available"
                          value={filters.horoscope_available}
                          onChange={handleFilterChange}
                        >
                          <MenuItem value="">{t("home.filters.any")}</MenuItem>
                          <MenuItem value="true">{t("home.filters.yes")}</MenuItem>
                          <MenuItem value="false">{t("home.filters.no")}</MenuItem>
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
                        {t("common.actions.clearFilters")}
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        disabled={loadingUsers}
                      >
                        {t("common.actions.applyFilters")}
                      </Button>
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
            </Box>
            {message?.key && !loadingUsers && (
              <Typography
                variant="body2"
                color={message.type === "error" ? "error.main" : "success.main"}
                sx={{ mb: spacing.section }}
              >
                {t(message.key)}
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
                  {t("home.labels.noActiveUsers")}
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
