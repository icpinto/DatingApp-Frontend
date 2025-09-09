import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import MainTabs from "./components/tabs/MainTabs";
import Profile from "./components/profile/Profile";
import Requests from "./components/requests/Requests";
import Messages from "./components/chat/Messages";
import { WebSocketProvider } from "./context/WebSocketProvider";




function App() {
  return (
    <WebSocketProvider>
    <Router>
      <div className="App">
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
