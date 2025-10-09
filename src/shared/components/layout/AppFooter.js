import React from "react";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useLegalContent from "./useLegalContent";

function AppFooter() {
  const { tagline, links, copyright } = useLegalContent();

  return (
    <Box
      component="footer"
      sx={{
        display: { xs: "none", md: "block" },
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        mt: { xs: 6, md: 10 },
        py: { xs: 4, md: 6 },
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[50]
            : theme.palette.background.paper,
      }}
    >
      <Container>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            {tagline}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {links.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                color="inherit"
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {copyright}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default AppFooter;
