
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Chip,
  Avatar,
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
  const [enums, setEnums] = useState({});
  const [formData, setFormData] = useState({
    bio: "",
    gender: "",
    date_of_birth: "",
    location: "",
    country_code: "",
    province: "",
    district: "",
    city: "",
    postal_code: "",
    highest_education: "",
    field_of_study: "",
    institution: "",
    employment_status: "",
    occupation: "",
    father_occupation: "",
    mother_occupation: "",
    siblings_count: "",
    siblings: "",
    civil_status: "",
    religion: "",
    religion_detail: "",
    caste: "",
    height_cm: "",
    weight_kg: "",
    dietary_preference: "",
    smoking: "",
    alcohol: "",
    horoscope_available: "false",
    birth_time: "",
    birth_place: "",
    sinhala_raasi: "",
    nakshatra: "",
    horoscope: "",
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
    const fetchEnums = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/user/profile/enums`, {
          headers: { Authorization: `${token}` },
        });
        setEnums(res.data || {});
      } catch (error) {
        console.error("Error fetching enums:", error);
      }
    };
    fetchEnums();
  }, []);

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
            civil_status: data.civil_status,
            religion: data.religion,
            religion_detail: data.religion_detail,
            caste: data.caste,
            height_cm: data.height_cm,
            weight_kg: data.weight_kg,
            dietary_preference: data.dietary_preference,
            smoking: data.smoking,
            alcohol: data.alcohol,
            languages: data.languages,
            interests: data.interests,
          },
          residency: {
            location: data.location || data.location_legacy,
            country_code: data.country_code,
            province: data.province,
            district: data.district,
            city: data.city,
            postal_code: data.postal_code,
          },
          education: {
            highest_education: data.highest_education,
            field_of_study: data.field_of_study,
            institution: data.institution,
            employment_status: data.employment_status,
            occupation: data.occupation,
          },
          family: {
            father_occupation: data.father_occupation,
            mother_occupation: data.mother_occupation,
            siblings_count: data.siblings_count,
            siblings: data.siblings,
          },
          horoscope: {
            horoscope_available: data.horoscope_available,
            birth_time: data.birth_time,
            birth_place: data.birth_place,
            sinhala_raasi: data.sinhala_raasi,
            nakshatra: data.nakshatra,
            horoscope: data.horoscope,
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
          location: data.location || data.location_legacy || "",
          country_code: data.country_code || "",
          province: data.province || "",
          district: data.district || "",
          city: data.city || "",
          postal_code: data.postal_code || "",
          highest_education: data.highest_education || "",
          field_of_study: data.field_of_study || "",
          institution: data.institution || "",
          employment_status: data.employment_status || "",
          occupation: data.occupation || "",
          father_occupation: data.father_occupation || "",
          mother_occupation: data.mother_occupation || "",
          siblings_count: data.siblings_count || "",
          siblings: data.siblings || "",
          civil_status: data.civil_status || "",
          religion: data.religion || "",
          religion_detail: data.religion_detail || "",
          caste: data.caste || "",
          height_cm: data.height_cm || "",
          weight_kg: data.weight_kg || "",
          dietary_preference: data.dietary_preference || "",
          smoking: data.smoking || "",
          alcohol: data.alcohol || "",
          horoscope_available: String(data.horoscope_available || false),
          birth_time: data.birth_time || "",
          birth_place: data.birth_place || "",
          sinhala_raasi: data.sinhala_raasi || "",
          nakshatra: data.nakshatra || "",
          horoscope: data.horoscope || "",
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
      data.append("location", formData.location);
      data.append("country_code", formData.country_code);
      data.append("province", formData.province);
      data.append("district", formData.district);
      data.append("city", formData.city);
      data.append("postal_code", formData.postal_code);
      data.append("highest_education", formData.highest_education);
      data.append("field_of_study", formData.field_of_study);
      data.append("institution", formData.institution);
      data.append("employment_status", formData.employment_status);
      data.append("occupation", formData.occupation);
      data.append("father_occupation", formData.father_occupation);
      data.append("mother_occupation", formData.mother_occupation);
      data.append("siblings_count", formData.siblings_count);
      data.append("siblings", formData.siblings);
      data.append("civil_status", formData.civil_status);
      data.append("religion", formData.religion);
      data.append("religion_detail", formData.religion_detail);
      data.append("caste", formData.caste);
      data.append("height_cm", formData.height_cm);
      data.append("weight_kg", formData.weight_kg);
      data.append("dietary_preference", formData.dietary_preference);
      data.append("smoking", formData.smoking);
      data.append("alcohol", formData.alcohol);
      data.append("horoscope_available", formData.horoscope_available);
      data.append("birth_time", formData.birth_time);
      data.append("birth_place", formData.birth_place);
      data.append("sinhala_raasi", formData.sinhala_raasi);
      data.append("nakshatra", formData.nakshatra);
      data.append("horoscope", formData.horoscope);
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
          civil_status: updated.civil_status,
          religion: updated.religion,
          religion_detail: updated.religion_detail,
          caste: updated.caste,
          height_cm: updated.height_cm,
          weight_kg: updated.weight_kg,
          dietary_preference: updated.dietary_preference,
          smoking: updated.smoking,
          alcohol: updated.alcohol,
          languages: updated.languages,
          interests: updated.interests,
        },
        residency: {
          location: updated.location || updated.location_legacy,
          country_code: updated.country_code,
          province: updated.province,
          district: updated.district,
          city: updated.city,
          postal_code: updated.postal_code,
        },
        education: {
          highest_education: updated.highest_education,
          field_of_study: updated.field_of_study,
          institution: updated.institution,
          employment_status: updated.employment_status,
          occupation: updated.occupation,
        },
        family: {
          father_occupation: updated.father_occupation,
          mother_occupation: updated.mother_occupation,
          siblings_count: updated.siblings_count,
          siblings: updated.siblings,
        },
        horoscope: {
          horoscope_available: updated.horoscope_available,
          birth_time: updated.birth_time,
          birth_place: updated.birth_place,
          sinhala_raasi: updated.sinhala_raasi,
          nakshatra: updated.nakshatra,
          horoscope: updated.horoscope,
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
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Avatar
                  src={profile.profile_image}
                  alt="Profile"
                  sx={{ width: 150, height: 150 }}
                />
              </Box>
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
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Civil Status"
                            name="civil_status"
                            value={formData.civil_status}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.civil_status?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Religion"
                            name="religion"
                            value={formData.religion}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.religion?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Religion Detail"
                            name="religion_detail"
                            value={formData.religion_detail}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Caste"
                            name="caste"
                            value={formData.caste}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Height (cm)"
                            name="height_cm"
                            value={formData.height_cm}
                            onChange={handleChange}
                            type="number"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Weight (kg)"
                            name="weight_kg"
                            value={formData.weight_kg}
                            onChange={handleChange}
                            type="number"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Dietary Preference"
                            name="dietary_preference"
                            value={formData.dietary_preference}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.dietary_preference?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Smoking"
                            name="smoking"
                            value={formData.smoking}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.smoking?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Alcohol"
                            name="alcohol"
                            value={formData.alcohol}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.alcohol?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
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
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            fullWidth
                            required
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
                            select
                            fullWidth
                          >
                            {enums.highest_education?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Field of Study"
                            name="field_of_study"
                            value={formData.field_of_study}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Institution"
                            name="institution"
                            value={formData.institution}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Employment Status"
                            name="employment_status"
                            value={formData.employment_status}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.employment_status?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
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
                            label="Father's Occupation"
                            name="father_occupation"
                            value={formData.father_occupation}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Mother's Occupation"
                            name="mother_occupation"
                            value={formData.mother_occupation}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Number of Siblings"
                            name="siblings_count"
                            value={formData.siblings_count}
                            onChange={handleChange}
                            type="number"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Siblings Details"
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
                            label="Horoscope Available"
                            name="horoscope_available"
                            value={formData.horoscope_available}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            <MenuItem value="true">Yes</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Birth Time"
                            name="birth_time"
                            value={formData.birth_time}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Birth Place"
                            name="birth_place"
                            value={formData.birth_place}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Sinhala Raasi"
                            name="sinhala_raasi"
                            value={formData.sinhala_raasi}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.sinhala_raasi?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nakshatra"
                            name="nakshatra"
                            value={formData.nakshatra}
                            onChange={handleChange}
                            select
                            fullWidth
                          >
                            {enums.nakshatra?.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Horoscope Details"
                            name="horoscope"
                            value={formData.horoscope}
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
