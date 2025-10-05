import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { HourglassEmpty, PersonAddAlt1, Send } from "@mui/icons-material";
import api from "../../services/api";
import { spacing } from "../../styles";
import { useTranslation } from "../../i18n";
import { Guard, useCapabilities, useUserContext } from "../../context/UserContext";

function Requests({ onRequestCountChange = () => {} }) {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedError, setReceivedError] = useState(null);
  const [sentError, setSentError] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [sentProfiles, setSentProfiles] = useState({});
  const { t } = useTranslation();
  const { user } = useUserContext();
  const capabilities = useCapabilities();
  const canViewRequests = Boolean(capabilities?.viewMatchRequests);
  const canRespondToRequests = Boolean(capabilities?.respondToMatchRequests);
  const accountStatus = user?.facts?.account ?? null;

  const readOnlyNotice = useMemo(() => {
    if (canRespondToRequests) {
      return null;
    }
    if (accountStatus === "deactivated") {
      return t("requests.messages.deactivatedReadOnly", {
        defaultValue:
          "Your account is currently deactivated. You can review your past requests but can't respond.",
      });
    }
    return t("requests.messages.readOnly", {
      defaultValue:
        "You can review pending requests but can't respond right now.",
    });
  }, [accountStatus, canRespondToRequests, t]);

  const viewRestrictedNotice = useMemo(() => {
    if (canViewRequests) {
      return null;
    }
    return t("requests.messages.viewRestricted", {
      defaultValue: "Requests are unavailable for your account at the moment.",
    });
  }, [canViewRequests, t]);

  const normalizeRequests = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload.requests)) return payload.requests;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  };

  useEffect(() => {
    if (!canViewRequests) {
      setRequests([]);
      setSentRequests([]);
      setLoading(false);
      setReceivedError(null);
      setSentError(null);
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `${token}` } : {};

      const [receivedRes, sentRes] = await Promise.allSettled([
        api.get("/user/requests", { headers }),
        api.get("user/sentRequests", { headers }),
      ]);

      if (receivedRes.status === "fulfilled") {
        setRequests(normalizeRequests(receivedRes.value.data));
        setReceivedError(null);
      } else {
        setRequests([]);
        setReceivedError("requests.messages.receivedError");
      }

      if (sentRes.status === "fulfilled") {
        setSentRequests(normalizeRequests(sentRes.value.data));
        setSentError(null);
      } else {
        setSentRequests([]);
        setSentError("requests.messages.sentError");
      }

      setLoading(false);
    };

    fetchRequests();
  }, [canViewRequests]);

  useEffect(() => {
    onRequestCountChange(canViewRequests ? requests.length : 0);
  }, [requests, canViewRequests, onRequestCountChange]);

  useEffect(() => {
    if (!canViewRequests) {
      setProfiles({});
      return;
    }

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
  }, [requests, canViewRequests]);

  useEffect(() => {
    if (!canViewRequests) {
      setSentProfiles({});
      return;
    }

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
  }, [sentRequests, canViewRequests]);

  const handleAccept = async (id) => {
    if (!canRespondToRequests) {
      return;
    }
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
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      alert(t("requests.messages.acceptFailed"));
    }
  };

  const handleReject = async (id) => {
    if (!canRespondToRequests) {
      return;
    }
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
      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (err) {
      alert(t("requests.messages.rejectFailed"));
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const normalized = String(status).toLowerCase();
    if (normalized === "accepted") return "success";
    if (normalized === "pending") return "warning";
    if (normalized === "rejected") return "error";
    return "info";
  };

  const renderLoadingState = () => (
    <Stack spacing={spacing.section}>
      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
    </Stack>
  );

  const renderReceivedRequestItem = (request, index) => {
    const profile = profiles[request.sender_id] || {};
    const username =
      request.sender_username || profile.username || t("common.placeholders.unknownUser");
    const bio = profile.bio || t("common.placeholders.noBio");
    const description = request.description || t("common.placeholders.noMessage");
    const highlight = index === 0;
    const avatarFallback = username.charAt(0)?.toUpperCase() || "?";

    return (
      <Box
        key={request.id}
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) =>
            highlight ? theme.palette.action.hover : theme.palette.background.paper,
        }}
      >
        <Stack spacing={spacing.section}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={profile.profile_image_url || profile.profile_image}
              alt={username}
              sx={{ width: highlight ? 72 : 56, height: highlight ? 72 : 56 }}
            >
              {avatarFallback}
            </Avatar>
            <Stack spacing={0.5} flexGrow={1} minWidth={0}>
              {highlight && (
                <Typography variant="subtitle2" color="text.secondary">
                  {t("requests.labels.newest")}
                </Typography>
              )}
              <Typography
                variant={highlight ? "h6" : "subtitle1"}
                sx={{ fontWeight: 600 }}
                noWrap
              >
                {username}
              </Typography>
              {bio && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {bio}
                </Typography>
              )}
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
          <Guard can="respondToMatchRequests">
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAccept(request.id)}
              >
                {t("common.actions.accept")}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleReject(request.id)}
              >
                {t("common.actions.reject")}
              </Button>
            </Stack>
          </Guard>
        </Stack>
      </Box>
    );
  };

  const renderSentRequestItem = (request, index) => {
    const profile = sentProfiles[request.receiver_id] || {};
    const username =
      request.receiver_username || profile.username || t("common.placeholders.unknownUser");
    const bio = profile.bio || t("common.placeholders.noBio");
    const description = request.description || t("common.placeholders.noMessage");
    const highlight = index === 0;
    const avatarFallback = username.charAt(0)?.toUpperCase() || "?";
    const statusLabel = request.status
      ? t(`requests.status.${String(request.status).toLowerCase()}`, {
          defaultValue: request.status,
        })
      : null;

    return (
      <Box
        key={request.id}
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) =>
            highlight ? theme.palette.action.hover : theme.palette.background.paper,
        }}
      >
        <Stack spacing={spacing.section}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={profile.profile_image_url || profile.profile_image}
              alt={username}
              sx={{ width: highlight ? 72 : 56, height: highlight ? 72 : 56 }}
            >
              {avatarFallback}
            </Avatar>
            <Stack spacing={0.5} flexGrow={1} minWidth={0}>
                {highlight && (
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("requests.labels.mostRecent")}
                  </Typography>
                )}
                <Typography
                  variant={highlight ? "h6" : "subtitle1"}
                  sx={{ fontWeight: 600 }}
                noWrap
              >
                {username}
              </Typography>
              {bio && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {bio}
                </Typography>
              )}
            </Stack>
            {statusLabel && (
              <Chip
                label={statusLabel}
                color={getStatusColor(request.status)}
                size="small"
                sx={{ textTransform: "capitalize", fontWeight: 600 }}
              />
            )}
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Box>
    );
  };

  const renderReceivedRequests = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (receivedError) {
      return (
        <Typography color="error" variant="body2">
          {t(receivedError)}
        </Typography>
      );
    }

    if (!requests.length) {
      return (
        <Stack alignItems="center" spacing={1} sx={{ py: spacing.section }}>
          <HourglassEmpty color="disabled" fontSize="large" />
          <Typography variant="body2" color="text.secondary">
            {t("requests.messages.noPending")}
          </Typography>
        </Stack>
      );
    }

    const requestList = (
      <Stack
        spacing={spacing.section}
        divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}
      >
        {requests.map((request, index) => renderReceivedRequestItem(request, index))}
      </Stack>
    );

    if (readOnlyNotice) {
      return (
        <Stack spacing={spacing.section}>
          <Alert severity="warning">{readOnlyNotice}</Alert>
          {requestList}
        </Stack>
      );
    }

    return requestList;
  };

  const renderSentRequests = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (sentError) {
      return (
        <Typography color="error" variant="body2">
          {t(sentError)}
        </Typography>
      );
    }

    if (!sentRequests.length) {
      return (
        <Stack alignItems="center" spacing={1} sx={{ py: spacing.section }}>
          <HourglassEmpty color="disabled" fontSize="large" />
          <Typography variant="body2" color="text.secondary">
            {t("requests.messages.noSent")}
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack
        spacing={spacing.section}
        divider={<Divider flexItem sx={{ borderStyle: "dashed" }} />}
      >
        {sentRequests.map((request, index) => renderSentRequestItem(request, index))}
      </Stack>
    );
  };

  if (!canViewRequests) {
    return (
      <Container sx={{ p: spacing.pagePadding }}>
        <Stack spacing={spacing.section}>
          <Alert severity="info">{viewRestrictedNotice}</Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={t("requests.headers.incoming")}
            subheader={t("requests.headers.incomingSub")}
            avatar={
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <PersonAddAlt1 />
              </Avatar>
            }
          />
          <Divider />
          <CardContent>{renderReceivedRequests()}</CardContent>
        </Card>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={t("requests.headers.sent")}
            subheader={t("requests.headers.sentSub")}
            avatar={
              <Avatar sx={{ bgcolor: "secondary.main" }}>
                <Send />
              </Avatar>
            }
          />
          <Divider />
          <CardContent>{renderSentRequests()}</CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

export default Requests;
