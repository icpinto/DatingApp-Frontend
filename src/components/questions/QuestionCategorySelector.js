import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import questionnaireService from "../../services/questionnaireService";
import Guard from "./Guard";
import { useUserContext } from "../../context/UserContext";
import { CAPABILITIES } from "../../utils/capabilities";

function QuestionCategorySelector({ value, onChange, disabled = false }) {
  const [categories, setCategories] = useState([]);
  const { getReason } = useUserContext();

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

  const capabilityReason = getReason(CAPABILITIES.INSIGHTS_SELECT_CATEGORY);

  return (
    <Guard can={CAPABILITIES.INSIGHTS_SELECT_CATEGORY}>
      {({ isAllowed }) => {
        const isDisabled = disabled || !isAllowed;

        return (
          <>
            <FormControl sx={{ minWidth: 200, mb: 2 }} disabled={isDisabled}>
              <InputLabel id="question-category-label">Category</InputLabel>
              <Select
                labelId="question-category-label"
                value={value}
                label="Category"
                onChange={(e) => onChange(e.target.value)}
                disabled={isDisabled}
              >
                <MenuItem value="All">All</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!isAllowed && capabilityReason && (
              <Typography variant="caption" color="text.secondary">
                {capabilityReason}
              </Typography>
            )}
          </>
        );
      }}
    </Guard>
  );
}

export default QuestionCategorySelector;
