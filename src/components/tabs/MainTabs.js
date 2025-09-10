import React, { useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import Home from "../home/Home";
import Requests from "../requests/Requests";
import Messages from "../chat/Messages";
import OwnerProfile from "../profile/OwnerProfile";

function MainTabs() {
  const [activeTab, setActiveTab] = useState(0); 

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ pb: 7 }}>
      {activeTab === 0 && <Home />}
      {activeTab === 1 && <Requests />}
      {activeTab === 2 && <Messages />}
      {activeTab === 3 && <OwnerProfile />}

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation value={activeTab} onChange={handleChange} showLabels>
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Matches" icon={<FavoriteIcon />} />
          <BottomNavigationAction label="Messages" icon={<ChatIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default MainTabs;
