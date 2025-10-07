import React, { useContext, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import MainTabs from "./components/tabs/MainTabs";
import Profile from "./components/profile/Profile";
import Requests from "./components/requests/Requests";
import Messages from "./components/chat/Messages";
import Payment from "./components/payment/Payment";
import CapabilityRoute from "./components/routing/CapabilityRoute";
import { WebSocketProvider } from "./context/WebSocketProvider";
import { AccountLifecycleProvider, useAccountLifecycle } from "./context/AccountLifecycleContext";
import { ColorModeContext } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import logo from "./logo.svg";
import { useTranslation, languageOptions } from "./i18n";
import api from "./services/api";
import { CAPABILITIES } from "./utils/capabilities";

function TopBar() {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [signingOut, setSigningOut] = useState(false);

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    if (nextLanguage && nextLanguage !== i18n.language) {
      i18n.changeLanguage(nextLanguage);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((previous) => ({ ...previous, open: false }));
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("user_id");
      window.dispatchEvent(
        new CustomEvent("auth-token-changed", { detail: { token: null } })
      );
      navigate("/");
      return;
    }

    setSigningOut(true);
    try {
      await api.post(
        "/signout",
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: t("app.signOutSuccess", {
          defaultValue: "Signed out successfully.",
        }),
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t("app.signOutError", {
          defaultValue:
            "We couldn't reach the server, but your local session was cleared.",
        }),
        severity: "warning",
      });
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      window.dispatchEvent(
        new CustomEvent("auth-token-changed", { detail: { token: null } })
      );
      setSigningOut(false);
      navigate("/");
    }
  };

  return (
    <>
      <AppBar
        position="static"
        color="primary"
        enableColorOnDark
        elevation={theme.palette.mode === "light" ? 2 : 4}
      >
        <Toolbar>
          <Box component="img" src={logo} alt={t("app.alt")} sx={{ height: 40, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {t("app.name")}
          </Typography>
          <FormControl
            variant="standard"
            sx={{
              minWidth: 120,
              mr: 1,
              "& .MuiInputBase-root": { color: "inherit" },
              "& .MuiInputLabel-root": { color: "inherit" },
              "& .MuiInput-underline:before": {
                borderBottomColor: "rgba(255,255,255,0.5)",
              },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottomColor: "white",
              },
            }}
          >
            <InputLabel>{t("app.language.label")}</InputLabel>
            <Select
              value={i18n.language || "en"}
              onChange={handleLanguageChange}
              label={t("app.language.label")}
              aria-label={t("app.language.label")}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {t(option.labelKey)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            aria-label={t("app.themeToggle")}
            onClick={colorMode.toggleColorMode}
            color="inherit"
            sx={{ ml: 1 }}
          >
            {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button
            color="inherit"
            onClick={handleSignOut}
            startIcon={<LogoutIcon />}
            disabled={signingOut}
            sx={{ ml: 1, whiteSpace: "nowrap" }}
          >
            {signingOut
              ? t("app.signingOut", { defaultValue: "Signing out..." })
              : t("app.signOut", { defaultValue: "Sign out" })}
          </Button>
        </Toolbar>
      </AppBar>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function AppShell() {
  return (
    <WebSocketProvider>
      <Router>
        <div className="App">
          <TopBar />
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Login />} />
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
                  <Messages />
                </CapabilityRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <CapabilityRoute capability={CAPABILITIES.BILLING_VIEW_PAYMENT}>
                  <Payment />
                </CapabilityRoute>
              }
            />
          </Routes>
        </div>
      </Router>
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
