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
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { fetchMatches } from "../../services/matchmaking";
import { spacing } from "../../styles";

const MAX_SCORE = 100;

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
  const [status, setStatus] = useState({ loading: false, error: "" });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setStatus({ loading: false, error: "Unable to detect the active user." });
      return;
    }

    const loadMatches = async () => {
      setStatus({ loading: true, error: "" });
      try {
        const results = await fetchMatches(userId, { limit });
        const orderedMatches = [...results].sort(
          (a, b) => Number(b.score) - Number(a.score)
        );
        setMatches(orderedMatches);
        setStatus({ loading: false, error: "" });
      } catch (error) {
        setStatus({
          loading: false,
          error:
            error?.response?.data?.message ||
            error?.message ||
            "We could not load match recommendations right now.",
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
        title="Your Best Matches"
        subheader="Based on your questionnaire responses"
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
        ) : status.error ? (
          <Typography color="error" variant="body2">
            {status.error}
          </Typography>
        ) : !topMatch ? (
          <Typography variant="body2" color="text.secondary">
            We do not have any matches to show right now. Please check back
            later.
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
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <EmojiEventsIcon />
                </Avatar>
                <Stack spacing={0.5} flexGrow={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Top Match
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    User #{topMatch.user_id}
                  </Typography>
                </Stack>
                <Chip
                  color="primary"
                  label={`${formatScore(topMatch.score)}% match`}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={clampScore(topMatch.score)}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
              {topMatch.reasons && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {Array.isArray(topMatch.reasons)
                    ? topMatch.reasons.join(", ")
                    : topMatch.reasons}
                </Typography>
              )}
            </Box>

            {otherMatches.length > 0 && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Other great matches
                </Typography>
                {otherMatches.map((match, index) => (
                  <Box
                    key={`${match.user_id}-${index}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar variant="rounded" sx={{ width: 32, height: 32 }}>
                        {index + 2}
                      </Avatar>
                      <Stack spacing={0.25} flexGrow={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          User #{match.user_id}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={clampScore(match.score)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Stack>
                      <Tooltip title="Match score">
                        <Chip
                          label={`${formatScore(match.score)}%`}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </Stack>
                    {match.reasons && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1 }}
                      >
                        {Array.isArray(match.reasons)
                          ? match.reasons.join(", ")
                          : match.reasons}
                      </Typography>
                    )}
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
