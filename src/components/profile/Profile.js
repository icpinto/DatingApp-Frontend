import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Stack, Typography, Button, Skeleton } from "@mui/material";
import { PersonOff } from "@mui/icons-material";
import api from "../../services/api";
import { spacing } from "../../styles";
import ProfileSections from "./ProfileSections";

function Profile() {
  const { userId } = useParams(); // Get user ID from URL
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <Container sx={{ p: spacing.pagePadding }}>
        <Stack spacing={spacing.section}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Stack>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ p: spacing.pagePadding }}>
        <Stack spacing={1} alignItems="center">
          <PersonOff fontSize="large" color="disabled" />
          <Typography>{message || "No profile data available."}</Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container sx={{ p: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        <Typography variant="h2">{user.username}'s Profile</Typography>
        <ProfileSections data={user} />
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
