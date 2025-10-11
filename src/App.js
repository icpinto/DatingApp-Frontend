import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
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
  const location = useLocation();
  const { navigation } = useTopBarNavigation();
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous);
  };

  const navbarBackground =
    theme.palette.mode === "light"
      ? alpha(theme.palette.background.paper, hasScrolled ? 0.96 : 0.9)
      : alpha(theme.palette.background.default, hasScrolled ? 0.9 : 0.84);

  const borderColor = alpha(theme.palette.divider, hasScrolled ? 0.28 : 0.16);
  const brandBackground =
    theme.palette.mode === "light"
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha(theme.palette.primary.main, 0.28);
  const brandBackgroundHover =
    theme.palette.mode === "light"
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.primary.main, 0.36);
  const brandFocusOutline = alpha(theme.palette.primary.main, 0.45);
  const outlineColor = alpha(theme.palette.text.primary, 0.18);
  const secondaryMain = theme.palette.secondary.main;
  const secondaryHover = theme.palette.secondary.dark || secondaryMain;
  const secondaryContrast = theme.palette.getContrastText
    ? theme.palette.getContrastText(secondaryMain)
    : "#ffffff";

  const navbarVariantClass = theme.palette.mode === "dark" ? "navbar-dark" : "navbar-light";

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg sticky-top py-3 app-navbar ${navbarVariantClass} ${
          hasScrolled ? "shadow-sm" : ""
        }`}
        style={{
          backgroundColor: navbarBackground,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="container-lg px-3 px-md-4">
          <button
            type="button"
            className="brand-button btn"
            onClick={() => navigate("/")}
            aria-label={t("app.name")}
            style={{
              backgroundColor: brandBackground,
              color: theme.palette.text.primary,
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 10px 30px -18px rgba(15, 23, 42, 0.4)"
                  : "0 12px 32px -20px rgba(15, 23, 42, 0.6)",
              "--brand-focus-outline": brandFocusOutline,
              "--brand-bg": brandBackground,
              "--brand-bg-hover": brandBackgroundHover,
            }}
          >
            <img
              src={logo}
              alt={t("app.alt")}
              style={{ height: 36, filter: "drop-shadow(0 4px 12px rgba(15,23,42,0.15))" }}
            />
            <span>{t("app.name")}</span>
          </button>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="app-navbar-nav"
            aria-expanded={isMenuOpen}
            aria-label={t("app.toggleNavigation", { defaultValue: "Toggle navigation" })}
            onClick={toggleMenu}
            style={{ borderColor: outlineColor }}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
            id="app-navbar-nav"
          >
            {navigation && <div className="app-topbar-navigation order-3 order-lg-2">{navigation}</div>}
            <div className="nav-auth-buttons ms-lg-auto order-2 order-lg-3">
              {hasToken ? (
                <div className="d-flex flex-column align-items-lg-end gap-2 w-100 w-lg-auto">
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                    onClick={handleSignOutClick}
                    disabled={signingOut || !canSignOut}
                    style={{
                      borderColor: outlineColor,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {signingOut ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : (
                      <LogOut size={18} strokeWidth={2.5} />
                    )}
                    <span>
                      {signingOut
                        ? t("app.signingOut", { defaultValue: "Signing out..." })
                        : t("app.signOut", { defaultValue: "Sign out" })}
                    </span>
                  </button>
                  {!canSignOut && signOutReason && (
                    <span className="nav-auth-caption" style={{ color: theme.palette.text.secondary }}>
                      {signOutReason}
                    </span>
                  )}
                </div>
              ) : (
                <div className="d-flex flex-column flex-lg-row w-100 w-lg-auto gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate("/login")}
                    style={{ borderColor: outlineColor, color: theme.palette.text.primary }}
                  >
                    <LogIn size={18} strokeWidth={2.5} />
                    <span>{t("app.signIn", { defaultValue: "Sign in" })}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate("/signup")}
                    style={{
                      background: secondaryMain,
                      borderColor: secondaryMain,
                      color: secondaryContrast,
                      "--bs-btn-bg": secondaryMain,
                      "--bs-btn-border-color": secondaryMain,
                      "--bs-btn-hover-bg": secondaryHover,
                      "--bs-btn-hover-border-color": secondaryHover,
                      "--bs-btn-active-bg": secondaryHover,
                      "--bs-btn-active-border-color": secondaryHover,
                      "--bs-btn-focus-shadow-rgb": "236, 72, 153",
                    }}
                  >
                    <UserPlus size={18} strokeWidth={2.5} />
                    <span>{t("app.joinNow", { defaultValue: "Join now" })}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
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
