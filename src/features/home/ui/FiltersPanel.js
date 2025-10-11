import React from "react";
import { Button, Collapse, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";

import { spacing } from "../../../styles";

const FiltersPanel = ({
  filters,
  filterFields,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  loadingUsers,
  canUseFilters,
  filterPanelOpen,
  t,
}) => {
  if (!canUseFilters) {
    return null;
  }

  return (
    <Stack spacing={spacing.section}>
      <Collapse in={filterPanelOpen} timeout="auto" unmountOnExit>
        <Stack spacing={spacing.section}>
          <Grid container spacing={2}>
            {filterFields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field.name}>
                <TextField
                  fullWidth
                  size="small"
                  label={t(field.labelKey)}
                  name={field.name}
                  value={filters[field.name]}
                  onChange={onFilterChange}
                  disabled={!canUseFilters}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label={t("home.filters.age")}
                name="age"
                type="number"
                value={filters.age}
                onChange={onFilterChange}
                inputProps={{ min: 0 }}
                disabled={!canUseFilters}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("home.filters.horoscope")}
                name="horoscope_available"
                value={filters.horoscope_available}
                onChange={onFilterChange}
                disabled={!canUseFilters}
              >
                <MenuItem value="">{t("home.filters.any")}</MenuItem>
                <MenuItem value="true">{t("home.filters.yes")}</MenuItem>
                <MenuItem value="false">{t("home.filters.no")}</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            spacing={2}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={onClearFilters}
              disabled={loadingUsers || !canUseFilters}
            >
              {t("common.actions.clearFilters")}
            </Button>
            <Button
              variant="contained"
              onClick={onApplyFilters}
              disabled={loadingUsers || !canUseFilters}
            >
              {t("common.actions.applyFilters")}
            </Button>
          </Stack>
        </Stack>
      </Collapse>
      {!filterPanelOpen && (
        <Typography variant="body2" color="text.secondary">
          {t("home.filters.helperText", {
            defaultValue: "Use filters to fine-tune your match recommendations.",
          })}
        </Typography>
      )}
    </Stack>
  );
};

export default FiltersPanel;
