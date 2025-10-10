import React from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import {
  DRINKING_OPTIONS,
  EDUCATION_OPTIONS,
  SMOKING_OPTIONS,
  GENDER_OPTIONS,
  OCCUPATION_STATUS_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  FOOD_PREFERENCE_OPTIONS,
} from "../model/types";

const fieldConfigs = [
  { key: "gender", label: "Preferred gender", options: GENDER_OPTIONS },
  {
    key: "educationLevel",
    label: "Partner's education level",
    options: EDUCATION_OPTIONS,
  },
  {
    key: "drinkingHabit",
    label: "Partner's drinking habits",
    options: DRINKING_OPTIONS,
  },
  {
    key: "smokingHabit",
    label: "Partner's smoking habits",
    options: SMOKING_OPTIONS,
  },
  {
    key: "countryOfResidence",
    label: "Country of residence",
    options: [],
    isText: true,
  },
  {
    key: "occupationStatus",
    label: "Occupation status",
    options: OCCUPATION_STATUS_OPTIONS,
  },
  { key: "civilStatus", label: "Civil status", options: CIVIL_STATUS_OPTIONS },
  { key: "religion", label: "Religion", options: RELIGION_OPTIONS },
  {
    key: "foodPreference",
    label: "Food preference",
    options: FOOD_PREFERENCE_OPTIONS,
  },
];

function SelectFields({ preferences, onChange }) {
  return fieldConfigs.map(({ key, label, options, isText }) => (
    <Box key={key}>
      <TextField
        select={!isText}
        fullWidth
        label={label}
        value={preferences[key] ?? ""}
        onChange={(event) => onChange(key, event.target.value)}
      >
        {!isText &&
          options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
      </TextField>
    </Box>
  ));
}

export default SelectFields;
