import React, { useState, useEffect } from "react";
import {
  Avatar,
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Skeleton,
  Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { spacing } from "../../styles";
import questionnaireService from "../../services/questionnaireService";
import QuestionCategorySelector from "./QuestionCategorySelector";

function QuestionsComponent({ isLocked = false, lockReason = "" }) {
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

  const userId = localStorage.getItem("user_id") || "";

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const params = { user_id: userId };
      if (selectedCategory !== "All") {
        params.category = selectedCategory;
      }
      const res = await questionnaireService.get("/chat/next", {
        params,
      });
      setQuestion(res.data || null);
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion(null);
      setSnackbar({ open: true, message: "Failed to load question", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLocked) {
      fetchQuestion();
    } else {
      setLoading(false);
    }
    // Payment logic disabled for now
  }, [selectedCategory, isLocked]);

  useEffect(() => {
    if (isLocked) {
      setQuestion(null);
      setLoading(false);
    }
  }, [isLocked]);

  const submitAnswer = async () => {
    if (!question || isLocked) return;
    const formatAnswer = (answer) => {
      if (questionType === "multiple_choice") {
        const selectedOption = options.find((option) => option.key === answer);
        if (selectedOption) {
          return selectedOption.value;
        }
      }
      return answer;
    };

    const buildAnswerPayload = (answer) => {
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
    };
    try {
      await questionnaireService.post("/chat/answer", {
        user_id: userId,
        question_instance_id: question.question_instance_id,
        answer: {
          myself: buildAnswerPayload(meAnswer),
          ideal_partner: buildAnswerPayload(idealAnswer),
        },
      });
      setSnackbar({ open: true, message: "Answer submitted", severity: "success" });
    } catch (err) {
      console.error("Error submitting answer:", err);
      setSnackbar({ open: true, message: "Failed to submit answer", severity: "error" });
    }
  };

  const handleNext = async () => {
    if (isLocked) return;

    await submitAnswer();
    setMeAnswer("");
    setIdealAnswer("");
    await fetchQuestion();
  };

  const questionType = question ? question.type : null;
  const questionText = question ? question.question : "";
  const options = question && Array.isArray(question.options) ? question.options : [];

  return (
    <>
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
              disabled={isLocked}
            />

            {isLocked ? (
              <Typography color="text.secondary">
                {lockReason || "Core preferences are required to continue."}
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
                      sx={{
                        borderRadius: 2,
                        height: "100%",
                        display: "flex",
                      }}
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
                              onChange={(e) => setMeAnswer(e.target.value)}
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
                              onChange={(e, newValue) => setMeAnswer(newValue)}
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
                              onChange={(e) => setMeAnswer(e.target.value)}
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
                      sx={{
                        borderRadius: 2,
                        height: "100%",
                        display: "flex",
                      }}
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
                              onChange={(e) => setIdealAnswer(e.target.value)}
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
                              onChange={(e, newValue) => setIdealAnswer(newValue)}
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
                              onChange={(e) => setIdealAnswer(e.target.value)}
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
                      loading && !isLocked ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : null
                    }
                    disabled={loading || isLocked}
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
    </>
  );
}

export default QuestionsComponent;
