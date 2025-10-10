import React, { Suspense, lazy, useContext, useEffect, useState } from "react";
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
  IconButton,
  Box,
  Button,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Signup from "./features/auth/Signup";
import Login from "./features/auth/Login";
import LandingPage from "./features/landing/LandingPage";
import MainTabs from "./shared/components/tabs/MainTabs";
import Profile from "./features/home/profile/Profile";
import Requests from "./features/requests/Requests";
import CapabilityRoute from "./shared/components/routing/CapabilityRoute";
import { WebSocketProvider } from "./shared/context/WebSocketProvider";
import AppAccessBoundary from "./shared/components/AppAccessBoundary";
import {
  AccountLifecycleProvider,
  useAccountLifecycle,
} from "./shared/context/AccountLifecycleContext";
import { ColorModeContext } from "./shared/context/ThemeContext";
import { UserProvider } from "./shared/context/UserContext";
import logo from "./logo.svg";
import { useTranslation } from "./i18n";
import { CAPABILITIES } from "./domain/capabilities";
import AppFooter from "./shared/components/layout/AppFooter";
import {
  TopBarNavigationProvider,
  useTopBarNavigation,
} from "./shared/context/TopBarNavigationContext";

const MessagesPage = lazy(() => import("./features/messages/Messages"));
const PaymentPage = lazy(() => import("./features/premium/Payment"));
const PrivacyPolicyPage = lazy(() => import("./features/profile/static/PrivacyPolicy"));
const TermsOfServicePage = lazy(() => import("./features/profile/static/TermsOfService"));
const PricingPage = lazy(() => import("./features/profile/static/Pricing"));
const HelpCenterPage = lazy(() => import("./features/profile/static/HelpCenter"));

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
              <Profile />
            </CapabilityRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <CapabilityRoute capability={CAPABILITIES.REQUESTS_VIEW_RECEIVED}>
              <Requests />
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
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigation } = useTopBarNavigation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [hasToken, setHasToken] = useState(() =>
    Boolean(typeof window !== "undefined" && localStorage.getItem("token"))
  );

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

  return (
    <>
      <AppBar
        position="static"
        color="primary"
        enableColorOnDark
        elevation={theme.palette.mode === "light" ? 2 : 4}
      >
        <Toolbar
          sx={{
            gap: { xs: 1, md: 2 },
            flexWrap: { xs: "wrap", md: "nowrap" },
            alignItems: "center",
            minHeight: { md: 96 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt={t("app.alt")}
              sx={{ height: 40 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("app.name")}
            </Typography>
          </Box>
          {isDesktop && navigation && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                px: 2,
              }}
            >
              {navigation}
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              ml: { xs: "auto", md: navigation ? 0 : "auto" },
            }}
          >
            <IconButton
              aria-label={t("app.themeToggle")}
              onClick={colorMode.toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            {!hasToken && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button color="inherit" onClick={() => navigate("/login")}>
                  {t("app.signIn", { defaultValue: "Sign in" })}
                </Button>
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => navigate("/signup")}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {t("app.joinNow", { defaultValue: "Join now" })}
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
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
