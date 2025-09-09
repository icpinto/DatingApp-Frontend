import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Grid, Collapse, Button } from "@mui/material";

function Home() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null); // Track expanded user ID
  const [profileData, setProfileData] = useState({}); // Store profile data
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/user/profiles", {
          headers: {
            Authorization: `${token}`,
          },
        });
        const rawUsers = Array.isArray(response.data) ? response.data : [];
        const currentUserId = Number(localStorage.getItem("user_id"));
        const users = rawUsers.filter(
          (user) => user.user_id !== currentUserId && user.id !== currentUserId
        );
        setActiveUsers(users);
        if (users.length === 0) {
          setMessage("No active users found.");
        }
      } catch (error) {
        setMessage("Failed to load active users. Please try again.");
      }
    };

    fetchActiveUsers();
  }, []);

  // Toggle and fetch detailed profile data
  const handleToggleExpand = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null); // Collapse if already expanded
    } else {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8080/user/profile/${userId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        const requestStatusResponse = await axios.get(
          `http://localhost:8080/user/checkReqStatus/${userId}`,
          { headers: { Authorization: `${token}` } }
        );

        setProfileData({
          ...response.data,
          requestStatus: requestStatusResponse.data.requestStatus,
        });
        setExpandedUserId(userId); // Expand the selected user
      } catch (error) {
        setMessage("Failed to load user profile.");
      }
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/user/sendRequest`,
        { receiver_id: parseInt(userId, 10) },
        { headers: { Authorization: `${token}` } }
      );
      setProfileData((prev) => ({ ...prev, requestStatus: true }));
      setMessage("Friend request sent successfully!");
    } catch (error) {
      setMessage("Failed to send friend request. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Active Users</h2>
      {message && <p>{message}</p>}
      <Grid container spacing={3} direction="column">
        {Array.isArray(activeUsers) && activeUsers.length > 0 ? (
          activeUsers.map((user) => (
            <Grid item xs={12} key={user.id}>
              <Card onClick={() => handleToggleExpand(user.user_id)} style={{ cursor: "pointer" }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.bio || "No bio available"}
                  </Typography>
                </CardContent>

                {/* Expanded Profile View */}
                <Collapse in={expandedUserId === user.user_id} timeout="auto" unmountOnExit>
                  {profileData && expandedUserId === user.user_id && (
                    <CardContent>
                      <Typography variant="body1">
                        <strong>Bio:</strong> {profileData.bio || "No bio available"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Age:</strong> {profileData.age || "N/A"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Location:</strong> {profileData.location || "N/A"}
                      </Typography>
                      <Button
                        variant="contained"
                        color={profileData.requestStatus ? "secondary" : "primary"}
                        style={{ marginTop: "10px" }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent collapse toggle
                          handleSendRequest(user.user_id);
                        }}
                        disabled={profileData.requestStatus}
                      >
                        {profileData.requestStatus ? "Request Sent" : "Send Request"}
                      </Button>
                      {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
                    </CardContent>
                  )}
                </Collapse>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography>No active users available.</Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default Home;
