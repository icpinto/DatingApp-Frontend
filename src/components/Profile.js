import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Profile() {
  const { userId } = useParams(); // Get user ID from URL
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

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
      } catch (error) {
        setMessage("Failed to load user profile.");
      }
    };

    fetchUserProfile();
  }, [userId]);

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
    </div>
  );
}

export default Profile;
