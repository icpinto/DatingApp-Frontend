import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Home from "./Home";
import Requests from "./Requests";
import Messages from "./Messages";
import OwnerProfile from "./OwnerProfile";

function MainTabs() {
  const [activeTab, setActiveTab] = useState(0); 

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Home" />
        <Tab label="Requests" />
        <Tab label="Messages" />
        <Tab label="Profile" />
      </Tabs>
      
      <Box sx={{ padding: 2 }}>
        {activeTab === 0 && <Home />}
        {activeTab === 1 && <Requests />}
        {activeTab === 2 && <Messages />}
        {activeTab === 3 && <OwnerProfile />}
      </Box>
    </Box>
  );
}

export default MainTabs;
