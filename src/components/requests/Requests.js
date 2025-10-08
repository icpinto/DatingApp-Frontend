import React, { useEffect, useState } from "react";
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
import { useAccountLifecycle } from "../../context/AccountLifecycleContext";
import { CAPABILITIES } from "../../utils/capabilities";
import Guard from "./Guard";
import { useUserCapabilities } from "../../context/UserContext";
import { isAbortError } from "../../utils/http";

const normalizeRequests = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload.requests)) return payload.requests;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

function RequestsContent({ onRequestCountChange = () => {}, accountLifecycle }) {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedError, setReceivedError] = useState(null);
  const [sentError, setSentError] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [sentProfiles, setSentProfiles] = useState({});
  const { t } = useTranslation();
  const { groups } = useUserCapabilities();

  const requestCapabilities = groups.requests;
  const canViewReceived = requestCapabilities.viewReceived.can;
  const canViewSent = requestCapabilities.viewSent.can;
  const canRespond = requestCapabilities.respond.can;
  const isDeactivated = accountLifecycle?.isDeactivated;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const shouldFetchReceived = canViewReceived;
    const shouldFetchSent = canViewSent;

    const fetchRequests = async () => {
      if (!shouldFetchReceived && !shouldFetchSent) {
        if (!isMounted) {
          return;
        }
        setLoading(false);
        setRequests([]);
        setSentRequests([]);
        setReceivedError(null);
        setSentError(null);
        return;
      }

      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `${token}` } : {};
      const operations = [];

      if (shouldFetchReceived) {
        operations.push(
          api.get("/user/requests", { headers, signal: controller.signal })
        );
      }
      if (shouldFetchSent) {
        operations.push(
          api.get("user/sentRequests", { headers, signal: controller.signal })
        );
      }

      const results = await Promise.allSettled(operations);
      let index = 0;

      if (shouldFetchReceived) {
        const result = results[index++];
        if (isMounted) {
          if (result.status === "fulfilled") {
            setRequests(normalizeRequests(result.value.data));
            setReceivedError(null);
          } else if (!isAbortError(result.reason)) {
            setRequests([]);
            setReceivedError("requests.messages.receivedError");
          }
        }
      } else if (isMounted) {
        setRequests([]);
        setReceivedError(null);
      }

      if (shouldFetchSent) {
        const result = results[index++];
        if (isMounted) {
          if (result.status === "fulfilled") {
            setSentRequests(normalizeRequests(result.value.data));
            setSentError(null);
          } else if (!isAbortError(result.reason)) {
            setSentRequests([]);
            setSentError("requests.messages.sentError");
          }
        }
      } else if (isMounted) {
        setSentRequests([]);
        setSentError(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchRequests();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [canViewReceived, canViewSent]);

  useEffect(() => {
    if (!canViewReceived) {
      onRequestCountChange(0);
      return;
    }
    onRequestCountChange(requests.length);
  }, [requests, onRequestCountChange, canViewReceived]);

  useEffect(() => {
    if (!canViewReceived || requests.length === 0) {
      setProfiles({});
      return () => {};
    }

    const controller = new AbortController();

    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      const profilesData = {};
      await Promise.all(
        requests.map(async (req) => {
          try {
            const res = await api.get(`/user/profile/${req.sender_id}`, {
              headers: { Authorization: `${token}` },
              signal: controller.signal,
            });
            profilesData[req.sender_id] = res.data;
          } catch (e) {
            if (isAbortError(e)) {
              return;
            }
            // ignore
          }
        })
      );
      setProfiles(profilesData);
    };

    fetchProfiles();

    return () => {
      controller.abort();
    };
  }, [requests, canViewReceived]);

  useEffect(() => {
    if (!canViewSent || sentRequests.length === 0) {
      setSentProfiles({});
      return () => {};
    }

    const controller = new AbortController();

    const fetchSentProfiles = async () => {
      const token = localStorage.getItem("token");
      const profilesData = {};
      await Promise.all(
        sentRequests.map(async (req) => {
          if (!req.receiver_id) return;
          try {
            const res = await api.get(`/user/profile/${req.receiver_id}`, {
              headers: { Authorization: `${token}` },
              signal: controller.signal,
            });
            profilesData[req.receiver_id] = res.data;
          } catch (e) {
            if (isAbortError(e)) {
              return;
            }
            // ignore
          }
        })
      );
      setSentProfiles(profilesData);
    };

    fetchSentProfiles();

    return () => {
      controller.abort();
    };
  }, [sentRequests, canViewSent]);

  const handleAccept = async (id) => {
    if (!canRespond) {
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
    if (!canRespond) {
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
          <Guard can={CAPABILITIES.REQUESTS_RESPOND}>
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
            <Guard can={CAPABILITIES.REQUESTS_VIEW_STATUS}>
              {statusLabel && (
                <Chip
                  label={statusLabel}
                  color={getStatusColor(request.status)}
                  size="small"
                  sx={{ textTransform: "capitalize", fontWeight: 600 }}
                />
              )}
            </Guard>
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

    if (!canRespond && isDeactivated) {
      return (
        <Stack spacing={spacing.section}>
          <Alert severity="warning">{t("requests.messages.deactivatedReadOnly")}</Alert>
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

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <Guard can={CAPABILITIES.REQUESTS_VIEW_RECEIVED}>
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
        </Guard>
        <Guard can={CAPABILITIES.REQUESTS_VIEW_SENT}>
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
        </Guard>
      </Stack>
    </Container>
  );
}

function Requests(props) {
  const accountLifecycle = useAccountLifecycle();

  return (
    <RequestsContent {...props} accountLifecycle={accountLifecycle} />
  );
}

export default Requests;
