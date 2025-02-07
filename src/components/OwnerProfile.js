
import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, MenuItem, Grid, Chip } from "@mui/material";
import axios from "axios";
import QuestionsComponent from "./Questions"; 

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: "",
    gender: "",
    date_of_birth: "",
    location: "",
    interests: [],
  });
  const [newInterest, setNewInterest] = useState("");

  const userId = localStorage.getItem("user_id"); 

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8080/user/profile/${userId}`, {
          headers: { Authorization: `${token}` },
        });
        setProfile(response.data); 
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, [userId]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new interest
  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setFormData((prev) => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest(""); // Clear the input
    }
  };

  // Handle submitting the profile form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/user/profile`,
        { ...formData },
        { headers: { Authorization: `${token}` } }
      );
      setProfile(response.data) // Set profile data after successful update
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };

  if (profile) {
    // If profile exists, display profile information
    return (
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>Profile</Typography>
        <Typography variant="body1"><strong>Bio:</strong> {profile.bio}</Typography>
        <Typography variant="body1"><strong>Gender:</strong> {profile.gender}</Typography>
        <Typography variant="body1"><strong>Date of Birth:</strong> {profile.date_of_birth}</Typography>
        <Typography variant="body1"><strong>Location:</strong> {profile.location}</Typography>
        <Typography variant="body1"><strong>Interests:</strong> {profile.interests.join(", ")}</Typography>
        <Typography variant="body2" color="textSecondary">Profile created on: {new Date(profile.created_at).toLocaleDateString()}</Typography>
    
        <QuestionsComponent />
      </Box>
    );
  }

  // Display form if profile data is not yet available
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Create Profile</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              select
              fullWidth
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date of Birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Add Interest"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              fullWidth
              onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()} // Prevent form submission on Enter
            />
            <Button variant="contained" color="primary" onClick={handleAddInterest} sx={{ mt: 1 }}>
              Add Interest
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
              {formData.interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  onDelete={() => setFormData((prev) => ({
                    ...prev,
                    interests: prev.interests.filter((_, i) => i !== index),
                  }))}
                  sx={{ mr: 1, mt: 1 }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Save Profile
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <QuestionsComponent />
    </Box>
  );
}

export default ProfilePage;
