import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import questionnaireService from "../../services/questionnaireService";

function QuestionCategorySelector({ value, onChange, disabled = false }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await questionnaireService.get("/questions/categories");
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <FormControl sx={{ minWidth: 200, mb: 2 }} disabled={disabled}>
      <InputLabel id="question-category-label">Category</InputLabel>
      <Select
        labelId="question-category-label"
        value={value}
        label="Category"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <MenuItem value="All">All</MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default QuestionCategorySelector;
