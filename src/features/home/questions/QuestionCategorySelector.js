import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import questionnaireService from "../../../shared/services/questionnaireService";
import Guard from "./Guard";
import { useUserCapabilities } from "../../../shared/context/UserContext";
import { CAPABILITIES } from "../../../domain/capabilities";

function QuestionCategorySelector({ value, onChange, disabled = false }) {
  const [categories, setCategories] = useState([]);
  const { groups } = useUserCapabilities();
  const selectCapability = groups.insights.selectCategory;
  const canSelectCategory = selectCapability.can;

  useEffect(() => {
    if (disabled || !canSelectCategory) {
      setCategories([]);
      return;
    }

    let isSubscribed = true;

    const fetchCategories = async () => {
      try {
        const res = await questionnaireService.get("/questions/categories");
        if (isSubscribed) {
          setCategories(res.data?.categories || []);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error fetching categories:", err);
        }
      }
    };

    fetchCategories();

    return () => {
      isSubscribed = false;
    };
  }, [disabled, canSelectCategory]);

  const capabilityReason = selectCapability.reason;

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
