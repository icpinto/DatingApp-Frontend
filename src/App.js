import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import MainTabs from "./components/tabs/MainTabs";
import Profile from "./components/profile/Profile";
import Requests from "./components/requests/Requests";
import Messages from "./components/chat/Messages";
import Payment from "./components/payment/Payment";
import { WebSocketProvider } from "./context/WebSocketProvider";
import { ColorModeContext } from "./context/ThemeContext";
import logo from "./logo.svg";
import { useTranslation, languageOptions } from "./i18n";
function App() {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    if (nextLanguage && nextLanguage !== i18n.language) {
      i18n.changeLanguage(nextLanguage);
    }
  };

  return (
    <WebSocketProvider>
      <Router>
        <div className="App">
          <AppBar
            position="static"
            color="primary"
            enableColorOnDark
            elevation={theme.palette.mode === "light" ? 2 : 4}
          >
            <Toolbar>
              <Box
                component="img"
                src={logo}
                alt={t("app.alt")}
                sx={{ height: 40, mr: 2 }}
              />
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
            </Toolbar>
          </AppBar>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<MainTabs />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
