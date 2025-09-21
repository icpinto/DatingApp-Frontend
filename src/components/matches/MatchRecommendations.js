import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import { fetchMatches } from "../../services/matchmaking";
import api from "../../services/api";
import { spacing } from "../../styles";
import { useTranslation } from "../../i18n";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

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

const RadarChartPreview = ({ data = [], size = 220, theme, title }) => {
  const dimensionsCount = Array.isArray(data) ? data.length : 0;

  if (!dimensionsCount) {
    return null;
  }

  const viewBoxSize = size;
  const radius = viewBoxSize / 2;
  const center = radius;
  const maxValue = 100;
  const chartRadius = radius * 0.85;
  const angleStep = (Math.PI * 2) / dimensionsCount;

  const polarToCartesian = (value, index, customRadius = chartRadius) => {
    const angle = angleStep * index - Math.PI / 2;
    const normalized = Math.max(0, Math.min(maxValue, value)) / maxValue;
    const scaledRadius = customRadius * normalized;
    const x = center + Math.cos(angle) * scaledRadius;
    const y = center + Math.sin(angle) * scaledRadius;
    return `${x},${y}`;
  };

  const polygonPoints = data
    .map((item, index) => polarToCartesian(item.value, index))
    .join(" ");

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <Box
      sx={{ width: "100%", height: size, position: "relative" }}
      aria-hidden={false}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        role="img"
        aria-label={title}
        focusable="false"
      >
        <title>{title}</title>
        <g fill="none">
          {rings.map((ratio) => {
            const ringPoints = data
              .map((_, index) => polarToCartesian(maxValue * ratio, index))
              .join(" ");
            return (
              <polygon
                key={`ring-${ratio}`}
                points={ringPoints}
                stroke={theme.palette.divider}
                strokeWidth={0.75}
                fill="none"
              />
            );
          })}
          {data.map((_, index) => {
            const [x, y] = polarToCartesian(maxValue, index, chartRadius)
              .split(",")
              .map(Number);
            return (
              <line
                key={`axis-${index}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={theme.palette.divider}
                strokeWidth={0.75}
              />
            );
          })}
          <polygon
            points={polygonPoints}
            fill={theme.palette.primary.main}
            fillOpacity={0.18}
            stroke={theme.palette.primary.main}
            strokeWidth={1.5}
          />
        </g>
        {data.map((item, index) => {
          const labelRadius = chartRadius + 12;
          const angle = angleStep * index - Math.PI / 2;
          const x = center + Math.cos(angle) * labelRadius;
          const y = center + Math.sin(angle) * labelRadius;
          const textAnchor = Math.abs(Math.cos(angle)) < 0.1
            ? "middle"
            : Math.cos(angle) > 0
            ? "start"
            : "end";
          const dy = Math.sin(angle) > 0.3 ? 12 : Math.sin(angle) < -0.3 ? -4 : 4;
          return (
            <text
              key={`label-${item.label}`}
              x={x}
              y={y}
              textAnchor={textAnchor}
              fill={theme.palette.text.secondary}
              fontSize={10}
              dy={dy}
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </Box>
  );
};

const MatchRecommendations = ({ limit = 10 }) => {
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

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setStatus({ loading: false, errorKey: "matches.messages.noActiveUser" });
      return;
    }

    const loadMatches = async () => {
      setStatus({ loading: true, errorKey: "" });
      try {
        const results = await fetchMatches(userId, { limit });
        const normalizedMatches = Array.isArray(results)
          ? results.map(normalizeMatch)
          : [];
        const orderedMatches = [...normalizedMatches].sort(
          (a, b) => Number(b.score) - Number(a.score)
        );
        setMatches(orderedMatches);
        setStatus({ loading: false, errorKey: "" });
      } catch (error) {
        setStatus({
          loading: false,
          errorKey: "matches.messages.loadError",
        });
      }
    };

    loadMatches();
  }, [limit]);

  const orderedMatches = useMemo(() => {
    if (!Array.isArray(matches)) {
      return [];
    }
    return matches;
  }, [matches]);

  const handleToggleExpand = async (matchKey, rawUserId) => {
    const normalizedUserId = normalizeUserId(rawUserId);

    if (normalizedUserId === null) {
      return;
    }

    if (expandedMatchId === matchKey) {
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

    setLoadingDetailsFor(matchKey);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `${token}` } : {};

      const [profileResponse, statusResponse] = await Promise.all([
        api.get(`/user/profile/${normalizedUserId}`, { headers }),
        api.get(`/user/checkReqStatus/${normalizedUserId}`, { headers }),
      ]);

      setProfileDetails((previous) => ({
        ...previous,
        [matchKey]: {
          ...profileResponse.data,
          requestStatus: statusResponse.data?.requestStatus,
        },
      }));
    } catch (error) {
      setFeedback((previous) => ({
        ...previous,
        [matchKey]: { type: "error", key: "home.messages.profileError" },
      }));
    } finally {
      setLoadingDetailsFor(null);
    }
  };

  const handleRequestMessageChange = (matchKey, value) => {
    setRequestMessages((previous) => ({ ...previous, [matchKey]: value }));
    setRequestErrors((previous) => ({ ...previous, [matchKey]: "" }));
    setFeedback((previous) => ({ ...previous, [matchKey]: null }));
  };

  const handleSendRequest = async (matchKey, rawUserId) => {
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

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={t("matches.headers.title")}
        subheader={t("matches.headers.subheader")}
        avatar={
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <TrendingUpIcon />
          </Avatar>
        }
      />
      <Divider />
      <CardContent>
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
              const canInteract =
                userId !== undefined && userId !== null && userId !== "";
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

              return (
                <Box
                  key={matchKey}
                  onClick={
                    canInteract
                      ? () => handleToggleExpand(matchKey, userId)
                      : undefined
                  }
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: isTopMatch
                      ? (theme) => theme.palette.action.hover
                      : "background.paper",
                    cursor: canInteract ? "pointer" : "default",
                    transition: "background-color 0.2s ease, border-color 0.2s ease",
                    "&:hover": canInteract
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
                          <Typography
                            variant={isTopMatch ? "body2" : "body2"}
                            color="text.secondary"
                          >
                            {locationText}
                          </Typography>
                        )}
                      </Stack>
                      <MuiTooltip title={t("matches.labels.scoreTooltip")}>
                        <Chip
                          color={isTopMatch ? "primary" : "default"}
                          label={t("matches.labels.matchScore", {
                            score: formatScore(match.score),
                          })}
                          sx={{ fontWeight: 600 }}
                        />
                      </MuiTooltip>
                    </Stack>

                    {bioText && (
                      <Typography variant="body2" color="text.secondary">
                        {bioText}
                      </Typography>
                    )}

                    <LinearProgress
                      variant="determinate"
                      value={clampScore(match.score)}
                      sx={{ height: isTopMatch ? 8 : 6, borderRadius: 4 }}
                    />

                    {reasons && (
                      <Box>
                        {reasonsAreArrayOrString && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {Array.isArray(reasons)
                              ? reasons.join(", ")
                              : reasons}
                          </Typography>
                        )}
                        {reasonsAreObject && (
                          <Stack spacing={1} mt={reasonsAreArrayOrString ? 1 : 0}>
                            {typeof reasons.raw_score === "number" && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, display: "block" }}
                              >
                                {t("matches.labels.overallCompatibility", {
                                  score: formatScore(
                                    convertToPercentage(reasons.raw_score)
                                  ),
                                })}
                              </Typography>
                            )}
                            {dimensionBreakdown.length > 0 && (
                              <Stack spacing={0.75}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {t("matches.labels.compatibilityBreakdown")}
                                </Typography>
                                <RadarChartPreview
                                  data={dimensionBreakdown}
                                  theme={theme}
                                  title={t("matches.labels.compatibilityBreakdown")}
                                />
                                <Stack spacing={0.5}>
                                  {dimensionBreakdown.map(
                                    ({ label, value }, dimensionIndex) => (
                                      <Stack
                                        key={`dimension-${dimensionIndex}`}
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ minWidth: 80 }}
                                        >
                                          {label}
                                        </Typography>
                                        <LinearProgress
                                          variant="determinate"
                                          value={value}
                                          sx={{
                                            flexGrow: 1,
                                            height: 4,
                                            borderRadius: 2,
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ minWidth: 44, textAlign: "right" }}
                                        >
                                          {formatScore(value)}%
                                        </Typography>
                                      </Stack>
                                    )
                                  )}
                                </Stack>
                              </Stack>
                            )}
                          </Stack>
                        )}
                      </Box>
                    )}

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!canInteract) {
                          return;
                        }
                        navigate(`/profile/${userId}`);
                      }}
                      disabled={!canInteract}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {t("home.labels.viewProfile")}
                    </Button>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
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
                                disabled={requestStatus}
                              />
                            </Box>
                            <Button
                              variant="contained"
                              color={requestStatus ? "secondary" : "primary"}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSendRequest(matchKey, userId);
                              }}
                              disabled={
                                requestStatus ||
                                sendingRequestFor === matchKey ||
                                !canInteract
                              }
                              sx={{ alignSelf: "flex-start" }}
                            >
                              {requestStatus
                                ? t("home.labels.requestSent")
                                : t("home.labels.sendRequest")}
                            </Button>
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
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchRecommendations;
