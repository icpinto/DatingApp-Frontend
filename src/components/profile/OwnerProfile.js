
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InterestsIcon from "@mui/icons-material/Interests";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LanguageIcon from "@mui/icons-material/Language";
import api from "../../services/api";
import QuestionsComponent from "../questions/Questions";
import ProfileSections from "./ProfileSections";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: "",
    gender: "",
    date_of_birth: "",
    location_legacy: "",
    country_code: "",
    province: "",
    district: "",
    city: "",
    postal_code: "",
    highest_education: "",
    occupation: "",
    family_type: "",
    siblings: "",
    star_sign: "",
    interests: [],
    languages: [],
  });
  const [newInterest, setNewInterest] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
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
        const data = response.data;
        const formatted = {
          personal: {
            bio: data.bio,
            gender: data.gender,
            date_of_birth: data.date_of_birth,
            languages: data.languages,
            interests: data.interests,
          },
          residency: {
            location_legacy: data.location_legacy,
            country_code: data.country_code,
            province: data.province,
            district: data.district,
            city: data.city,
            postal_code: data.postal_code,
          },
          education: {
            highest_education: data.highest_education,
            occupation: data.occupation,
          },
          family: {
            family_type: data.family_type,
            siblings: data.siblings,
          },
          horoscope: {
            star_sign: data.star_sign,
          },
        };
        setProfile({
          profile_image: data.profile_image,
          created_at: data.created_at,
          ...formatted,
        });
        setFormData({
          bio: data.bio || "",
          gender: data.gender || "",
          date_of_birth: data.date_of_birth || "",
          location_legacy: data.location_legacy || "",
          country_code: data.country_code || "",
          province: data.province || "",
          district: data.district || "",
          city: data.city || "",
          postal_code: data.postal_code || "",
          highest_education: data.highest_education || "",
          occupation: data.occupation || "",
          family_type: data.family_type || "",
          siblings: data.siblings || "",
          star_sign: data.star_sign || "",
          interests: data.interests || [],
          languages: data.languages || [],
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);


  // Handle form field changes with inline feedback
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: value ? "" : prev[name] }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.bio) newErrors.bio = "Bio is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.location_legacy) newErrors.location_legacy = "Location is required";
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

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      setFormData((prev) => ({ ...prev, languages: [...prev.languages, newLanguage.trim()] }));
      setNewLanguage("");
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
      data.append("location_legacy", formData.location_legacy);
      data.append("country_code", formData.country_code);
      data.append("province", formData.province);
      data.append("district", formData.district);
      data.append("city", formData.city);
      data.append("postal_code", formData.postal_code);
      data.append("highest_education", formData.highest_education);
      data.append("occupation", formData.occupation);
      data.append("family_type", formData.family_type);
      data.append("siblings", formData.siblings);
      data.append("star_sign", formData.star_sign);
      formData.interests.forEach((interest) => data.append("interests", interest));
      formData.languages.forEach((lang) => data.append("languages", lang));
      if (profileImage) {
        data.append("profile_image", profileImage);
      }
      await api.post(`/user/profile`, data, {
        headers: { Authorization: `${token}`, "Content-Type": "multipart/form-data" },
      });
      const profileResponse = await api.get(`/user/profile/${userId}`, {
        headers: { Authorization: `${token}` },
      });
      const updated = profileResponse.data;
      const formatted = {
        personal: {
          bio: updated.bio,
          gender: updated.gender,
          date_of_birth: updated.date_of_birth,
          languages: updated.languages,
          interests: updated.interests,
        },
        residency: {
          location_legacy: updated.location_legacy,
          country_code: updated.country_code,
          province: updated.province,
          district: updated.district,
          city: updated.city,
          postal_code: updated.postal_code,
        },
        education: {
          highest_education: updated.highest_education,
          occupation: updated.occupation,
        },
        family: {
          family_type: updated.family_type,
          siblings: updated.siblings,
        },
        horoscope: {
          star_sign: updated.star_sign,
        },
      };
      setProfile({
        profile_image: updated.profile_image,
        created_at: updated.created_at,
        ...formatted,
      });
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
            <ProfileSections data={profile} />
            <Typography variant="body2" color="textSecondary">
              Profile created on: {new Date(profile.created_at).toLocaleDateString()}
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>Create Profile</Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Personal</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
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
                            required
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
                            required
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
                            required
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
                            label="Add Language"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            fullWidth
                            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LanguageIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Button variant="contained" onClick={handleAddLanguage} sx={{ mt: 1 }}>
                            Add Language
                          </Button>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                            {formData.languages.map((lang, index) => (
                              <Chip
                                key={index}
                                label={lang}
                                onDelete={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    languages: prev.languages.filter((_, i) => i !== index),
                                  }))
                                }
                                sx={{ mr: 1, mt: 1 }}
                              />
                            ))}
                          </Box>
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
                                onDelete={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    interests: prev.interests.filter((_, i) => i !== index),
                                  }))
                                }
                                sx={{ mr: 1, mt: 1 }}
                              />
                            ))}
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Residency</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Location"
                            name="location_legacy"
                            value={formData.location_legacy}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={Boolean(errors.location_legacy)}
                            helperText={errors.location_legacy || "Where do you live?"}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOnIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Country Code"
                            name="country_code"
                            value={formData.country_code}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Province"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="District"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Postal Code"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Education</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Highest Education"
                            name="highest_education"
                            value={formData.highest_education}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Occupation"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Family</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Family Type"
                            name="family_type"
                            value={formData.family_type}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Siblings"
                            name="siblings"
                            value={formData.siblings}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Horoscope</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Star Sign"
                            name="star_sign"
                            value={formData.star_sign}
                            onChange={handleChange}
                            fullWidth
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
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : "Save Profile"}
                  </Button>
                </Stack>
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
