import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  Tooltip as MuiTooltip,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { fetchMatches } from "../../../shared/services/matchmaking";
import api from "../../../shared/services/api";
import { spacing } from "../../../styles";
import { useTranslation } from "../../../i18n";
import { useNavigate } from "react-router-dom";
import { useTheme, lighten, darken } from "@mui/material/styles";
import { useAccountLifecycle } from "../../../shared/context/AccountLifecycleContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../../domain/accountLifecycle";
import { CAPABILITIES } from "../../../domain/capabilities";
import Guard from "./Guard";
import { useUserCapabilities } from "../../../shared/context/UserContext";
import { isAbortError } from "../../../utils/http";
import FeatureCard from "../../../shared/components/FeatureCard";

const MAX_SCORE = 100;

const extractProfileImage = (candidate = {}) => {
  return (
    candidate.profile_image ||
    candidate.profile_image_url ||
    candidate.profileImageUrl ||
    candidate.profileImage ||
    candidate.avatar_url ||
    candidate.avatar ||
    undefined
  );
};

const normalizeMatch = (rawMatch = {}) => {
  const profile =
    rawMatch.profile ||
    rawMatch.user ||
    rawMatch.matched_user ||
    rawMatch.matchedUser ||
    {};

  const combined = { ...profile, ...rawMatch };
  const userId =
    combined.user_id ??
    combined.id ??
    profile.user_id ??
    profile.id ??
    rawMatch.user_id ??
    rawMatch.id;

  const scoreValue =
    combined.score ??
    rawMatch.match_score ??
    rawMatch.matchScore ??
    rawMatch.compatibility_score ??
    profile.score ??
    0;
  const numericScore = Number(scoreValue);
  const safeScore = Number.isNaN(numericScore) ? 0 : numericScore;

  const normalizedProfileImage =
    extractProfileImage(combined) || extractProfileImage(profile);

  return {
    ...combined,
    user_id: userId,
    username: combined.username ?? profile.username ?? `User #${userId ?? ""}`,
    location: combined.location ?? profile.location ?? "",
    bio: combined.bio ?? profile.bio ?? "",
    profile_image: normalizedProfileImage,
    score: safeScore,
  };
};

const formatScore = (score) => {
  const numericScore = Number(score);
  if (Number.isNaN(numericScore)) {
    return "0.00";
  }
  return numericScore.toFixed(2);
};

const clampScore = (score) => {
  const numericScore = Number(score);
  if (Number.isNaN(numericScore)) {
    return 0;
  }
  return Math.max(0, Math.min(MAX_SCORE, numericScore));
};

const convertToPercentage = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return 0;
  }

  if (numericValue <= 1) {
    return numericValue * 100;
  }

  return numericValue;
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const getMatchIdentifier = (match = {}, fallback) => {
  const rawIdentifier =
    match.user_id ??
    match.id ??
    match.userId ??
    match.profile_id ??
    match.profileId;

  if (
    rawIdentifier === undefined ||
    rawIdentifier === null ||
    rawIdentifier === ""
  ) {
    return fallback;
  }

  return rawIdentifier;
};

const normalizeUserId = (rawUserId) => {
  if (rawUserId === undefined || rawUserId === null || rawUserId === "") {
    return null;
  }

  const numericId = Number(rawUserId);
  if (Number.isNaN(numericId)) {
    return rawUserId;
  }
  return numericId;
};

const DimensionBreakdownList = ({ breakdown = [], sum = 0, overall = null, t }) => {
  const theme = useTheme();

  if (!Array.isArray(breakdown) || breakdown.length === 0) {
    return null;
  }

  const normalizedBreakdown = breakdown
    .map(({ label, value }) => ({
      label,
      value: Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Number(value) : 0)),
    }))
    .filter(({ value }) => value > 0);

  if (normalizedBreakdown.length === 0) {
    return null;
  }

  const totalValue = normalizedBreakdown.reduce((total, { value }) => total + value, 0);
  const safeTotal = totalValue > 0 ? totalValue : 1;

  const resolveColor = (index) => {
    const baseColor = theme.palette.primary.main;

    if (index === 0) {
      return baseColor;
    }

    const step = Math.floor((index + 1) / 2);
    const amount = Math.min(step * 0.1, 0.4);

    return index % 2 === 0
      ? darken(baseColor, amount)
      : lighten(baseColor, amount);
  };

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          width: "100%",
          height: 32,
          borderRadius: 999,
          overflow: "hidden",
          display: "flex",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {normalizedBreakdown.map(({ label, value }, dimensionIndex) => {
          const widthPercentage = (value / safeTotal) * 100;
          const backgroundColor = resolveColor(dimensionIndex) || theme.palette.primary.main;
          const contrastColor = theme.palette.getContrastText(backgroundColor);
          const showLabel = widthPercentage >= 12;

          return (
            <MuiTooltip
              key={`dimension-bar-${dimensionIndex}`}
              title={`${label}: ${formatScore(value)}%`}
              placement="top"
            >
              <Box
                sx={{
                  flexGrow: value,
                  flexBasis: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: backgroundColor,
                  minWidth: widthPercentage < 4 ? theme.spacing(1) : undefined,
                  px: showLabel ? 1 : 0,
                }}
              >
                {showLabel && (
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      color: contrastColor,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {`${label} (${formatScore(value)}%)`}
                  </Typography>
                )}
              </Box>
            </MuiTooltip>
          );
        })}
      </Box>

      <Divider flexItem />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {t("matches.labels.dimensionSumLabel")}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="text.primary">
          {t("matches.labels.scoreOnly", { score: formatScore(sum) })}
        </Typography>
      </Stack>

      {typeof overall === "number" && Number.isFinite(overall) && (
        <Typography variant="caption" color="text.secondary">
          {t("matches.labels.dimensionSumHint", {
            sum: formatScore(sum),
            overall: formatScore(Math.max(0, Math.min(100, overall))),
          })}
        </Typography>
      )}
    </Stack>
  );
};

const MatchRecommendationsContent = ({ limit = 10, accountLifecycle }) => {
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState({ loading: false, errorKey: "" });
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [profileDetails, setProfileDetails] = useState({});
  const [loadingDetailsFor, setLoadingDetailsFor] = useState(null);
  const [requestMessages, setRequestMessages] = useState({});
  const [requestErrors, setRequestErrors] = useState({});
  const [feedback, setFeedback] = useState({});
  const [sendingRequestFor, setSendingRequestFor] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { groups } = useUserCapabilities();
  const detailAbortRef = useRef(null);
  const lifecycleLoading = accountLifecycle?.loading ?? false;
  const accountDeactivated = accountLifecycle?.isDeactivated ?? false;

  const matchCapabilities = groups.matches;
  const canViewRecommendations = matchCapabilities.viewRecommendations.can;
  const canViewDetails = matchCapabilities.viewDetails.can;
  const canSendRequestCapability = matchCapabilities.sendRequest.can;
  const canNavigateToProfile = matchCapabilities.navigateToProfile.can;
  const requestsBlockedByLifecycle = !lifecycleLoading && accountDeactivated;
  const canSendRequest =
    canSendRequestCapability && !requestsBlockedByLifecycle;

  useEffect(() => {
    return () => {
      if (detailAbortRef.current) {
        detailAbortRef.current.abort();
        detailAbortRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (canViewDetails && !requestsBlockedByLifecycle) {
      return;
    }

    if (detailAbortRef.current) {
      detailAbortRef.current.abort();
      detailAbortRef.current = null;
    }
    setLoadingDetailsFor(null);
    setExpandedMatchId(null);
    setProfileDetails({});
  }, [canViewDetails, requestsBlockedByLifecycle]);

  useEffect(() => {
    if (lifecycleLoading) {
      return () => {};
    }

    if (!canViewRecommendations) {
      setStatus({ loading: false, errorKey: "" });
      setMatches([]);
      setExpandedMatchId(null);
      if (detailAbortRef.current) {
        detailAbortRef.current.abort();
        detailAbortRef.current = null;
      }
      return () => {};
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setStatus({ loading: false, errorKey: "matches.messages.noActiveUser" });
      return () => {};
    }

    const controller = new AbortController();

    const loadMatches = async () => {
      setStatus({ loading: true, errorKey: "" });
      try {
        const results = await fetchMatches(userId, { limit }, {
          signal: controller.signal,
        });
        const normalizedMatches = Array.isArray(results)
          ? results.map(normalizeMatch)
          : [];
        const orderedMatches = [...normalizedMatches].sort(
          (a, b) => Number(b.score) - Number(a.score)
        );
        setMatches(orderedMatches);
        setStatus({ loading: false, errorKey: "" });
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        setStatus({
          loading: false,
          errorKey: "matches.messages.loadError",
        });
      }
    };

    loadMatches();

    return () => {
      controller.abort();
    };
  }, [
    limit,
    canViewRecommendations,
    lifecycleLoading,
    detailAbortRef,
  ]);

  const orderedMatches = useMemo(() => {
    if (!Array.isArray(matches)) {
      return [];
    }
    return matches;
  }, [matches]);

  const handleToggleExpand = async (matchKey, rawUserId) => {
    if (!canViewDetails) {
      return;
    }

    const normalizedUserId = normalizeUserId(rawUserId);

    if (normalizedUserId === null) {
      return;
    }

    if (expandedMatchId === matchKey) {
      if (detailAbortRef.current) {
        detailAbortRef.current.abort();
        detailAbortRef.current = null;
      }
      setExpandedMatchId(null);
      return;
    }

    setExpandedMatchId(matchKey);
    setFeedback((previous) => ({ ...previous, [matchKey]: null }));
    setRequestErrors((previous) => ({ ...previous, [matchKey]: "" }));
    setRequestMessages((previous) => ({
      ...previous,
      [matchKey]: previous[matchKey] ?? "",
    }));

    if (profileDetails[matchKey]) {
      return;
    }

    if (detailAbortRef.current) {
      detailAbortRef.current.abort();
    }

    const controller = new AbortController();
    detailAbortRef.current = controller;
    setLoadingDetailsFor(matchKey);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `${token}` } : {};

      const [profileResponse, statusResponse] = await Promise.all([
        api.get(`/user/profile/${normalizedUserId}`, {
          headers,
          signal: controller.signal,
        }),
        api.get(`/user/checkReqStatus/${normalizedUserId}`, {
          headers,
          signal: controller.signal,
        }),
      ]);

      setProfileDetails((previous) => ({
        ...previous,
        [matchKey]: {
          ...profileResponse.data,
          requestStatus: statusResponse.data?.requestStatus,
        },
      }));
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      setFeedback((previous) => ({
        ...previous,
        [matchKey]: { type: "error", key: "home.messages.profileError" },
      }));
    } finally {
      setLoadingDetailsFor(null);
      if (detailAbortRef.current === controller) {
        detailAbortRef.current = null;
      }
    }
  };

  const handleRequestMessageChange = (matchKey, value) => {
    setRequestMessages((previous) => ({ ...previous, [matchKey]: value }));
    setRequestErrors((previous) => ({ ...previous, [matchKey]: "" }));
    setFeedback((previous) => ({ ...previous, [matchKey]: null }));
  };

  const handleSendRequest = async (matchKey, rawUserId) => {
    if (!canSendRequest || requestsBlockedByLifecycle) {
      return;
    }

    const normalizedUserId = normalizeUserId(rawUserId);
    if (normalizedUserId === null) {
      return;
    }

    const trimmedMessage = (requestMessages[matchKey] || "").trim();
    if (!trimmedMessage) {
      setRequestErrors((previous) => ({
        ...previous,
        [matchKey]: "home.validation.requestMessageRequired",
      }));
      return;
    }

    setRequestErrors((previous) => ({ ...previous, [matchKey]: "" }));
    setSendingRequestFor(matchKey);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `${token}` } : {};
      const parsedId =
        typeof normalizedUserId === "number"
          ? normalizedUserId
          : parseInt(normalizedUserId, 10);

      await api.post(
        `/user/sendRequest`,
        {
          receiver_id: Number.isNaN(parsedId) ? normalizedUserId : parsedId,
          description: trimmedMessage,
        },
        { headers }
      );

      setProfileDetails((previous) => ({
        ...previous,
        [matchKey]: {
          ...previous[matchKey],
          requestStatus: true,
        },
      }));
      setFeedback((previous) => ({
        ...previous,
        [matchKey]: { type: "success", key: "home.messages.requestSuccess" },
      }));
      setRequestMessages((previous) => ({
        ...previous,
        [matchKey]: trimmedMessage,
      }));
    } catch (error) {
      setFeedback((previous) => ({
        ...previous,
        [matchKey]: { type: "error", key: "home.messages.requestError" },
      }));
    } finally {
      setSendingRequestFor(null);
    }
  };

  const showLifecycleBanner = !lifecycleLoading && accountDeactivated;

  return (
    <FeatureCard
      title={t("matches.headers.title")}
      subheader={t("matches.headers.subheader")}
      icon={TrendingUpIcon}
    >
      {showLifecycleBanner && (
        <Alert severity="warning">{ACCOUNT_DEACTIVATED_MESSAGE}</Alert>
      )}
        <Guard
          can={CAPABILITIES.MATCHES_VIEW_RECOMMENDATIONS}
          fallback={
            showLifecycleBanner ? null : (
              <Typography variant="body2" color="text.secondary">
                {t("matches.messages.noMatches")}
              </Typography>
            )
          }
        >
          {status.loading ? (
            <Stack spacing={spacing.section}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : status.errorKey ? (
            <Typography color="error" variant="body2">
              {t(status.errorKey)}
            </Typography>
          ) : orderedMatches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("matches.messages.noMatches")}
            </Typography>
          ) : (
            <Stack spacing={spacing.section}>
              {orderedMatches.map((match, index) => {
                const matchKey = getMatchIdentifier(match, `match-${index}`);
                const userId = getMatchIdentifier(match);
                const isExpanded = expandedMatchId === matchKey;
                const details = profileDetails[matchKey] || {};
                const requestStatus = Boolean(details.requestStatus);
                const displayName =
                  match.username ||
                  t("common.placeholders.userNumber", { id: matchKey });
                const avatarFallback = displayName.charAt(0)?.toUpperCase() || "?";
                const messageValue = requestMessages[matchKey] || "";
                const requestErrorKey = requestErrors[matchKey];
                const feedbackForMatch = feedback[matchKey];
                const isTopMatch = index === 0;
                const hasUserIdentifier =
                  userId !== undefined && userId !== null && userId !== "";
                const canExpandMatch = canViewDetails && hasUserIdentifier;
                const canNavigateMatch = canNavigateToProfile && hasUserIdentifier;
                const canComposeForMatch =
                  canSendRequestCapability && hasUserIdentifier;
                const canSubmitRequestForMatch =
                  canSendRequest && hasUserIdentifier;
                const locationText =
                  details.location || match.location || "";
                const bioText = details.bio || match.bio || "";
                const reasons = match.reasons;
                const reasonsAreObject = isPlainObject(reasons);
                const reasonsAreArrayOrString =
                  Array.isArray(reasons) || typeof reasons === "string";
                const perDimensionScores =
                  reasonsAreObject && Array.isArray(reasons.per_dimension)
                    ? reasons.per_dimension
                    : [];
                const overallCompatibilityPercentage =
                  reasonsAreObject && typeof reasons.raw_score === "number"
                    ? clampScore(convertToPercentage(reasons.raw_score))
                    : null;
                const dimensionBreakdown = perDimensionScores.map(
                  (value, dimensionIndex) => {
                    const percentage = convertToPercentage(value);
                    const clampedPercentage = clampScore(percentage);
                    return {
                      label: t("matches.labels.dimensionWithIndex", {
                        index: dimensionIndex + 1,
                      }),
                      value: clampedPercentage,
                    };
                  }
                );
                const dimensionSum = dimensionBreakdown.reduce(
                  (accumulator, { value }) => accumulator + value,
                  0
                );

                return (
                  <Guard can={CAPABILITIES.MATCHES_VIEW_DETAILS} key={matchKey}>
                    {({ isAllowed }) => (
                      <Box
                        onClick={() => {
                          if (!isAllowed || !canExpandMatch) {
                            return;
                          }
                          handleToggleExpand(matchKey, userId);
                        }}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          bgcolor: isTopMatch
                            ? (theme) => theme.palette.action.hover
                            : "background.paper",
                          cursor: isAllowed && canExpandMatch ? "pointer" : "default",
                          transition:
                            "background-color 0.2s ease, border-color 0.2s ease",
                          "&:hover":
                            isAllowed && canExpandMatch
                              ? {
                                  borderColor: (theme) => theme.palette.primary.light,
                                }
                              : undefined,
                        }}
                      >
                        <Stack spacing={spacing.section}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              variant="rounded"
                              src={match.profile_image}
                              alt={match.username}
                              sx={{ width: isTopMatch ? 72 : 56, height: isTopMatch ? 72 : 56 }}
                            >
                              {avatarFallback}
                            </Avatar>
                            <Stack spacing={0.25} flexGrow={1}>
                              {isTopMatch && (
                                <Typography variant="subtitle2" color="text.secondary">
                                  {t("matches.labels.topMatch")}
                                </Typography>
                              )}
                              <Typography
                                variant={isTopMatch ? "h6" : "subtitle1"}
                                sx={{ fontWeight: 700 }}
                              >
                                {displayName}
                              </Typography>
                              {locationText && (
                                <Typography variant="body2" color="text.secondary">
                                  {locationText}
                                </Typography>
                              )}
                            </Stack>
                            <Guard can={CAPABILITIES.MATCHES_VIEW_COMPATIBILITY}>
                              {({ isAllowed: canShowMatchScore }) =>
                                canShowMatchScore ? (
                                  <MuiTooltip title={t("matches.labels.scoreTooltip")}>
                                    <Chip
                                      color={isTopMatch ? "primary" : "default"}
                                      label={t("matches.labels.matchScore", {
                                        score: formatScore(match.score),
                                      })}
                                      sx={{ fontWeight: 600 }}
                                    />
                                  </MuiTooltip>
                                ) : null
                              }
                            </Guard>
                          </Stack>

                          {bioText && (
                            <Typography variant="body2" color="text.secondary">
                              {bioText}
                            </Typography>
                          )}

                          {reasonsAreArrayOrString && (
                            <Box>
                              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                                {t("matches.labels.otherMatches")}
                              </Typography>
                              {Array.isArray(reasons) ? (
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                  {reasons.map((reason, reasonIndex) => (
                                    <Chip
                                      key={`${matchKey}-reason-${reasonIndex}`}
                                      label={reason}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {reasons}
                                </Typography>
                              )}
                            </Box>
                          )}

                          <Guard can={CAPABILITIES.MATCHES_VIEW_COMPATIBILITY}>
                            {({ isAllowed: canShowCompatibility }) =>
                              canShowCompatibility ? (
                                <Stack spacing={0.75}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <LinearProgress
                                      variant="determinate"
                                      value={Math.min(
                                        100,
                                        Math.max(0, Number(match.score) || 0)
                                      )}
                                      sx={{
                                        height: 8,
                                        borderRadius: 999,
                                        flex: 1,
                                        bgcolor: theme.palette.action.hover,
                                      }}
                                    />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                      {t("matches.labels.matchScore", {
                                        score: formatScore(
                                          Math.min(MAX_SCORE, Number(match.score) || 0)
                                        ),
                                      })}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary">
                                    {t("matches.labels.scoreTooltip")}
                                  </Typography>
                                </Stack>
                              ) : null
                            }
                          </Guard>

                          <Guard can={CAPABILITIES.MATCHES_NAVIGATE_TO_PROFILE}>
                            {({ isAllowed: canVisitProfileAllowed }) => (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (!canVisitProfileAllowed || !canNavigateMatch) {
                                    return;
                                  }
                                  navigate(`/profile/${userId}`);
                                }}
                                disabled={!canVisitProfileAllowed || !canNavigateMatch}
                                sx={{ alignSelf: "flex-start" }}
                              >
                                {t("home.labels.viewProfile")}
                              </Button>
                            )}
                          </Guard>

                          <Collapse in={isAllowed && isExpanded} timeout="auto" unmountOnExit>
                            <Box
                              sx={{ mt: spacing.section }}
                              onClick={(event) => event.stopPropagation()}
                            >
                              {loadingDetailsFor === matchKey ? (
                                <Stack spacing={spacing.section}>
                                  <Skeleton width="80%" />
                                  <Skeleton width="60%" />
                                  <Skeleton width="40%" />
                                  <Skeleton variant="rectangular" width={160} height={40} />
                                </Stack>
                              ) : (
                                <Stack spacing={spacing.section}>
                                  <Typography variant="body1">
                                    <strong>{t("home.labels.bio")}:</strong>{" "}
                                    {bioText || t("common.placeholders.noBio")}
                                  </Typography>
                                  <Typography variant="body1">
                                    <strong>{t("home.labels.location")}:</strong>{" "}
                                    {locationText || t("common.placeholders.notAvailable")}
                                  </Typography>
                                  {details.age && (
                                    <Typography variant="body1">
                                      <strong>{t("home.labels.age")}:</strong>{" "}
                                      {details.age}
                                    </Typography>
                                  )}
                                  <Guard can={CAPABILITIES.MATCHES_VIEW_COMPATIBILITY}>
                                    {({ isAllowed: canShowBreakdown }) =>
                                      canShowBreakdown && dimensionBreakdown.length > 0 ? (
                                        <Stack spacing={spacing.item}>
                                          <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            fontWeight={600}
                                          >
                                            {t("matches.labels.compatibilityBreakdown")}
                                          </Typography>
                                          <DimensionBreakdownList
                                            breakdown={dimensionBreakdown}
                                            sum={dimensionSum}
                                            overall={overallCompatibilityPercentage}
                                            t={t}
                                          />
                                        </Stack>
                                      ) : null
                                    }
                                  </Guard>
                                  <Box>
                                    <TextField
                                      fullWidth
                                      multiline
                                      minRows={2}
                                      label={t("home.labels.requestMessage")}
                                      value={messageValue}
                                      onChange={(event) =>
                                        handleRequestMessageChange(matchKey, event.target.value)
                                      }
                                      helperText={
                                        requestErrorKey
                                          ? t(requestErrorKey)
                                          : t("home.helpers.requestMessage")
                                      }
                                      error={Boolean(requestErrorKey)}
                                      disabled={
                                        requestStatus || !canComposeForMatch
                                      }
                                    />
                                  </Box>
                                  <Guard can={CAPABILITIES.MATCHES_SEND_REQUEST}>
                                    {({ isAllowed: canSubmitRequestAllowed }) => (
                                      <Button
                                        variant="contained"
                                        color={requestStatus ? "secondary" : "primary"}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          if (
                                            !canSubmitRequestAllowed ||
                                            !canSubmitRequestForMatch
                                          ) {
                                            return;
                                          }
                                          handleSendRequest(matchKey, userId);
                                        }}
                                        disabled={
                                          !canSubmitRequestAllowed ||
                                          !canSubmitRequestForMatch ||
                                          requestStatus ||
                                          sendingRequestFor === matchKey
                                        }
                                        sx={{ alignSelf: "flex-start" }}
                                      >
                                        {requestStatus
                                          ? t("home.labels.requestSent")
                                          : t("home.labels.sendRequest")}
                                      </Button>
                                    )}
                                  </Guard>
                                  {feedbackForMatch?.key && (
                                    <Typography
                                      color={
                                        feedbackForMatch.type === "error"
                                          ? "error.main"
                                          : "success.main"
                                      }
                                    >
                                      {t(feedbackForMatch.key)}
                                    </Typography>
                                  )}
                                </Stack>
                              )}
                            </Box>
                          </Collapse>
                        </Stack>
                      </Box>
                    )}
                  </Guard>
                );
              })}
            </Stack>
          )}
        </Guard>
    </FeatureCard>
  );
};

const MatchRecommendations = (props) => {
  const accountLifecycle = useAccountLifecycle();

  return (
    <MatchRecommendationsContent
      {...props}
      accountLifecycle={accountLifecycle}
    />
  );
};

export { MatchRecommendationsContent };

export default MatchRecommendations;
