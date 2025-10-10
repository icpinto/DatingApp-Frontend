import React from "react";
import { Grid, Slider, Stack, TextField, Typography } from "@mui/material";

function PreferenceSliders({
  preferences,
  ageRange,
  heightRange,
  onAgeSliderChange,
  onAgeInputChange,
  onHeightSliderChange,
  onHeightInputChange,
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">Preferred Age Range</Typography>
      <Slider
        value={[preferences.minAge, preferences.maxAge]}
        onChange={(_, value) => onAgeSliderChange(value)}
        onChangeCommitted={(_, value) => onAgeSliderChange(value)}
        min={ageRange.min}
        max={ageRange.max}
        valueLabelDisplay="auto"
        disableSwap
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Min age"
            type="number"
            value={preferences.minAge}
            onChange={(event) => onAgeInputChange("minAge", event.target.value)}
            fullWidth
            inputProps={{ min: ageRange.min, max: ageRange.max }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Max age"
            type="number"
            value={preferences.maxAge}
            onChange={(event) => onAgeInputChange("maxAge", event.target.value)}
            fullWidth
            inputProps={{ min: ageRange.min, max: ageRange.max }}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1">Preferred Height Range (cm)</Typography>
      <Slider
        value={[preferences.minHeight, preferences.maxHeight]}
        onChange={(_, value) => onHeightSliderChange(value)}
        onChangeCommitted={(_, value) => onHeightSliderChange(value)}
        min={heightRange.min}
        max={heightRange.max}
        valueLabelDisplay="auto"
        disableSwap
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Min height"
            type="number"
            value={preferences.minHeight}
            onChange={(event) =>
              onHeightInputChange("minHeight", event.target.value)
            }
            fullWidth
            inputProps={{ min: heightRange.min, max: heightRange.max }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Max height"
            type="number"
            value={preferences.maxHeight}
            onChange={(event) =>
              onHeightInputChange("maxHeight", event.target.value)
            }
            fullWidth
            inputProps={{ min: heightRange.min, max: heightRange.max }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export default PreferenceSliders;
