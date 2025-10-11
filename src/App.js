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
import { alpha, styled, useTheme } from "@mui/material/styles";
import { useScroll, useMotionValueEvent } from "framer-motion";
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
import { LogIn, LogOut, UserPlus } from "lucide-react";

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "elevated",
})(({ theme, elevated }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? alpha(theme.palette.background.paper, elevated ? 0.96 : 0.9)
      : alpha(theme.palette.background.default, elevated ? 0.9 : 0.84),
  backdropFilter: "blur(16px)",
  borderBottom: `1px solid ${alpha(theme.palette.divider, elevated ? 0.28 : 0.16)}`,
  boxShadow: elevated ? theme.shadows[3] : "none",
  transition: theme.transitions.create(
    ["background-color", "box-shadow", "border-color"],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeOut,
    }
  ),
}));

const BrandButton = styled("button")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
  padding: theme.spacing(0.75, 1.5),
  borderRadius: theme.shape.borderRadius * 3,
  border: "none",
  backgroundColor:
    theme.palette.mode === "light"
      ? alpha(theme.palette.primary.main, 0.08)
      : alpha(theme.palette.primary.main, 0.2),
  color: theme.palette.text.primary,
  cursor: "pointer",
  transition: theme.transitions.create(["background-color", "box-shadow"], {
    duration: theme.transitions.duration.shorter,
    easing: theme.transitions.easing.easeOut,
  }),
  boxShadow:
    theme.palette.mode === "light"
      ? "0 10px 30px -18px rgba(15, 23, 42, 0.4)"
      : "0 12px 32px -20px rgba(15, 23, 42, 0.6)",
  textDecoration: "none",
  font: "inherit",
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  flexShrink: 0,
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha(theme.palette.primary.main, 0.16)
        : alpha(theme.palette.primary.main, 0.3),
  },
  "&:focus-visible": {
    outline: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
    outlineOffset: 2,
  },
}));

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
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setHasScrolled(latest > 12);
  });

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
    if (typeof window !== "undefined") {
      setHasScrolled(window.scrollY > 12);
    }
  }, []);

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
    <>
      <StyledAppBar position="sticky" color="transparent" elevation={0} elevated={hasScrolled}>
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
          <Toolbar
            disableGutters
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
              minHeight: { xs: 72, md: 88 },
              py: { xs: 1.5, md: 2 },
            }}
          >
            <BrandButton type="button" onClick={() => navigate("/")} aria-label={t("app.name")}>
              <Box
                component="img"
                src={logo}
                alt={t("app.alt")}
                sx={{ height: 36, filter: "drop-shadow(0 4px 12px rgba(15,23,42,0.15))" }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}
              >
                {t("app.name")}
              </Typography>
            </BrandButton>
            {isDesktop && navigation && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                  px: { md: 3 },
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
                ml: "auto",
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
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={handleSignOutClick}
                    disabled={signingOut || !canSignOut}
                    startIcon={
                      signingOut ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <LogOut size={18} strokeWidth={2.5} />
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
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    {signingOut
                      ? t("app.signingOut", { defaultValue: "Signing out..." })
                      : t("app.signOut", { defaultValue: "Sign out" })}
                  </Button>
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
                  <Button
                    color="inherit"
                    onClick={() => navigate("/login")}
                    sx={{
                      fontWeight: 600,
                      px: 1.5,
                      textTransform: "none",
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                      color: theme.palette.text.primary,
                    }}
                    startIcon={<LogIn size={18} strokeWidth={2.5} />}
                  >
                    {t("app.signIn", { defaultValue: "Sign in" })}
                  </Button>
                  <Button
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
                    }}
                    startIcon={<UserPlus size={18} strokeWidth={2.5} />}
                  >
                    {t("app.joinNow", { defaultValue: "Join now" })}
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
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
    </>
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
