import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Stack, Typography, Button } from "@mui/material";
import api from "../../services/api";
import { spacing } from "../../styles";

function Profile() {
  const { userId } = useParams(); // Get user ID from URL
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/user/profile/${userId}`, {
            headers: {
              Authorization: `${token}`,
            },
          });
        setUser(response.data); // Set the user data from the API response

        // Check if a request has already been sent to this user
        const requestResponse = await api.get(`/user/checkReqStatus/${userId}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        setRequestStatus(requestResponse.data.requestStatus); // API should return a boolean
      } catch (error) {
        setMessage("Failed to load user profile.");
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleSendRequest = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        `/user/sendRequest`,
        { receiver_id: parseInt(userId, 10) },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      setRequestStatus(true); // Disable the button after sending the request
      setMessage("Friend request sent successfully!");
    } catch (error) {
      setMessage("Failed to send friend request. Please try again.");
    }
  };

  if (!user) {
    return <p>{message || "Loading..."}</p>;
  }

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <Typography variant="h2">{user.username}'s Profile</Typography>
        <Typography>
          <strong>Bio:</strong> {user.bio || "No bio available"}
        </Typography>
        <Typography>
          <strong>Age:</strong> {user.age || "N/A"}
        </Typography>
        <Typography>
          <strong>Location:</strong> {user.location || "N/A"}
        </Typography>
        {/* Additional profile information can go here */}
        <Button
          onClick={handleSendRequest}
          disabled={requestStatus} // Disable button if request already sent
          variant="contained"
          sx={{ alignSelf: "flex-start" }}
        >
          {requestStatus ? "Request Sent" : "Send Request"}
        </Button>
        {message && (
          <Typography color="success.main">{message}</Typography>
        )}
      </Stack>
    </Container>
  );
}

export default Profile;
