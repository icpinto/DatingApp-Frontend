import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InterestsIcon from "@mui/icons-material/Interests";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PersonIcon from "@mui/icons-material/Person";

import FeatureCard from "../../../../shared/components/FeatureCard";
import { spacing } from "../../../../styles";
import {
  SECTION_BACKGROUNDS,
  createSectionCardStyles,
} from "../accountSettings/accountSectionTheme";

const headerGradientStyles = (theme) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  px: 3,
  py: 2.5,
  boxShadow: theme.shadows[4],
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderTopRightRadius: theme.shape.borderRadius * 2,
  "& .MuiCardHeader-subheader": {
    color: theme.palette.primary.contrastText,
    opacity: 0.85,
  },
  "& .MuiCardHeader-avatar": {
    color: theme.palette.primary.contrastText,
  },
});

function OwnerProfileFormCard({
  profile,
  editingSection,
  editingSectionLabel,
  handleSubmit,
  isSectionActive,
  identityChipColor,
  identityStatus,
  statusLabelKey,
  contactChipColor,
  contactStatus,
  verificationSatisfied,
  errors,
  handleIdentityCardChange,
  handleIdentitySelfieChange,
  handleIdentityVerification,
  identityVerified,
  handlePhoneNumberChange,
  handleOtpCodeChange,
  handleSendOtp,
  handleVerifyOtp,
  phoneNumber,
  otpCode,
  otpSent,
  otpSending,
  otpVerifying,
  contactVerified,
  isLifecycleReadOnly,
  formData,
  handleChange,
  enums,
  newInterest,
  setNewInterest,
  newLanguage,
  setNewLanguage,
  handleAddInterest,
  handleAddLanguage,
  setFormData,
  saving,
  canSaveProfile,
  handleCancelEdit,
  t,
  handleFileChange,
}) {
  return (
    <FeatureCard
      sx={createSectionCardStyles(SECTION_BACKGROUNDS.profile)}
      title={
        profile
          ? editingSection
            ? t("profile.headers.editSection", {
                defaultValue: "Edit {{section}}",
                section: editingSectionLabel,
              })
            : t("profile.headers.edit", { defaultValue: "Edit your profile" })
          : t("profile.headers.create", { defaultValue: "Create your profile" })
      }
      subheader={t("profile.headers.formSubheader")}
      avatar={<PersonIcon fontSize="large" />}
      headerProps={{
        sx: headerGradientStyles,
        titleTypographyProps: {
          sx: { color: "inherit" },
        },
        subheaderTypographyProps: {
          sx: { color: "inherit", opacity: 0.85 },
        },
      }}
      contentProps={{
        sx: {
          px: { xs: spacing.section, sm: spacing.section + 1 },
          py: { xs: spacing.section, sm: spacing.section + 1.25 },
        },
        component: "form",
        id: "owner-profile-form",
        onSubmit: handleSubmit,
      }}
    >
      <Stack spacing={spacing.section}>
        {isSectionActive("verification") && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t("profile.headers.verification")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1">
                      {t("profile.verification.identityTitle")}
                    </Typography>
                    <Chip
                      size="small"
                      color={identityChipColor}
                      label={t(statusLabelKey[identityStatus])}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t("profile.verification.identityDescription")}
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="file"
                        label={t("profile.fields.identityCard")}
                        inputProps={{ accept: "image/*" }}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        onChange={handleIdentityCardChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="file"
                        label={t("profile.fields.selfie")}
                        inputProps={{ accept: "image/*" }}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        onChange={handleIdentitySelfieChange}
                      />
                    </Grid>
                  </Grid>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ mt: 2 }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleIdentityVerification}
                      disabled={identityVerified || isLifecycleReadOnly}
                    >
                      {t("profile.buttons.submitIdentity")}
                    </Button>
                  </Stack>
                  {errors.identity && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {t(errors.identity)}
                    </Alert>
                  )}
                  {identityVerified && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {t("profile.messages.identityReady")}
                    </Alert>
                  )}
                </Box>
                <Divider />
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1">
                      {t("profile.verification.contactTitle")}
                    </Typography>
                    <Chip
                      size="small"
                      color={contactChipColor}
                      label={t(statusLabelKey[contactStatus])}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t("profile.verification.contactDescription")}
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={t("profile.fields.phoneNumber")}
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        type="tel"
                        fullWidth
                        error={Boolean(errors.phoneNumber)}
                        helperText={
                          errors.phoneNumber
                            ? t(errors.phoneNumber)
                            : t("profile.helpers.phoneNumber")
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIphoneIcon />
                            </InputAdornment>
                          ),
                        }}
                        disabled={contactVerified}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={t("profile.fields.otpCode")}
                        value={otpCode}
                        onChange={handleOtpCodeChange}
                        fullWidth
                        disabled={!otpSent || contactVerified}
                        error={Boolean(errors.otpCode)}
                        helperText={
                          errors.otpCode
                            ? t(errors.otpCode)
                            : t("profile.helpers.otpCode")
                        }
                      />
                    </Grid>
                  </Grid>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ mt: 2 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleSendOtp}
                      disabled={otpSending || contactVerified || isLifecycleReadOnly}
                      startIcon={
                        otpSending ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : null
                      }
                    >
                      {t("profile.buttons.sendOtp")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleVerifyOtp}
                      disabled={!otpSent || otpVerifying || contactVerified || isLifecycleReadOnly}
                      startIcon={
                        otpVerifying ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : null
                      }
                    >
                      {t("profile.buttons.verifyOtp")}
                    </Button>
                  </Stack>
                  {contactVerified && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {t("profile.messages.otpVerified")}
                    </Alert>
                  )}
                </Box>
                {errors.verification && (
                  <Alert severity="error">{t(errors.verification)}</Alert>
                )}
                {!verificationSatisfied && (
                  <Typography variant="body2" color="text.secondary">
                    {t("profile.helpers.verificationRequirement")}
                  </Typography>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {isSectionActive("personal") && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("profile.headers.personal")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t("profile.fields.bio")}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    fullWidth
                    required
                    error={Boolean(errors.bio)}
                    helperText={
                      errors.bio ? t(errors.bio) : t("profile.helpers.bio")
                    }
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
                    label={t("profile.fields.gender")}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    select
                    fullWidth
                    required
                    error={Boolean(errors.gender)}
                    helperText={
                      errors.gender
                        ? t(errors.gender)
                        : t("profile.helpers.gender")
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WcIcon />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Male">
                      {t("profile.options.gender.male")}
                    </MenuItem>
                    <MenuItem value="Female">
                      {t("profile.options.gender.female")}
                    </MenuItem>
                    <MenuItem value="Other">
                      {t("profile.options.gender.other")}
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.dateOfBirth")}
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                    error={Boolean(errors.date_of_birth)}
                    helperText={
                      errors.date_of_birth
                        ? t(errors.date_of_birth)
                        : t("profile.helpers.dateOfBirth")
                    }
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
                    label={t("profile.fields.civilStatus")}
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
                    label={t("profile.fields.religion")}
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    select
                    fullWidth
                  >
                    {enums.religions?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.religionDetail")}
                    name="religion_detail"
                    value={formData.religion_detail}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.caste")}
                    name="caste"
                    value={formData.caste}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.heightCm")}
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.weightKg")}
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.dietaryPreference")}
                    name="dietary_preference"
                    value={formData.dietary_preference}
                    onChange={handleChange}
                    select
                    fullWidth
                  >
                    {enums.dietary_preferences?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.smoking")}
                    name="smoking"
                    value={formData.smoking}
                    onChange={handleChange}
                    select
                    fullWidth
                  >
                    {enums.habit_frequency?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.alcohol")}
                    name="alcohol"
                    value={formData.alcohol}
                    onChange={handleChange}
                    select
                    fullWidth
                  >
                    {enums.habit_frequency?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t("profile.fields.addLanguage")}
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    fullWidth
                    onKeyPress={(e) => e.key === "Enter" && e.preventDefault()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddLanguage}
                    sx={{ mt: 1 }}
                    disabled={isLifecycleReadOnly}
                  >
                    {t("profile.buttons.addLanguage")}
                  </Button>
                  <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1 }}>
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
                    label={t("profile.fields.addInterest")}
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    fullWidth
                    onKeyPress={(e) => e.key === "Enter" && e.preventDefault()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InterestsIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddInterest}
                    sx={{ mt: 1 }}
                    disabled={isLifecycleReadOnly}
                  >
                    {t("profile.buttons.addInterest")}
                  </Button>
                  <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1 }}>
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
        )}

        {isSectionActive("residency") && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("profile.headers.residency")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t("profile.fields.location")}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={Boolean(errors.location)}
                    helperText={
                      errors.location
                        ? t(errors.location)
                        : t("profile.helpers.location")
                    }
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
                    label={t("profile.fields.countryCode")}
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.province")}
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.district")}
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.city")}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.postalCode")}
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {isSectionActive("education") && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("profile.headers.education")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.highestEducation")}
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
                    label={t("profile.fields.fieldOfStudy")}
                    name="field_of_study"
                    value={formData.field_of_study}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.institution")}
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.employmentStatus")}
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
                    label={t("profile.fields.occupation")}
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {isSectionActive("family") && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("profile.headers.family")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.fatherOccupation")}
                    name="father_occupation"
                    value={formData.father_occupation}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.motherOccupation")}
                    name="mother_occupation"
                    value={formData.mother_occupation}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.siblingsCount")}
                    name="siblings_count"
                    value={formData.siblings_count}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.siblings")}
                    name="siblings"
                    value={formData.siblings}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {isSectionActive("horoscope") && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("profile.headers.horoscope")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.horoscopeAvailable")}
                    name="horoscope_available"
                    value={formData.horoscope_available}
                    onChange={handleChange}
                    select
                    fullWidth
                  >
                    <MenuItem value="true">
                      {t("profile.options.boolean.yes")}
                    </MenuItem>
                    <MenuItem value="false">
                      {t("profile.options.boolean.no")}
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.birthTime")}
                    name="birth_time"
                    value={formData.birth_time}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.birthPlace")}
                    name="birth_place"
                    value={formData.birth_place}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t("profile.fields.sinhalaRaasi")}
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
                    label={t("profile.fields.nakshatra")}
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
                    label={t("profile.fields.horoscope")}
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
                    label={t("profile.fields.profileImage")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="flex-end"
        >
          {profile && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelEdit}
            >
              {t("profile.buttons.cancel")}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving || isLifecycleReadOnly || !canSaveProfile}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {saving
              ? t("profile.buttons.saving")
              : t("profile.buttons.save")}
          </Button>
        </Stack>
      </Stack>
    </FeatureCard>
  );
}

export default OwnerProfileFormCard;
