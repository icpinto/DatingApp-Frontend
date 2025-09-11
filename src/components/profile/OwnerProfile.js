
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Chip,
  Paper,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InterestsIcon from "@mui/icons-material/Interests";
import api from "../../services/api";
import QuestionsComponent from "../questions/Questions";

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
  const [profileImage, setProfileImage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/user/profile/${userId}`, {
          headers: { Authorization: `${token}` },
        });
        setProfile(response.data);
        setFormData({
          bio: response.data.bio || "",
          gender: response.data.gender || "",
          date_of_birth: response.data.date_of_birth || "",
          location: response.data.location || "",
          interests: response.data.interests || [],
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);


  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.bio) newErrors.bio = "Bio is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.location) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new interest
  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setFormData((prev) => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest(""); // Clear the input
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  // Handle submitting the profile form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("bio", formData.bio);
      data.append("gender", formData.gender);
      data.append("date_of_birth", formData.date_of_birth);
      data.append("location", formData.location);
      formData.interests.forEach((interest) => data.append("interests", interest));
      if (profileImage) {
        data.append("profile_image", profileImage);
      }
      await api.post(`/user/profile`, data, {
        headers: { Authorization: `${token}`, "Content-Type": "multipart/form-data" },
      });
      const profileResponse = await api.get(`/user/profile/${userId}`, {
        headers: { Authorization: `${token}` },
      });
      setProfile(profileResponse.data); // Set profile data after successful update
      setSnackbar({ open: true, message: "Profile saved", severity: "success" });
    } catch (error) {
      console.error("Error saving profile data:", error);
      setSnackbar({ open: true, message: "Failed to save profile", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

    return (
      <Box sx={{ padding: 3 }}>
        {profile ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Profile</Typography>
            {profile.profile_image && (
              <Box
                component="img"
                src={profile.profile_image}
                alt="Profile"
                sx={{ width: 150, height: 150, mb: 2 }}
              />
            )}
            <Typography variant="body1"><strong>Bio:</strong> {profile.bio}</Typography>
            <Typography variant="body1"><strong>Gender:</strong> {profile.gender}</Typography>
            <Typography variant="body1"><strong>Date of Birth:</strong> {profile.date_of_birth}</Typography>
            <Typography variant="body1"><strong>Location:</strong> {profile.location}</Typography>
            <Typography variant="body1"><strong>Interests:</strong> {profile.interests?.join(", ")}</Typography>
            <Typography variant="body2" color="textSecondary">Profile created on: {new Date(profile.created_at).toLocaleDateString()}</Typography>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: 3 }}>
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
                  error={Boolean(errors.bio)}
                  helperText={errors.bio || "Tell us about yourself"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <InfoIcon />
                      </InputAdornment>
                    ),
                  }}
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
                  error={Boolean(errors.gender)}
                  helperText={errors.gender || "Select your gender"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WcIcon />
                      </InputAdornment>
                    ),
                  }}
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
                  error={Boolean(errors.date_of_birth)}
                  helperText={errors.date_of_birth || "When were you born?"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.location)}
                  helperText={errors.location || "Where do you live?"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="file"
                  name="profile_image"
                  inputProps={{ accept: "image/*" }}
                  onChange={handleFileChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Add Interest"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  fullWidth
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <InterestsIcon />
                      </InputAdornment>
                    ),
                  }}
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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : "Save Profile"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
        <QuestionsComponent />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
}

export default ProfilePage;
