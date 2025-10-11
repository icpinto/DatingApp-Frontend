import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  CircularProgress,
  Container,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import Signup from "./features/auth/Signup";
import Login from "./features/auth/Login";
import LandingPage from "./features/landing/LandingPage";
import MainTabs from "./shared/components/tabs/MainTabs";
import { ProfilePage } from "./features/home";
import Matches from "./features/matches/pages/Matches.page";
import CapabilityRoute from "./shared/components/routing/CapabilityRoute";
import { WebSocketProvider } from "./shared/context/WebSocketProvider";
import AppAccessBoundary from "./shared/components/AppAccessBoundary";
import {
  AccountLifecycleProvider,
  useAccountLifecycle,
} from "./shared/context/AccountLifecycleContext";
import { UserProvider } from "./shared/context/UserContext";
import logo from "./logo.svg";
import { useTranslation } from "./i18n";
import { CAPABILITIES } from "./domain/capabilities";
import AppFooter from "./shared/components/layout/AppFooter";
import {
  TopBarNavigationProvider,
  useTopBarNavigation,
} from "./shared/context/TopBarNavigationContext";
import { useSignOut } from "./shared/hooks/useSignOut";
const AnimatedAppBar = AppBar;
const AnimatedBox = Box;
const AnimatedButton = Button;

const MessagesPage = lazy(() => import("./features/messages"));
const PaymentPage = lazy(() => import("./features/premium/Payment"));
const PrivacyPolicyPage = lazy(() => import("./features/profile/pages/PrivacyPolicy.page"));
const TermsOfServicePage = lazy(() => import("./features/profile/pages/TermsOfService.page"));
const PricingPage = lazy(() => import("./features/profile/pages/Pricing.page"));
const HelpCenterPage = lazy(() => import("./features/profile/pages/HelpCenter.page"));

const RouteLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
    <CircularProgress size={32} thickness={5} />
  </Box>
);

function AppLayout() {
  const location = useLocation();
  const showFooter = location.pathname === "/";

  return (
    <div className="App">
      <TopBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home"
          element={
            <CapabilityRoute capability={CAPABILITIES.NAV_ACCESS_HOME}>
              <MainTabs />
            </CapabilityRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <CapabilityRoute capability={CAPABILITIES.PROFILE_VIEW_MEMBER}>
              <ProfilePage />
            </CapabilityRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <CapabilityRoute capability={CAPABILITIES.REQUESTS_VIEW_RECEIVED}>
              <Matches />
            </CapabilityRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <CapabilityRoute capability={CAPABILITIES.MESSAGING_VIEW_INBOX}>
              <Suspense fallback={<RouteLoader />}>
                <MessagesPage />
              </Suspense>
            </CapabilityRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <CapabilityRoute capability={CAPABILITIES.BILLING_VIEW_PAYMENT}>
              <Suspense fallback={<RouteLoader />}>
                <PaymentPage />
              </Suspense>
            </CapabilityRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<RouteLoader />}>
              <PrivacyPolicyPage />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<RouteLoader />}>
              <TermsOfServicePage />
            </Suspense>
          }
        />
        <Route
          path="/pricing"
          element={
            <Suspense fallback={<RouteLoader />}>
              <PricingPage />
            </Suspense>
          }
        />
        <Route
          path="/help"
          element={
            <Suspense fallback={<RouteLoader />}>
              <HelpCenterPage />
            </Suspense>
          }
        />
      </Routes>
      {showFooter && <AppFooter />}
    </div>
  );
}

function TopBar() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigation } = useTopBarNavigation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [hasToken, setHasToken] = useState(() =>
    Boolean(typeof window !== "undefined" && localStorage.getItem("token"))
  );
  const { signOut, signingOut, canSignOut, signOutReason } = useSignOut();
  const [signOutFeedback, setSignOutFeedback] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateTokenState = (event) => {
      if (event?.detail && Object.prototype.hasOwnProperty.call(event.detail, "token")) {
        setHasToken(Boolean(event.detail.token));
      } else {
        setHasToken(Boolean(localStorage.getItem("token")));
      }
    };

    window.addEventListener("auth-token-changed", updateTokenState);

    return () => {
      window.removeEventListener("auth-token-changed", updateTokenState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateScrollState = () => {
      setHasScrolled(window.scrollY > 12);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  const glassBackground =
    theme.palette.mode === "light"
      ? alpha(theme.palette.background.paper, hasScrolled ? 0.85 : 0.55)
      : alpha(theme.palette.background.default, hasScrolled ? 0.75 : 0.45);
  const glassBorder = alpha(theme.palette.divider, hasScrolled ? 0.2 : 0.08);
  const glassShadow = hasScrolled
    ? theme.palette.mode === "light"
      ? "0 18px 38px -24px rgba(15, 23, 42, 0.45)"
      : "0 22px 48px -30px rgba(15, 23, 42, 0.75)"
    : "none";

  const handleSignOutClick = async () => {
    const result = await signOut();

    if (!result) {
      return;
    }

    if (result.status === "blocked") {
      setSignOutFeedback({
        open: true,
        severity: "info",
        message:
          signOutReason ||
          t("app.signOutUnavailable", {
            defaultValue: "Signing out is currently unavailable.",
          }),
      });
      return;
    }

    if (result.status === "warning") {
      setSignOutFeedback({
        open: true,
        severity: "warning",
        message: t("app.signOutError", {
          defaultValue:
            "We couldn't reach the server, but your local session was cleared.",
        }),
      });
    } else {
      setSignOutFeedback({
        open: true,
        severity: "success",
        message: t("app.signOutSuccess", {
          defaultValue: "Signed out successfully.",
        }),
      });
    }

    setHasToken(false);
    navigate("/");
  };

  const handleCloseSignOutFeedback = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSignOutFeedback((previous) => ({ ...previous, open: false }));
  };

    return (
      <AnimatedAppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: hasScrolled ? "blur(18px)" : "blur(0px)",
          backgroundColor: glassBackground,
          borderBottom: `1px solid ${glassBorder}`,
          boxShadow: glassShadow,
          transition: theme.transitions.create(
            [
              "backdrop-filter",
              "background-color",
              "box-shadow",
              "border-color",
              "opacity",
            ],
            {
              duration: theme.transitions.duration.shorter,
              easing: theme.transitions.easing.easeOut,
            }
          ),
        }}
      >
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          <Toolbar
            sx={{
              gap: { xs: 1, md: 2 },
              flexWrap: { xs: "wrap", md: "nowrap" },
              alignItems: "center",
              minHeight: { md: 88 },
              py: { xs: 1.5, md: 2 },
            }}
          >
            <AnimatedBox
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                flexShrink: 0,
                px: 1,
                py: 0.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                cursor: "pointer",
                transform: "scale(1)",
                transition: theme.transitions.create("transform", {
                  duration: theme.transitions.duration.shorter,
                  easing: theme.transitions.easing.easeOut,
                }),
                "&:hover": {
                  transform: "scale(1.02)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
              onClick={() => navigate("/")}
              role="button"
              aria-label={t("app.name")}
            >
              <AnimatedBox
                component="img"
                src={logo}
                alt={t("app.alt")}
                sx={{
                  height: 36,
                  filter: "drop-shadow(0 4px 12px rgba(15,23,42,0.15))",
                  transition: theme.transitions.create("transform", {
                    duration: theme.transitions.duration.standard,
                    easing: theme.transitions.easing.easeOut,
                  }),
                  "&:hover": {
                    transform: "rotate(-2deg)",
                  },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                  color: theme.palette.text.primary,
                }}
              >
                {t("app.name")}
              </Typography>
            </AnimatedBox>
            {isDesktop && navigation && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                  px: { xs: 1, md: 3 },
                }}
              >
                {navigation}
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, md: 1.5 },
                ml: { xs: "auto", md: navigation ? 0 : "auto" },
              }}
            >
              {hasToken ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 0.5,
                    minWidth: 0,
                  }}
                >
                  <AnimatedButton
                    color="inherit"
                    variant="outlined"
                    onClick={handleSignOutClick}
                    disabled={signingOut || !canSignOut}
                    startIcon={
                      signingOut ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <LogoutRoundedIcon fontSize="small" />
                      )
                    }
                    sx={{
                      fontWeight: 600,
                      px: { xs: 1.5, md: 2 },
                      textTransform: "none",
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                      backgroundColor: "transparent",
                      color: theme.palette.text.primary,
                      transform: "scale(1)",
                      transition: theme.transitions.create(
                        ["background-color", "transform"],
                        {
                          duration: theme.transitions.duration.shorter,
                          easing: theme.transitions.easing.easeOut,
                        }
                      ),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        transform:
                          canSignOut && !signingOut ? "scale(1.03)" : "scale(1)",
                      },
                      "&:active": {
                        transform:
                          canSignOut && !signingOut ? "scale(0.97)" : "scale(1)",
                      },
                    }}
                  >
                    {signingOut
                      ? t("app.signingOut", { defaultValue: "Signing out..." })
                      : t("app.signOut", { defaultValue: "Sign out" })}
                  </AnimatedButton>
                  {!canSignOut && signOutReason && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textAlign: "right", maxWidth: 240 }}
                    >
                      {signOutReason}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
                  <AnimatedButton
                    color="inherit"
                    onClick={() => navigate("/login")}
                    sx={{
                      fontWeight: 600,
                      px: 1.5,
                      textTransform: "none",
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                      color: theme.palette.text.primary,
                      transform: "scale(1)",
                      transition: theme.transitions.create(
                        ["background-color", "transform"],
                        {
                          duration: theme.transitions.duration.shorter,
                          easing: theme.transitions.easing.easeOut,
                        }
                      ),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: "scale(1.03)",
                      },
                      "&:active": {
                        transform: "scale(0.97)",
                      },
                    }}
                    startIcon={<LoginRoundedIcon fontSize="small" />}
                  >
                    {t("app.signIn", { defaultValue: "Sign in" })}
                  </AnimatedButton>
                  <AnimatedButton
                    color="secondary"
                    variant="contained"
                    onClick={() => navigate("/signup")}
                    sx={{
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                      borderRadius: 2.5,
                      px: { xs: 2, md: 2.75 },
                      py: 1,
                      boxShadow: "0 10px 30px -12px rgba(236, 72, 153, 0.8)",
                      transform: "scale(1)",
                      transition: theme.transitions.create(
                        ["box-shadow", "transform"],
                        {
                          duration: theme.transitions.duration.shorter,
                          easing: theme.transitions.easing.easeOut,
                        }
                      ),
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 16px 40px -16px rgba(236, 72, 153, 0.9)",
                      },
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                    }}
                    startIcon={<PersonAddAltRoundedIcon fontSize="small" />}
                  >
                    {t("app.joinNow", { defaultValue: "Join now" })}
                  </AnimatedButton>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
        <Snackbar
          open={signOutFeedback.open && Boolean(signOutFeedback.message)}
          autoHideDuration={6000}
          onClose={handleCloseSignOutFeedback}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSignOutFeedback}
            severity={signOutFeedback.severity}
            sx={{ width: "100%" }}
          >
            {signOutFeedback.message}
          </Alert>
        </Snackbar>
      </AnimatedAppBar>
    );
  }

function AppShell() {
  return (
    <WebSocketProvider>
      <AppAccessBoundary>
        <Router>
          <TopBarNavigationProvider>
            <AppLayout />
          </TopBarNavigationProvider>
        </Router>
      </AppAccessBoundary>
    </WebSocketProvider>
  );
}

function AccountAwareUserProvider({ children }) {
  const accountLifecycle = useAccountLifecycle();

  return (
    <UserProvider accountStatus={accountLifecycle?.status}>
      {children}
    </UserProvider>
  );
}

function App() {
  return (
    <AccountLifecycleProvider>
      <AccountAwareUserProvider>
        <AppShell />
      </AccountAwareUserProvider>
    </AccountLifecycleProvider>
  );
}

export default App;
