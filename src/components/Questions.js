import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, RadioGroup, FormControlLabel, Radio, Slider, Grid } from "@mui/material";
import axios from "axios";

function QuestionsComponent() {
  const [questions, setQuestions] = useState([]); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  const [answers, setAnswers] = useState({}); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/user/questionnaire", {
            headers: {
              Authorization: `${token}`,
            },
          });
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) return <Typography>Loading questions...</Typography>;
  if (questions.length === 0) return <Typography>No questions available.</Typography>;

  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer change based on question type
  const handleAnswerChange = (event, newValue) => {
    const value = event.target ? event.target.value : newValue;
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion.id]: value,
    }));
  };

  // Have to change
  const submitAnswer = async () => {
    const answerData = {
      question_id: currentQuestion.id,
      answer: answers[currentQuestion.id],
    };
    try {
      await axios.post("http://localhost:8080/api/answers", answerData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // Handle question navigation
  const handleNext = async () => {
    if (answers[currentQuestion.id]) await submitAnswer(); // Submit answer if one exists
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((index) => index + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((index) => index - 1);
  };

  return (
    <Box sx={{ mt: 4, p: 2, borderTop: "1px solid #ccc" }}>
      <Typography variant="h5" gutterBottom>Questions</Typography>
      <Box>
        <Typography variant="h6">{currentQuestion.QuestionText}</Typography>
        
        {/* Render input based on question type */}
        {currentQuestion.question_type === "multiple_choice" && (
          <RadioGroup
            name={`question-${currentQuestion.id}`}
            value={answers[currentQuestion.id] || ""}
            onChange={handleAnswerChange}
          >
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        )}

        {currentQuestion.question_type === "scale" && (
          <Slider
            value={answers[currentQuestion.id] || 5}
            onChange={(e, newValue) => handleAnswerChange(e, newValue)}
            step={1}
            marks
            min={1}
            max={10}
            valueLabelDisplay="auto"
          />
        )}

        {currentQuestion.question_type === "open_text" && (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answers[currentQuestion.id] || ""}
            onChange={handleAnswerChange}
            placeholder="Type your answer..."
          />
        )}
      </Box>

      {/* Navigation buttons */}
      <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
        </Button>
      </Grid>
    </Box>
  );
}

export default QuestionsComponent;
