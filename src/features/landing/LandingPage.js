import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LanguageIcon from "@mui/icons-material/Language";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n";

const testimonials = [
  {
    name: "Dinuka & Tharushi",
    quoteKey: "landing.testimonials.first.quote",
    locationKey: "landing.testimonials.first.location",
  },
  {
    name: "Imran",
    quoteKey: "landing.testimonials.second.quote",
    locationKey: "landing.testimonials.second.location",
  },
  {
    name: "Madhavi",
    quoteKey: "landing.testimonials.third.quote",
    locationKey: "landing.testimonials.third.location",
  },
];

function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: <FavoriteIcon fontSize="large" />,
      title: t("landing.features.matchmaking.title"),
      description: t("landing.features.matchmaking.description"),
    },
    {
      icon: <VerifiedUserIcon fontSize="large" />,
      title: t("landing.features.trust.title"),
      description: t("landing.features.trust.description"),
    },
    {
      icon: <LanguageIcon fontSize="large" />,
      title: t("landing.features.culture.title"),
      description: t("landing.features.culture.description"),
    },
    {
      icon: <EventAvailableIcon fontSize="large" />,
      title: t("landing.features.events.title"),
      description: t("landing.features.events.description"),
    },
  ];

  const stats = [
    {
      label: t("landing.stats.members"),
      value: "45K+",
    },
    {
      label: t("landing.stats.success"),
      value: "8 in 10",
    },
    {
      label: t("landing.stats.support"),
      value: "24/7",
    },
  ];

  return (
    <Box component="main" sx={{ bgcolor: theme.palette.background.default }}>
      <Box
        sx={{
          position: "relative",
          color: theme.palette.getContrastText(theme.palette.primary.main),
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 60%, ${theme.palette.background.paper} 100%)`,
          pt: { xs: 12, md: 16 },
          pb: { xs: 12, md: 18 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 60% at 50% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
            opacity: 0.9,
            pointerEvents: "none",
          }}
        />
        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <SparklesIcon sx={{ fontSize: 28 }} />
                  <Typography variant="overline" sx={{ fontWeight: 600 }}>
                    {t("landing.hero.tagline")}
                  </Typography>
                </Stack>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                  }}
                >
                  {t("landing.hero.title")}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    color: theme.palette.getContrastText(
                      theme.palette.primary.dark
                    ),
                    maxWidth: 560,
                  }}
                >
                  {t("landing.hero.subtitle")}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => navigate("/signup")}
                  >
                    {t("landing.hero.primaryCta")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="inherit"
                    onClick={() => navigate("/login")}
                    sx={{
                      borderColor: "rgba(255,255,255,0.6)",
                      color: "inherit",
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    {t("landing.hero.secondaryCta")}
                  </Button>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={4} mt={2}>
                  {stats.map((stat) => (
                    <Box key={stat.label}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card
                elevation={8}
                sx={{
                  backdropFilter: "blur(12px)",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "inherit",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {t("landing.hero.cardTitle")}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
                    {t("landing.hero.cardSubtitle")}
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>LK</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {t("landing.hero.cardHighlightTitle")}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                          {t("landing.hero.cardHighlightDescription")}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack spacing={1.5}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {t("landing.hero.cardListTitle")}
                      </Typography>
                      <Stack spacing={1} component="ul" sx={{ pl: 2, m: 0 }}>
                        <Typography component="li" variant="body2">
                          {t("landing.hero.cardList.first")}
                        </Typography>
                        <Typography component="li" variant="body2">
                          {t("landing.hero.cardList.second")}
                        </Typography>
                        <Typography component="li" variant="body2">
                          {t("landing.hero.cardList.third")}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 8, md: 12 } }}>
        <Stack spacing={{ xs: 6, md: 10 }}>
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{ textAlign: "center", fontWeight: 700, mb: 2 }}
            >
              {t("landing.features.title")}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ textAlign: "center", color: "text.secondary", maxWidth: 720, mx: "auto" }}
            >
              {t("landing.features.subtitle")}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    p: 2,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: `${theme.palette.primary.main}14`,
                        color: theme.palette.primary.main,
                        borderRadius: 3,
                        p: 1.5,
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -40,
                    left: -40,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `${theme.palette.primary.light}44`,
                    filter: "blur(24px)",
                    zIndex: -1,
                  }}
                />
                <Card elevation={4} sx={{ borderRadius: 4 }}>
                  <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                    <Typography variant="overline" sx={{ color: "text.secondary" }}>
                      {t("landing.story.overline")}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {t("landing.story.title")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {t("landing.story.paragraphOne")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {t("landing.story.paragraphTwo")}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {testimonials.map((testimonial) => (
                  <Grid item xs={12} sm={6} key={testimonial.name}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        border: `1px solid ${theme.palette.divider}`,
                        height: "100%",
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        “{t(testimonial.quoteKey)}”
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>{testimonial.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t(testimonial.locationKey)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Card
            elevation={6}
            sx={{
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 5, md: 7 } }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    {t("landing.cta.title")}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 520 }}>
                    {t("landing.cta.subtitle")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
                    <Button
                      variant="contained"
                      size="large"
                      color="inherit"
                      onClick={() => navigate("/signup")}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      {t("landing.cta.primary")}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      color="inherit"
                      onClick={() => navigate("/login")}
                      sx={{
                        borderColor: "rgba(255,255,255,0.7)",
                        color: "inherit",
                        "&:hover": {
                          borderColor: "white",
                          backgroundColor: "rgba(255,255,255,0.15)",
                        },
                      }}
                    >
                      {t("landing.cta.secondary")}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export default LandingPage;
