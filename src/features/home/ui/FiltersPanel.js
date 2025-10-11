import React from "react";
import {
  Box,
  Button,
  Collapse,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { spacing } from "../../../styles";

const FiltersPanel = ({
  filters,
  filterFields,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onToggleFilters,
  loadingUsers,
  canUseFilters,
  canToggleFilterPanel,
  filterPanelOpen,
  showFilters,
  t,
}) => {
  if (!canUseFilters) {
    return null;
  }

  return (
    <Box sx={{ mb: spacing.section }}>
      <Stack spacing={spacing.section}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t("home.headers.filterTitle")}
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              if (!canToggleFilterPanel) {
                return;
              }
              onToggleFilters((prev) => !prev);
            }}
            disabled={!canToggleFilterPanel}
          >
            {showFilters ? t("home.filters.hide") : t("home.filters.show")}
          </Button>
        </Stack>
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
      </Stack>
    </Box>
  );
};

export default FiltersPanel;
