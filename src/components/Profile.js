import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Profile() {
  const { userId } = useParams(); // Get user ID from URL
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8080/user/profile/${userId}`, {
            headers: {
              Authorization: `${token}`,
            },
          });
        setUser(response.data); // Set the user data from the API response

        // Check if a request has already been sent to this user
        const requestResponse = await axios.get(`http://localhost:8080/user/checkReqStatus/${userId}`, {
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

      await axios.post(
        `http://localhost:8080/user/sendRequest`,
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
    <div style={{ padding: "20px" }}>
    <h2>{user.username}'s Profile</h2>
    <p><strong>Bio:</strong> {user.bio || "No bio available"}</p>
    <p><strong>Age:</strong> {user.age || "N/A"}</p>
    <p><strong>Location:</strong> {user.location || "N/A"}</p>
    {/* Additional profile information can go here */}
    <button
      onClick={handleSendRequest}
      disabled={requestStatus} // Disable button if request already sent
      style={{
        padding: "10px 20px",
        backgroundColor: requestStatus ? "gray" : "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: requestStatus ? "not-allowed" : "pointer",
      }}
    >
      {requestStatus ? "Request Sent" : "Send Request"}
    </button>
    {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
  </div>
  );
}

export default Profile;
