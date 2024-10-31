import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Grid } from "@mui/material";

function Home() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/user/profiles", {
          headers: {
            Authorization: `${token}`,
          },
        });
        setActiveUsers(response.data);
      } catch (error) {
        setMessage("Failed to load active users. Please try again.");
      }
    };

    fetchActiveUsers();
  }, []);

  // Handle card click to navigate to the profile page
  const handleCardClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Active Users</h2>
      {message && <p>{message}</p>}
      <Grid container spacing={3}>
        {activeUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card onClick={() => handleCardClick(user.user_id)} style={{ cursor: "pointer" }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.bio || "No bio available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Home;
