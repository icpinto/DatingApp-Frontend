import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Container,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Switch,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InterestsIcon from "@mui/icons-material/Interests";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LanguageIcon from "@mui/icons-material/Language";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import api from "../../services/api";
import ProfileSections from "./ProfileSections";
import { spacing } from "../../styles";
import { useTranslation } from "../../i18n";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useNavigate } from "react-router-dom";
import { useAccountLifecycle } from "../../context/AccountLifecycleContext";
import {
  ACCOUNT_DEACTIVATED_MESSAGE,
  ACCOUNT_LIFECYCLE,
  resolveAccountLifecycleStatus,
} from "../../utils/accountLifecycle";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [rawProfile, setRawProfile] = useState(null);
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
  const [identityCardFile, setIdentityCardFile] = useState(null);
  const [identitySelfieFile, setIdentitySelfieFile] = useState(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [contactVerificationToken, setContactVerificationToken] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    messageKey: "",
    message: "",
    severity: "success",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isAccountHidden, setIsAccountHidden] = useState(false);
  const [isRemovingAccount, setIsRemovingAccount] = useState(false);
  const [accountStatusLoading, setAccountStatusLoading] = useState(true);
  const { status: sharedLifecycleStatus, setStatus: setSharedLifecycleStatus } =
    useAccountLifecycle();
  const [accountLifecycleStatus, setAccountLifecycleStatus] = useState(
    sharedLifecycleStatus ?? null
  );
  const [isUpdatingAccountVisibility, setIsUpdatingAccountVisibility] = useState(false);
  const userId = localStorage.getItem("user_id");
  const { t } = useTranslation();
  const verificationServiceUrl =
    process.env.REACT_APP_VERIFICATION_SERVICE_URL || "http://localhost:8100";
  const navigate = useNavigate();
  const previousLifecycleStatusRef = useRef(accountLifecycleStatus);

  const updateAccountLifecycleStatus = useCallback(
    (nextStatus) => {
      setAccountLifecycleStatus(nextStatus);
      if (typeof setSharedLifecycleStatus === "function") {
        setSharedLifecycleStatus(nextStatus);
      }
    },
    [setSharedLifecycleStatus]
  );

  useEffect(() => {
    setAccountLifecycleStatus(sharedLifecycleStatus ?? null);
  }, [sharedLifecycleStatus]);

  const isLifecycleReadOnly =
    accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED;
  const lifecycleReadOnlyMessage = ACCOUNT_DEACTIVATED_MESSAGE;

  const loadAccountStatus = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAccountStatusLoading(false);
      updateAccountLifecycleStatus(null);
      return;
    }

    setAccountStatusLoading(true);
    try {
      const response = await api.get(`/user/status`, {
        headers: { Authorization: `${token}` },
      });
      const payload = response?.data;
      const { status: lifecycleStatus, hidden } =
        resolveAccountLifecycleStatus(payload);
      setIsAccountHidden(Boolean(hidden));
      updateAccountLifecycleStatus(lifecycleStatus);
    } catch (error) {
      console.error("Error fetching account status:", error);
      updateAccountLifecycleStatus(null);
    } finally {
      setAccountStatusLoading(false);
    }
  }, [updateAccountLifecycleStatus]);

  const populateFormData = (data) => {
    setFormData({
      bio: data.bio || "",
      gender: data.gender || "",
      date_of_birth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
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
    setIdentityCardFile(null);
    setIdentitySelfieFile(null);
    setIdentityVerified(Boolean(data.identity_verified));
    setContactVerified(Boolean(data.contact_verified));
    setPhoneNumber(data.phone_number || "");
    setOtpCode("");
    setOtpSent(false);
    setOtpSending(false);
    setOtpVerifying(false);
    setContactVerificationToken(null);
  };

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
        setRawProfile(data);
        populateFormData(data);
        const formatted = {
          verification: {
            identity_status: data.identity_verified ? "verified" : "not_verified",
            contact_status: data.contact_verified ? "verified" : "not_verified",
            phone_number: data.phone_number || "",
          },
          personal: {
            bio: data.bio,
            gender: data.gender,
            date_of_birth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
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
          profile_image: data.profile_image_url,
          created_at: data.created_at,
          ...formatted,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  useEffect(() => {
    loadAccountStatus();
  }, [loadAccountStatus]);

  // Handle form field changes with inline feedback
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (value) {
        const { [name]: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  };

  useEffect(() => {
    if (identityVerified || contactVerified) {
      setErrors((prev) => {
        if (!prev.verification) return prev;
        const { verification, ...rest } = prev;
        return rest;
      });
    }
    if (identityVerified) {
      setErrors((prev) => {
        if (!prev.identity) return prev;
        const { identity, ...rest } = prev;
        return rest;
      });
    }
  }, [identityVerified, contactVerified]);

  const handleIdentityCardChange = (event) => {
    const file = event.target.files?.[0] || null;
    setIdentityCardFile(file);
    if (file) {
      setErrors((prev) => {
        const { identity, ...rest } = prev;
        return rest;
      });
    }
    setIdentityVerified(false);
  };

  const handleIdentitySelfieChange = (event) => {
    const file = event.target.files?.[0] || null;
    setIdentitySelfieFile(file);
    if (file) {
      setErrors((prev) => {
        const { identity, ...rest } = prev;
        return rest;
      });
    }
    setIdentityVerified(false);
  };

  const handleIdentityVerification = () => {
    if (!identityCardFile || !identitySelfieFile) {
      setErrors((prev) => ({
        ...prev,
        identity: "profile.validation.identityDocsRequired",
      }));
      return;
    }

    setIdentityVerified(true);
    setErrors((prev) => {
      const { identity, ...rest } = prev;
      return rest;
    });
    setSnackbar({
      open: true,
      messageKey: "profile.messages.identityReady",
      message: "",
      severity: "success",
    });
  };

  const handlePhoneNumberChange = (event) => {
    const value = event.target.value;
    setPhoneNumber(value);
    setErrors((prev) => {
      const { phoneNumber: removed, verification, ...rest } = prev;
      return rest;
    });
    setOtpSent(false);
    setOtpCode("");
    setContactVerificationToken(null);
    if (contactVerified) {
      setContactVerified(false);
    }
  };

  const handleOtpCodeChange = (event) => {
    const value = event.target.value;
    setOtpCode(value);
    setErrors((prev) => {
      const { otpCode: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "profile.validation.phoneRequired",
      }));
      return;
    }

    setOtpSending(true);
    try {
      const response = await fetch(`${verificationServiceUrl}/v1/otp/send`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "sms",
          destination: phoneNumber.trim(),
          purpose: "profile_verification",
        }),
      });

      if (!response.ok) {
        throw new Error("OTP send failed");
      }

      setOtpSent(true);
      setSnackbar({
        open: true,
        messageKey: "profile.messages.otpSent",
        message: "",
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      setSnackbar({
        open: true,
        messageKey: "profile.messages.otpFailed",
        message: "",
        severity: "error",
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        otpCode: "profile.validation.otpCodeRequired",
      }));
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await fetch(`${verificationServiceUrl}/v1/otp/verify`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: phoneNumber.trim(),
          purpose: "profile_verification",
          code: otpCode.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("OTP verify failed");
      }

      const data = await response.json();
      const token =
        typeof data === "string" ? data : data?.token || data?.jwt || null;
      setContactVerificationToken(token);
      setContactVerified(true);
      setOtpSent(false);
      setOtpCode("");
      setErrors((prev) => {
        const { otpCode: removed, verification, ...rest } = prev;
        return rest;
      });
      setSnackbar({
        open: true,
        messageKey: "profile.messages.otpVerified",
        message: "",
        severity: "success",
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setContactVerified(false);
      setSnackbar({
        open: true,
        messageKey: "profile.messages.otpFailed",
        message: "",
        severity: "error",
      });
    } finally {
      setOtpVerifying(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.bio) newErrors.bio = "profile.validation.bioRequired";
    if (!formData.gender) newErrors.gender = "profile.validation.genderRequired";
    if (!formData.date_of_birth)
      newErrors.date_of_birth = "profile.validation.dateOfBirthRequired";
    if (!formData.location) newErrors.location = "profile.validation.locationRequired";
    if (!identityVerified && !contactVerified)
      newErrors.verification = "profile.validation.verificationRequired";
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
    if (isLifecycleReadOnly) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
    if (!validate()) return;
    if (!identityVerified && !contactVerified) {
      setSnackbar({
        open: true,
        messageKey: "profile.messages.verificationRequired",
        message: "",
        severity: "error",
      });
      return;
    }
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
      if (identityVerified && identityCardFile) {
        data.append("identity_card", identityCardFile);
      }
      if (identityVerified && identitySelfieFile) {
        data.append("identity_selfie", identitySelfieFile);
      }
      if (phoneNumber) {
        data.append("phone_number", phoneNumber);
      }
      if (contactVerified && contactVerificationToken) {
        data.append("contact_verification_token", contactVerificationToken);
      }
      await api.post(`/user/profile`, data, {
        headers: { Authorization: `${token}`, "Content-Type": "multipart/form-data" },
      });
      const profileResponse = await api.get(`/user/profile/${userId}`, {
        headers: { Authorization: `${token}` },
      });
      const updated = profileResponse.data;
      setRawProfile(updated);
      populateFormData(updated);
      const formatted = {
        verification: {
          identity_status: updated.identity_verified ? "verified" : "not_verified",
          contact_status: updated.contact_verified ? "verified" : "not_verified",
          phone_number: updated.phone_number || "",
        },
        personal: {
          bio: updated.bio,
          gender: updated.gender,
          date_of_birth: updated.date_of_birth ? updated.date_of_birth.split("T")[0] : "",
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
        profile_image: updated.profile_image_url,
        created_at: updated.created_at,
        ...formatted,
      });
      setIsEditing(false);
      setSnackbar({
        open: true,
        messageKey: "profile.messages.saved",
        message: "",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving profile data:", error);
      setSnackbar({
        open: true,
        messageKey: "profile.messages.saveFailed",
        message: "",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (isLifecycleReadOnly) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
    if (rawProfile) populateFormData(rawProfile);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (rawProfile) populateFormData(rawProfile);
    setIsEditing(false);
  };

  const handleManagePayments = () => {
    setSnackbar({
      open: true,
      messageKey: "",
      message:
        "Payment management is coming soon. Contact our support team if you need to update billing information.",
      severity: "info",
    });
  };

  const handleHideAccountToggle = async (event) => {
    if (isUpdatingAccountVisibility || accountStatusLoading) {
      return;
    }

    const hidden = event.target.checked;
    const previousState = isAccountHidden;
    const previousLifecycleStatus =
      accountLifecycleStatus ??
      (previousState ? ACCOUNT_LIFECYCLE.DEACTIVATED : ACCOUNT_LIFECYCLE.ACTIVATED);
    setIsAccountHidden(hidden);
    updateAccountLifecycleStatus(
      hidden ? ACCOUNT_LIFECYCLE.DEACTIVATED : ACCOUNT_LIFECYCLE.ACTIVATED
    );
    setIsUpdatingAccountVisibility(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setIsAccountHidden(previousState);
      updateAccountLifecycleStatus(previousLifecycleStatus);
      setSnackbar({
        open: true,
        messageKey: "",
        message: "Please sign in again to update your account visibility.",
        severity: "error",
      });
      setIsUpdatingAccountVisibility(false);
      return;
    }

    try {
      const headers = { Authorization: `${token}` };
      const response = hidden
        ? await api.post(
            `/user/deactivate`,
            {},
            { headers }
          )
        : await api.post(
            `/user/reactivate`,
            {},
            { headers }
          );

      const successMessage =
        response?.data?.message ||
        (hidden
          ? "Your profile is now hidden from match suggestions."
          : "Your profile is visible to potential matches again.");

      setSnackbar({
        open: true,
        messageKey: "",
        message: successMessage,
        severity: hidden ? "info" : "success",
      });
      await loadAccountStatus();
    } catch (error) {
      console.error("Error updating account visibility:", error);
      setIsAccountHidden(previousState);
      updateAccountLifecycleStatus(previousLifecycleStatus);
      const errorMessage =
        error?.response?.data?.message ||
        (hidden
          ? "We couldn't hide your profile right now. Please try again later."
          : "We couldn't make your profile visible. Please try again later.");
      setSnackbar({
        open: true,
        messageKey: "",
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsUpdatingAccountVisibility(false);
    }
  };

  const handleRemoveAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently remove your account? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: "Please sign in again to remove your account.",
        severity: "error",
      });
      return;
    }

    setIsRemovingAccount(true);
    try {
      const response = await api.delete(`/user`, {
        headers: { Authorization: `${token}` },
      });

      const successMessage =
        response?.data?.message ||
        "Your account has been removed. We're sorry to see you go.";
      setSnackbar({
        open: true,
        messageKey: "",
        message: successMessage,
        severity: "success",
      });

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        window.dispatchEvent(
          new CustomEvent("auth-token-changed", { detail: { token: null } })
        );
        navigate("/");
      }, 1200);
    } catch (error) {
      console.error("Error removing account:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "We couldn't remove your account right now. Please try again or contact support.";
      setSnackbar({
        open: true,
        messageKey: "",
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsRemovingAccount(false);
    }
  };

  const statusLabelKey = {
    verified: "profile.status.verified",
    pending: "profile.status.pending",
    not_verified: "profile.status.notVerified",
  };

  const statusColorMap = {
    verified: "success",
    pending: "warning",
    not_verified: "default",
  };

  const identityStatus = identityVerified
    ? "verified"
    : identityCardFile && identitySelfieFile
    ? "pending"
    : "not_verified";

  const contactStatus = contactVerified
    ? "verified"
    : otpSent
    ? "pending"
    : "not_verified";

  const identityChipColor = statusColorMap[identityStatus] || "default";
  const contactChipColor = statusColorMap[contactStatus] || "default";
  const verificationSatisfied = identityVerified || contactVerified;
  const shouldShowForm = (!profile || isEditing) && !isLifecycleReadOnly;

  useEffect(() => {
    if (isLifecycleReadOnly) {
      setIsEditing(false);
    }

    if (
      accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED &&
      previousLifecycleStatusRef.current !== ACCOUNT_LIFECYCLE.DEACTIVATED
    ) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: ACCOUNT_DEACTIVATED_MESSAGE,
        severity: "info",
      });
    }

    previousLifecycleStatusRef.current = accountLifecycleStatus;
  }, [accountLifecycleStatus, isLifecycleReadOnly]);

  return (
    <Container maxWidth="lg" sx={{ py: spacing.pagePadding }}>
      <Stack spacing={spacing.section}>
        {isLifecycleReadOnly && (
          <Alert severity="info">{ACCOUNT_DEACTIVATED_MESSAGE}</Alert>
        )}
        {shouldShowForm ? (
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardHeader
                title={profile ? t("profile.headers.edit") : t("profile.headers.create")}
                subheader={t("profile.headers.formSubheader")}
              />
              <Divider />
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={spacing.section}>
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
                              <BadgeIcon color="action" />
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
                              <PhoneIphoneIcon color="action" />
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
                                disabled={
                                  !otpSent || otpVerifying || contactVerified || isLifecycleReadOnly
                                }
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
                            {enums.religion?.map((option) => (
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
                            {enums.dietary_preference?.map((option) => (
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
                            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LanguageIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddLanguage}
                            sx={{ mt: 1 }}
                            disabled={isLifecycleReadOnly}
                          >
                            {t("profile.buttons.addLanguage")}
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
                            label={t("profile.fields.addInterest")}
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
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddInterest}
                            sx={{ mt: 1 }}
                            disabled={isLifecycleReadOnly}
                          >
                            {t("profile.buttons.addInterest")}
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
                            {enums.education_level?.map((option) => (
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
                      disabled={saving || isLifecycleReadOnly}
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
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardHeader
                title={t("profile.headers.view")}
                subheader={t("profile.headers.viewSubheader")}
                action={
                  <Button variant="contained" onClick={handleEdit} disabled={isLifecycleReadOnly}>
                    {t("common.actions.editProfile")}
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                <Stack spacing={spacing.section}>
                  {profile?.profile_image && (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Avatar
                        variant="rounded"
                        src={profile.profile_image}
                        alt={t("profile.fields.profileImage")}
                        sx={{ width: 150, height: 150 }}
                      />
                    </Box>
                  )}
                  {profile ? (
                    <>
                      <ProfileSections data={profile} />
                      {profile.created_at && (
                        <Typography variant="caption" color="text.secondary">
                          {t("common.messages.profileCreatedOn", {
                            date: new Date(profile.created_at).toLocaleDateString(),
                          })}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Alert severity="info">
                      Your profile details are currently unavailable. Reactivate your account to
                      update or recreate your profile information.
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Account management"
              subheader="Control billing, privacy, and removal settings for your profile"
            />
            <Divider />
            <CardContent>
              <Stack spacing={spacing.section} divider={<Divider flexItem />}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CreditCardIcon color="primary" />
                    <Typography variant="subtitle1">Payment details</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Manage your saved payment methods and review subscription history so you never miss
                    out on potential matches.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CreditCardIcon />}
                    onClick={handleManagePayments}
                  >
                    Manage payment details
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                      <VisibilityOffIcon color={isAccountHidden ? "warning" : "primary"} />
                      <Box>
                        <Typography variant="subtitle1">Hide my profile</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Temporarily remove your profile from match suggestions without deleting your
                          information.
                        </Typography>
                        {accountLifecycleStatus && (
                          <Chip
                            label={
                              accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED
                                ? "Status: Deactivated"
                                : "Status: Activated"
                            }
                            color={
                              accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED
                                ? "warning"
                                : "success"
                            }
                            size="small"
                            sx={{ mt: 1, fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch
                        checked={isAccountHidden}
                        onChange={handleHideAccountToggle}
                        disabled={accountStatusLoading || isUpdatingAccountVisibility}
                        inputProps={{
                          "aria-label": "Hide my profile",
                          "aria-busy": accountStatusLoading || isUpdatingAccountVisibility,
                        }}
                      />
                      {(accountStatusLoading || isUpdatingAccountVisibility) && (
                        <CircularProgress size={18} />
                      )}
                    </Stack>
                  </Stack>
                </Stack>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DeleteForeverIcon color="error" />
                    <Box>
                      <Typography variant="subtitle1">Remove account</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Permanently delete your profile, matches, and conversations.
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveAccount}
                    startIcon={
                      isRemovingAccount ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <DeleteForeverIcon />
                      )
                    }
                    disabled={isRemovingAccount}
                  >
                    {isRemovingAccount ? "Processing..." : "Remove my account"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

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
            {snackbar.messageKey ? t(snackbar.messageKey) : snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
}

export default ProfilePage;
