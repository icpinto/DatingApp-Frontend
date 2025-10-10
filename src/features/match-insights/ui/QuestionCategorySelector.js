import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import Guard from "shared/components/Guard";
import { useUserCapabilities } from "shared/context/UserContext";
import { CAPABILITIES } from "domain/capabilities";
import { useQuestionnaire } from "../hooks/useMatchInsights";

function QuestionCategorySelector({ value, onChange, disabled = false }) {
  const [categories, setCategories] = useState([]);
  const { getQuestionnaireCategories } = useQuestionnaire();
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
        const loadedCategories = await getQuestionnaireCategories();
        if (isSubscribed) {
          setCategories(loadedCategories);
        }
      } catch (error) {
        if (isSubscribed) {
          console.error("Error fetching categories:", error);
        }
      }
    };

    fetchCategories();

    return () => {
      isSubscribed = false;
    };
  }, [disabled, canSelectCategory, getQuestionnaireCategories]);

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
                onChange={(event) => onChange(event.target.value)}
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
