import { useCallback, useMemo, useState } from "react";
import { FILTER_DEFAULTS } from "@/features/home/model/constants";

function buildFilterParams(filters) {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (key === "age") {
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue) && numericValue > 0) {
        params[key] = numericValue;
      }
      return;
    }

    params[key] = value;
  });

  return params;
}

export function useDiscoveryFilters({
  canUseFilters,
  canToggleFilterPanel,
  onApplyFilters,
}) {
  const [filters, setFilters] = useState(() => ({ ...FILTER_DEFAULTS }));
  const [showFilters, setShowFilters] = useState(false);

  const filterPanelOpen = useMemo(() => {
    return showFilters && canToggleFilterPanel && canUseFilters;
  }, [canToggleFilterPanel, canUseFilters, showFilters]);

  const handleFilterChange = useCallback(
    (event) => {
      if (!canUseFilters) {
        return;
      }

      const { name, value } = event.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [canUseFilters]
  );

  const handleApplyFilters = useCallback(() => {
    if (!canUseFilters) {
      return;
    }

    if (onApplyFilters) {
      onApplyFilters(buildFilterParams(filters));
    }
  }, [canUseFilters, filters, onApplyFilters]);

  const handleClearFilters = useCallback(() => {
    if (!canUseFilters) {
      return;
    }

    setFilters({ ...FILTER_DEFAULTS });
    if (onApplyFilters) {
      onApplyFilters();
    }
  }, [canUseFilters, onApplyFilters]);

  return {
    filters,
    showFilters,
    setShowFilters,
    filterPanelOpen,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
  };
}
