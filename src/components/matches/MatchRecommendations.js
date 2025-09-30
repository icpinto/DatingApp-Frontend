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

const DimensionBreakdownList = ({ breakdown = [], sum = 0, overall = null, t }) => {
  if (!Array.isArray(breakdown) || breakdown.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Stack spacing={1}>
        {breakdown.map(({ label, value }, dimensionIndex) => {
          const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
          const clampedValue = Math.max(0, Math.min(100, numericValue));

          return (
            <Stack key={`dimension-row-${dimensionIndex}`} spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {formatScore(clampedValue)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={clampedValue}
                sx={{ height: 6, borderRadius: 999 }}
              />
            </Stack>
          );
        })}
      </Stack>

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
                            {overallCompatibilityPercentage !== null && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 600, display: "block" }}
                              >
                                {t("matches.labels.overallCompatibility", {
                                  score: formatScore(overallCompatibilityPercentage),
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
                                <DimensionBreakdownList
                                  breakdown={dimensionBreakdown}
                                  sum={dimensionSum}
                                  overall={overallCompatibilityPercentage}
                                  t={t}
                                />
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
