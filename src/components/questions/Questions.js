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
} from "@mui/material";
import chatService from "../../services/chatService";

function QuestionsComponent() {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("user_id") || "";

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await chatService.get(`/chat/next/${userId}`);
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
  }, []);

  const submitAnswer = async () => {
    if (!question) return;
    try {
      await chatService.post("/chat/answer", {
        user_id: userId,
        question_instance_id: question.question_instance_id,
        message: answer,
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  const handleNext = async () => {
    await submitAnswer();
    setAnswer("");
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
      <Box>
        <Typography variant="h6">{questionText}</Typography>

        {questionType === "multiple_choice" && (
          <RadioGroup value={answer} onChange={(e) => setAnswer(e.target.value)}>
            {payload.options.map((option, index) => (
              <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        )}

        {questionType === "scale" && (
          <Slider
            value={typeof answer === "number" ? answer : 5}
            onChange={(e, newValue) => setAnswer(newValue)}
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
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
          />
        )}
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
