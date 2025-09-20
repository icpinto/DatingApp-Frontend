import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { fetchMatches } from "../../services/matchmaking";
import { spacing } from "../../styles";
import { useTranslation } from "../../i18n";

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

const MatchRecommendations = ({ limit = 10 }) => {
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState({ loading: false, errorKey: "" });
  const { t } = useTranslation();

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

  const [topMatch, otherMatches] = useMemo(() => {
    if (!Array.isArray(matches) || matches.length === 0) {
      return [null, []];
    }
    return [matches[0], matches.slice(1)];
  }, [matches]);

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
        ) : !topMatch ? (
          <Typography variant="body2" color="text.secondary">
            {t("matches.messages.noMatches")}
          </Typography>
        ) : (
          <Stack spacing={spacing.section}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => theme.palette.action.hover,
              }}
            >
              <Stack spacing={spacing.section}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    variant="rounded"
                    src={topMatch.profile_image}
                    alt={topMatch.username}
                    sx={{ width: 72, height: 72 }}
                  >
                    {topMatch.username
                      ? topMatch.username.charAt(0).toUpperCase()
                      : "?"}
                  </Avatar>
                  <Stack spacing={0.5} flexGrow={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t("matches.labels.topMatch")}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {topMatch.username || `User #${topMatch.user_id}`}
                    </Typography>
                    {topMatch.location && (
                      <Typography variant="body2" color="text.secondary">
                        {topMatch.location}
                      </Typography>
                    )}
                  </Stack>
                  <Chip
                    color="primary"
                    label={t("matches.labels.matchScore", {
                      score: formatScore(topMatch.score),
                    })}
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
                {topMatch.bio && (
                  <Typography variant="body2" color="text.secondary">
                    {topMatch.bio}
                  </Typography>
                )}
                <LinearProgress
                  variant="determinate"
                  value={clampScore(topMatch.score)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                {topMatch.reasons && (
                  <Typography variant="body2" color="text.secondary">
                    {Array.isArray(topMatch.reasons)
                      ? topMatch.reasons.join(", ")
                      : topMatch.reasons}
                  </Typography>
                )}
              </Stack>
            </Box>

            {otherMatches.length > 0 && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("matches.labels.otherMatches")}
                </Typography>
                {otherMatches.map((match, index) => (
                  <Box
                    key={`${match.user_id || "match"}-${index}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          variant="rounded"
                          src={match.profile_image}
                          alt={match.username}
                          sx={{ width: 48, height: 48 }}
                        >
                          {match.username
                            ? match.username.charAt(0).toUpperCase()
                            : index + 2}
                        </Avatar>
                        <Stack spacing={0.25} flexGrow={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {match.username || `User #${match.user_id}`}
                          </Typography>
                          {match.location && (
                            <Typography variant="caption" color="text.secondary">
                              {match.location}
                            </Typography>
                          )}
                        </Stack>
                        <Tooltip title={t("matches.labels.scoreTooltip")}>
                          <Chip
                            label={t("matches.labels.scoreOnly", {
                              score: formatScore(match.score),
                            })}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      </Stack>
                      {match.bio && (
                        <Typography variant="body2" color="text.secondary">
                          {match.bio}
                        </Typography>
                      )}
                      <LinearProgress
                        variant="determinate"
                        value={clampScore(match.score)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      {match.reasons && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {Array.isArray(match.reasons)
                            ? match.reasons.join(", ")
                            : match.reasons}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchRecommendations;
