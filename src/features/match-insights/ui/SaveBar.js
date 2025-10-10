import React from "react";
import { Button, Stack } from "@mui/material";

function SaveBar({ onSave, saving, canSave, hasSaved }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="flex-end"
    >
      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        disabled={saving || !canSave}
      >
        {saving ? "Saving..." : hasSaved ? "Update" : "Save"}
      </Button>
    </Stack>
  );
}

export default SaveBar;
