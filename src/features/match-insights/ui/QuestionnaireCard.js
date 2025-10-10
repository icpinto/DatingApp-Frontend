import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  Skeleton,
  Slider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { spacing } from "@/styles";
import Guard from "@/shared/components/Guard";
import { CAPABILITIES } from "@/domain/capabilities";
import { useAccountLifecycle } from "@/shared/context/AccountLifecycleContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "@/domain/accountLifecycle";
import { useUserCapabilities } from "@/shared/context/UserContext";
import { useQuestionnaire } from "../hooks/useMatchInsights";
import QuestionCategorySelector from "./QuestionCategorySelector";

function buildAnswerPayload({ answer, questionType, options }) {
  const formatAnswer = (value) => {
    if (questionType === "multiple_choice") {
      const selectedOption = options.find((option) => option.key === value);
      if (selectedOption) {
        return selectedOption.value;
      }
    }
    return value;
  };

  const selectedOption =
    questionType === "scale" || questionType === "open_text"
      ? answer?.toString() ?? ""
      : answer || "";

  const additionalValue = formatAnswer(answer);

  return {
    selected_option: selectedOption,
    additionalProp1:
      additionalValue !== undefined && additionalValue !== null
        ? { value: additionalValue }
        : {},
  };
}

function QuestionnaireCard({ isLocked = false, lockReason = "" }) {
  const [question, setQuestion] = useState(null);
  const [meAnswer, setMeAnswer] = useState("");
  const [idealAnswer, setIdealAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { getQuestionnaire, saveQuestionnaire } = useQuestionnaire();
  const accountLifecycle = useAccountLifecycle();
  const { isDeactivated = false, loading: lifecycleLoading = false } =
    accountLifecycle || {};
  const { groups } = useUserCapabilities();
  const insightCapabilities = groups.insights;
  const answerCapability = insightCapabilities.answerQuestionnaire;
  const viewQuestionnaireCapability = insightCapabilities.viewQuestionnaire;
  const canAnswerQuestionnaire = answerCapability.can;
  const capabilityLockReason = canAnswerQuestionnaire
    ? undefined
    : answerCapability.reason;
  const questionnaireDisabled = useMemo(
    () => !lifecycleLoading && isDeactivated,
    [isDeactivated, lifecycleLoading]
  );
  const isCapabilityLocked = !canAnswerQuestionnaire;
  const effectiveLock = questionnaireDisabled || isLocked || isCapabilityLocked;
  const combinedLockReason = questionnaireDisabled
    ? ACCOUNT_DEACTIVATED_MESSAGE
    : lockReason || capabilityLockReason;

  const fetchQuestion = useCallback(async () => {
    if (effectiveLock) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getQuestionnaire({ category: selectedCategory });
      setQuestion(data || null);
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion(null);
      setSnackbar({
        open: true,
        message: "Failed to load question",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [effectiveLock, getQuestionnaire, selectedCategory]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    if (effectiveLock) {
      setQuestion(null);
      setLoading(false);
    }
  }, [effectiveLock]);

  const questionType = question ? question.type : null;
  const questionText = question ? question.question : "";
  const options = question && Array.isArray(question.options) ? question.options : [];

  const submitAnswer = useCallback(async () => {
    if (!question || effectiveLock) return;

    try {
      await saveQuestionnaire({
        question_instance_id: question.question_instance_id,
        answer: {
          myself: buildAnswerPayload({
            answer: meAnswer,
            questionType,
            options,
          }),
          ideal_partner: buildAnswerPayload({
            answer: idealAnswer,
            questionType,
            options,
          }),
        },
      });
      setSnackbar({
        open: true,
        message: "Answer submitted",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      setSnackbar({
        open: true,
        message: "Failed to submit answer",
        severity: "error",
      });
      throw error;
    }
  }, [effectiveLock, idealAnswer, meAnswer, options, question, questionType, saveQuestionnaire]);

  const handleNext = async () => {
    if (effectiveLock) return;

    try {
      await submitAnswer();
    } catch (error) {
      // submission error already handled via snackbar
    }
    setMeAnswer("");
    setIdealAnswer("");
    await fetchQuestion();
  };

  const viewFallback = useCallback(
    () => (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        {viewQuestionnaireCapability.reason ||
          "Match questionnaire is currently unavailable."}
      </Alert>
    ),
    [viewQuestionnaireCapability.reason]
  );

  return (
    <Guard
      can={CAPABILITIES.INSIGHTS_VIEW_QUESTIONNAIRE}
      fallback={viewFallback}
    >
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <FavoriteIcon />
            </Avatar>
          }
          title="Questionnaire"
          subheader="Share your preferences to improve recommendations"
        />
        <Divider />
        <CardContent>
          <Stack spacing={spacing.section}>
            <QuestionCategorySelector
              value={selectedCategory}
              onChange={setSelectedCategory}
              disabled={effectiveLock}
            />

            {questionnaireDisabled ? (
              <Alert severity="warning">{ACCOUNT_DEACTIVATED_MESSAGE}</Alert>
            ) : effectiveLock ? (
              <Typography color="text.secondary">
                {combinedLockReason || "Core preferences are required to continue."}
              </Typography>
            ) : loading ? (
              <Stack spacing={spacing.section}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              </Stack>
            ) : !question ? (
              <Typography color="text.secondary">
                All questions completed! Check back later for more.
              </Typography>
            ) : (
              <Stack spacing={spacing.section}>
                <Typography variant="h6">{questionText}</Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card
                      variant="outlined"
                      sx={{ borderRadius: 2, height: "100%", display: "flex" }}
                    >
                      <CardContent sx={{ width: "100%" }}>
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ bgcolor: "primary.light", color: "primary.dark" }}>
                              <PersonIcon />
                            </Avatar>
                            <Typography variant="subtitle1">Me</Typography>
                          </Stack>

                          {questionType === "multiple_choice" && (
                            <RadioGroup
                              value={meAnswer}
                              onChange={(event) => setMeAnswer(event.target.value)}
                            >
                              {options.map((option) => (
                                <FormControlLabel
                                  key={option.key}
                                  value={option.key}
                                  control={<Radio color="primary" />}
                                  label={option.label}
                                />
                              ))}
                            </RadioGroup>
                          )}

                          {questionType === "scale" && (
                            <Slider
                              value={typeof meAnswer === "number" ? meAnswer : 5}
                              onChange={(_, value) => setMeAnswer(value)}
                              step={1}
                              marks
                              min={1}
                              max={10}
                              valueLabelDisplay="auto"
                            />
                          )}

                          {questionType === "open_text" && (
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              value={meAnswer}
                              onChange={(event) => setMeAnswer(event.target.value)}
                              placeholder="Type your answer..."
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card
                      variant="outlined"
                      sx={{ borderRadius: 2, height: "100%", display: "flex" }}
                    >
                      <CardContent sx={{ width: "100%" }}>
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.dark" }}>
                              <FavoriteIcon />
                            </Avatar>
                            <Typography variant="subtitle1">Ideal Partner</Typography>
                          </Stack>

                          {questionType === "multiple_choice" && (
                            <RadioGroup
                              value={idealAnswer}
                              onChange={(event) => setIdealAnswer(event.target.value)}
                            >
                              {options.map((option) => (
                                <FormControlLabel
                                  key={option.key}
                                  value={option.key}
                                  control={<Radio color="secondary" />}
                                  label={option.label}
                                />
                              ))}
                            </RadioGroup>
                          )}

                          {questionType === "scale" && (
                            <Slider
                              value={typeof idealAnswer === "number" ? idealAnswer : 5}
                              onChange={(_, value) => setIdealAnswer(value)}
                              step={1}
                              marks
                              min={1}
                              max={10}
                              valueLabelDisplay="auto"
                            />
                          )}

                          {questionType === "open_text" && (
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              value={idealAnswer}
                              onChange={(event) => setIdealAnswer(event.target.value)}
                              placeholder="Type your answer..."
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FavoriteIcon color="secondary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    endIcon={
                      loading && !effectiveLock ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : null
                    }
                    disabled={loading || effectiveLock}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Guard>
  );
}

export default QuestionnaireCard;
