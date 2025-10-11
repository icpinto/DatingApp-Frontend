import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
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
import { CAPABILITIES } from "./domain/capabilities";
import AppFooter from "./shared/components/layout/AppFooter";
import { TopBarNavigationProvider } from "./shared/context/TopBarNavigationContext";
import TopBar from "./shared/components/layout/TopBar";

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
