import React, { useState, useEffect } from "react";
import {
  Box,
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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import chatService from "../../services/chatService";
import QuestionCategorySelector from "./QuestionCategorySelector";

function QuestionsComponent() {
  const [question, setQuestion] = useState(null);
  const [meAnswer, setMeAnswer] = useState("");
  const [idealAnswer, setIdealAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const userId = localStorage.getItem("user_id") || "";

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const params = { user_id: userId };
      if (selectedCategory !== "All") {
        params.category = selectedCategory;
      }
      const res = await chatService.get("/chat/next", {
        params,
      });
      setQuestion(res.data || null);
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    // Payment logic disabled for now
  }, [selectedCategory]);

  const submitAnswer = async () => {
    if (!question) return;
    try {
      await chatService.post("/chat/answer", {
        user_id: userId,
        question_instance_id: question.question_instance_id,
        message: {
          me: meAnswer,
          ideal_partner: idealAnswer,
        },
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  const handleNext = async () => {
    await submitAnswer();
    setMeAnswer("");
    setIdealAnswer("");
    await fetchQuestion();
  };

  const payload = question ? question.payload : null;
  const questionType = question ? question.type : null;
  const questionText = payload ? payload.question : "";

  if (loading) return <Typography>Loading question...</Typography>;
  if (!question) return <Typography>All questions completed!</Typography>;

  return (
    <Box sx={{ mt: 4, p: 2, borderTop: "1px solid #ccc" }}>
      <Typography variant="h5" gutterBottom>Questions</Typography>
      <QuestionCategorySelector
        value={selectedCategory}
        onChange={setSelectedCategory}
      />
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {questionText}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: 1, borderColor: "primary.main" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Me</Typography>
                </Box>

                {questionType === "multiple_choice" && (
                  <RadioGroup value={meAnswer} onChange={(e) => setMeAnswer(e.target.value)}>
                    {payload.options.map((option, index) => (
                      <FormControlLabel key={index} value={option} control={<Radio color="primary" />} label={option} />
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
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ border: 1, borderColor: "secondary.main" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <FavoriteIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Ideal Partner</Typography>
                </Box>

                {questionType === "multiple_choice" && (
                  <RadioGroup value={idealAnswer} onChange={(e) => setIdealAnswer(e.target.value)}>
                    {payload.options.map((option, index) => (
                      <FormControlLabel key={index} value={option} control={<Radio color="secondary" />} label={option} />
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
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Grid>
    </Box>
  );
}

export default QuestionsComponent;
