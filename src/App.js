import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import MainTabs from "./components/MainTabs";
import Profile from "./components/Profile";
import Requests from "./components/Requests";
import Messages from "./components/Messages";
import { WebSocketProvider } from "./components/WebSocketProvider";




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
