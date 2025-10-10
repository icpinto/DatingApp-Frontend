import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";

function StaticPageLayout({ title, description, sections, children }) {
  return (
    <Box
      component="main"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={5}>
          <Stack spacing={2}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {description ? (
              <Typography variant="subtitle1" color="text.secondary">
                {description}
              </Typography>
            ) : null}
          </Stack>
          {children}
          {sections?.map((section) => (
            <Stack key={section.heading} spacing={1.5}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {section.heading}
              </Typography>
              {section.content?.map((paragraph, index) => (
                <Typography
                  key={`${section.heading}-${index}`}
                  variant="body1"
                  color="text.secondary"
                >
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

export default StaticPageLayout;
