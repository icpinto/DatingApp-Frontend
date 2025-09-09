import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import MainTabs from "./components/tabs/MainTabs";
import Profile from "./components/profile/Profile";
import Requests from "./components/requests/Requests";
import Messages from "./components/chat/Messages";
import { WebSocketProvider } from "./context/WebSocketProvider";
import { ColorModeContext } from "./context/ThemeContext";




function App() {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();

  return (
    <WebSocketProvider>
      <Router>
        <div className="App">
          <IconButton
            aria-label="toggle light and dark mode"
            onClick={colorMode.toggleColorMode}
            color="inherit"
            sx={{ position: "fixed", top: 8, right: 8 }}
          >
            {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<MainTabs />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
