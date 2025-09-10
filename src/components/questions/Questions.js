import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, RadioGroup, FormControlLabel, Radio, Slider, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function QuestionsComponent() {
  const navigate = useNavigate();
  const hasPaid = localStorage.getItem("hasPaid") === "true";
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasPaid) {
      setLoading(false);
      return;
    }

    const fetchQuestionsAndAnswers = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch questions
        const questionsResponse = await api.get("/user/questionnaire", {
          headers: { Authorization: `${token}` },
        });

        const fetchedQuestions = questionsResponse.data.questions;

        // Fetch user's previous answers
        const answersResponse = await api.get("/user/questionnaireAnswers", {
          headers: { Authorization: `${token}` },
        });

        const previousAnswers = answersResponse.data.answers || [];

        // Map previous answers into a format we can use
        const answersMap = {};
        previousAnswers.forEach((answer) => {
          answersMap[answer.question_id] =
            answer.answer_text !== null ? answer.answer_text : answer.answer_value;
        });

        setQuestions(fetchedQuestions);
        setAnswers(answersMap);
      } catch (error) {
        console.error("Error fetching questions or answers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndAnswers();
  }, [hasPaid]);

  if (!hasPaid) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Typography variant="h5" gutterBottom>Questions</Typography>
        <Typography sx={{ mb: 2 }}>Please complete payment to access the questionnaire.</Typography>
        <Button variant="contained" onClick={() => navigate("/payment")}>
          Go to Payment
        </Button>
      </Box>
    );
  }

  if (loading) return <Typography>Loading questions...</Typography>;
  if (questions.length === 0) return <Typography>No questions available.</Typography>;

  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer change based on question type
  const handleAnswerChange = (event, newValue) => {
    const value = event.target ? event.target.value : newValue;
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion.ID]: value,
    }));
  };

  // Submit the answer to the backend
  const submitAnswer = async () => {
    const answerData = {
      question_id: currentQuestion.ID,
      answer_text: currentQuestion.QuestionType === "multiple_choice" || currentQuestion.QuestionType === "open_text"
        ? answers[currentQuestion.ID] || null
        : null,
      answer_value: currentQuestion.QuestionType === "scale"
        ? answers[currentQuestion.ID] || null
        : null,
    };

    try {
      await api.post("/user/submitQuestionnaire", answerData, {
        headers: { Authorization: `${localStorage.getItem("token")}` },
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // Handle question navigation
  const handleNext = async () => {
    if (answers[currentQuestion.ID] !== undefined) await submitAnswer(); // Submit only if there's an answer
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
        {currentQuestion.QuestionType === "multiple_choice" && (
          <RadioGroup
            name={`question-${currentQuestion.ID}`}
            value={answers[currentQuestion.ID] || ""}
            onChange={handleAnswerChange}
          >
            {currentQuestion.Options.map((option, index) => (
              <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        )}

        {currentQuestion.QuestionType === "scale" && (
          <Slider
            value={answers[currentQuestion.ID] || 5}
            onChange={(e, newValue) => handleAnswerChange(e, newValue)}
            step={1}
            marks
            min={1}
            max={10}
            valueLabelDisplay="auto"
          />
        )}

        {currentQuestion.QuestionType === "open_text" && (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answers[currentQuestion.ID] || ""}
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
