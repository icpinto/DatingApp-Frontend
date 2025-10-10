import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InterestsIcon from "@mui/icons-material/Interests";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import api from "../../shared/services/api";
import ProfileSections, { profileSectionDefinitions } from "./ProfileSections";
import { spacing } from "../../styles";
import { useTranslation, languageOptions } from "../../i18n";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useNavigate } from "react-router-dom";
import { useAccountLifecycle } from "../../shared/context/AccountLifecycleContext";
import Guard from "./Guard";
import { useUserCapabilities } from "../../shared/context/UserContext";
import { CAPABILITIES } from "../../domain/capabilities";
import ProfileLegalInformation from "./ProfileLegalInformation";
import {
  ACCOUNT_DEACTIVATED_MESSAGE,
  ACCOUNT_LIFECYCLE,
  resolveAccountLifecycleStatus,
} from "../../domain/accountLifecycle";
import { alpha } from "@mui/material/styles";

const SECTION_BACKGROUNDS = {
  profile: "#111827",
  account: "#030712",
  legal: "#111827",
};

const SECTION_TEXT_COLOR = "rgba(248, 250, 252, 0.94)";
const SECTION_SUBTEXT_COLOR = "rgba(226, 232, 240, 0.72)";
const SECTION_DIVIDER_COLOR = "rgba(148, 163, 184, 0.28)";

const sectionWrapperStyles = {
  mt: 8,
  mb: 8,
};

const sectionTitleStyles = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "rgba(148, 163, 184, 0.85)",
  mb: 2.5,
};

const createSectionCardStyles = (background) => ({
  borderRadius: 3,
  overflow: "hidden",
  backgroundColor: background,
  color: SECTION_TEXT_COLOR,
  border: "none",
  boxShadow: "0 30px 50px rgba(8, 12, 24, 0.45)",
  "& .MuiCardHeader-title": {
    color: SECTION_TEXT_COLOR,
    letterSpacing: "0.02em",
  },
  "& .MuiCardHeader-subheader": {
    color: SECTION_SUBTEXT_COLOR,
  },
  "& .MuiTypography-root": {
    color: SECTION_TEXT_COLOR,
  },
  "& .MuiTypography-root.MuiTypography-colorTextSecondary": {
    color: SECTION_SUBTEXT_COLOR,
  },
  "& .MuiTypography-caption": {
    color: "rgba(148, 163, 184, 0.7)",
  },
  "& .MuiDivider-root": {
    borderColor: SECTION_DIVIDER_COLOR,
  },
  "& .MuiAlert-root": {
    backgroundColor: alpha("#1e293b", 0.65),
    color: SECTION_TEXT_COLOR,
    borderRadius: 2,
    "& .MuiAlert-icon": {
      color: SECTION_TEXT_COLOR,
    },
  },
});

const createAccountActionStyles = (isEnabled, variant = "default", toneIndex = 0) => {
  const accent =
    variant === "danger"
      ? "linear-gradient(180deg, #ff6b6b 0%, #ff3d3d 100%)"
      : "linear-gradient(180deg, #ff4f87 0%, #ff7f64 100%)";
  const mutedAccent = alpha(SECTION_SUBTEXT_COLOR, 0.45);
  const tonePalette = ["#151820", "#1b1f2b"];
  const backgroundTone = tonePalette[toneIndex % tonePalette.length];

  return {
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    border: "none",
    backgroundColor: isEnabled ? backgroundTone : alpha("#111827", 0.7),
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
    px: { xs: 2.25, sm: 3 },
    py: { xs: 2.5, sm: 3 },
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, opacity 0.3s ease",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: isEnabled ? accent : mutedAccent,
      opacity: 0,
      transition: "opacity 0.3s ease",
    },
    "&:hover": {
      boxShadow: "0 16px 40px rgba(10, 12, 26, 0.45)",
      transform: "translateY(-4px)",
      backgroundColor: isEnabled ? "#1c1f2a" : alpha("#111827", 0.85),
    },
    "&:hover::before, &:focus-within::before": {
      opacity: 1,
    },
    "&:focus-within": {
      boxShadow: "0 18px 42px rgba(10, 12, 26, 0.5)",
      transform: "translateY(-3px)",
    },
    "&:hover [data-account-action-icon='true'], &:focus-within [data-account-action-icon='true']": {
      backgroundColor: alpha("#ff4f87", 0.18),
    },
    "&:hover [data-account-action-icon='true'] svg, &:focus-within [data-account-action-icon='true'] svg": {
      transform: "rotate(2deg) scale(1.05)",
      filter: "drop-shadow(0 0 6px rgba(255, 105, 135, 0.45))",
    },
  };
};

const accountSectionHeadingStyles = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: "#8b8f99",
  letterSpacing: "1px",
  marginBottom: "0.6rem",
};
function OwnerProfileContent({ accountLifecycle }) {
  const lifecycleContext = accountLifecycle || {};
  const { status: sharedLifecycleStatus, setStatus: setSharedLifecycleStatus } =
    lifecycleContext;
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
  const [editingSection, setEditingSection] = useState(null);
  const [isAccountHidden, setIsAccountHidden] = useState(false);
  const [isRemovingAccount, setIsRemovingAccount] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [accountStatusLoading, setAccountStatusLoading] = useState(true);
  const [accountLifecycleStatus, setAccountLifecycleStatus] = useState(
    sharedLifecycleStatus ?? null
  );
  const [isUpdatingAccountVisibility, setIsUpdatingAccountVisibility] = useState(false);
  const hasLoadedEnumsRef = useRef(false);
  const hasLoadedProfileRef = useRef(false);
  const userId = localStorage.getItem("user_id");
  const { t, i18n } = useTranslation();
  const verificationServiceUrl =
    process.env.REACT_APP_VERIFICATION_SERVICE_URL || "http://localhost:8100";
  const navigate = useNavigate();
  const previousLifecycleStatusRef = useRef(accountLifecycleStatus);
  const { groups, select } = useUserCapabilities();
  const ownerProfileCapabilities = groups.ownerProfile;
  const [changeLanguageCapability, signOutCapability] = useMemo(
    () =>
      select([
        CAPABILITIES.APP_CHANGE_LANGUAGE,
        CAPABILITIES.APP_SIGN_OUT,
      ]),
    [select]
  );
  useEffect(() => {
    hasLoadedProfileRef.current = false;
  }, [userId]);

  const capabilityReasons = useMemo(
    () => ({
      edit: ownerProfileCapabilities.edit.reason,
      uploadPhoto: ownerProfileCapabilities.uploadPhoto.reason,
      submitIdentity: ownerProfileCapabilities.submitIdentity.reason,
      sendOtp: ownerProfileCapabilities.sendOtp.reason,
      verifyOtp: ownerProfileCapabilities.verifyOtp.reason,
      manageInterests: ownerProfileCapabilities.manageInterests.reason,
      manageLanguages: ownerProfileCapabilities.manageLanguages.reason,
      save: ownerProfileCapabilities.save.reason,
      payments: ownerProfileCapabilities.managePayments.reason,
      toggleVisibility: ownerProfileCapabilities.toggleVisibility.reason,
      removeAccount: ownerProfileCapabilities.removeAccount.reason,
    }),
    [ownerProfileCapabilities]
  );

  const canEditProfile = ownerProfileCapabilities.edit.can;
  const canUploadPhoto = ownerProfileCapabilities.uploadPhoto.can;
  const canSubmitIdentity = ownerProfileCapabilities.submitIdentity.can;
  const canSendOtp = ownerProfileCapabilities.sendOtp.can;
  const canVerifyOtp = ownerProfileCapabilities.verifyOtp.can;
  const canManageInterests = ownerProfileCapabilities.manageInterests.can;
  const canManageLanguages = ownerProfileCapabilities.manageLanguages.can;
  const canSaveProfile = ownerProfileCapabilities.save.can;
  const canManagePayments = ownerProfileCapabilities.managePayments.can;
  const canToggleVisibility = ownerProfileCapabilities.toggleVisibility.can;
  const canRemoveAccount = ownerProfileCapabilities.removeAccount.can;
  const canChangeLanguage = Boolean(changeLanguageCapability?.can);
  const changeLanguageReason = changeLanguageCapability?.reason;
  const canSignOut = Boolean(signOutCapability?.can);
  const signOutReason = signOutCapability?.reason;

  const visibilityStatusText =
    accountStatusLoading || isUpdatingAccountVisibility
      ? ""
      : isAccountHidden
      ? t("profile.preferences.visibilityHidden", {
          defaultValue: "Profile hidden — only you can see it right now.",
        })
      : t("profile.preferences.visibilityVisible", {
          defaultValue: "Profile visible to matches — you're ready to be discovered.",
        });

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
    accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED || !canEditProfile;
  const lifecycleReadOnlyMessage =
    capabilityReasons.edit || ACCOUNT_DEACTIVATED_MESSAGE;

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

  const handleLanguageChange = useCallback(
    (event) => {
      const nextLanguage = event.target.value;
      if (!nextLanguage || nextLanguage === i18n.language) {
        return;
      }

      if (!canChangeLanguage) {
        if (changeLanguageReason) {
          setSnackbar({
            open: true,
            messageKey: "",
            message: changeLanguageReason,
            severity: "info",
          });
        }
        return;
      }

      i18n.changeLanguage(nextLanguage);
      setSnackbar({
        open: true,
        messageKey: "",
        message: t("app.language.updated", {
          defaultValue: "Language preference updated.",
        }),
        severity: "success",
      });
    },
    [canChangeLanguage, changeLanguageReason, i18n, t]
  );

  const handleProfileSignOut = useCallback(async () => {
    if (!canSignOut) {
      if (signOutReason) {
        setSnackbar({
          open: true,
          messageKey: "",
          message: signOutReason,
          severity: "info",
        });
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      window.dispatchEvent(
        new CustomEvent("auth-token-changed", { detail: { token: null } })
      );
      setSnackbar({
        open: true,
        messageKey: "",
        message: t("app.signOutSuccess", {
          defaultValue: "Signed out successfully.",
        }),
        severity: "success",
      });
      navigate("/");
      return;
    }

    setSigningOut(true);
    try {
      await api.post(
        "/signout",
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setSnackbar({
        open: true,
        messageKey: "",
        message: t("app.signOutSuccess", {
          defaultValue: "Signed out successfully.",
        }),
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: t("app.signOutError", {
          defaultValue:
            "We couldn't reach the server, but your local session was cleared.",
        }),
        severity: "warning",
      });
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      window.dispatchEvent(
        new CustomEvent("auth-token-changed", { detail: { token: null } })
      );
      setSigningOut(false);
      navigate("/");
    }
  }, [canSignOut, navigate, signOutReason, t]);

  useEffect(() => {
    const shouldSkipFetch =
      accountStatusLoading ||
      accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED;

    if (shouldSkipFetch) {
      if (accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED) {
        hasLoadedEnumsRef.current = false;
        setEnums((prev) => {
          if (!prev || Object.keys(prev).length === 0) {
            return prev;
          }
          return {};
        });
      }
      return;
    }

    if (hasLoadedEnumsRef.current) {
      return;
    }

    const fetchEnums = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/user/profile/enums`, {
          headers: { Authorization: `${token}` },
        });
        setEnums(res.data || {});
        hasLoadedEnumsRef.current = true;
      } catch (error) {
        console.error("Error fetching enums:", error);
        hasLoadedEnumsRef.current = false;
      }
    };

    fetchEnums();
  }, [accountLifecycleStatus, accountStatusLoading]);

  useEffect(() => {
    const shouldSkipFetch =
      !userId ||
      accountStatusLoading ||
      accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED;

    if (shouldSkipFetch) {
      if (accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED) {
        hasLoadedProfileRef.current = false;
        setProfile((prev) => (prev ? null : prev));
        setRawProfile((prev) => (prev ? null : prev));
      }
      return;
    }

    if (hasLoadedProfileRef.current) {
      return;
    }

    let isCancelled = false;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/user/profile/${userId}`, {
          headers: { Authorization: `${token}` },
        });
        if (isCancelled) return;
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
        hasLoadedProfileRef.current = true;
      } catch (error) {
        console.error("Error fetching profile data:", error);
        hasLoadedProfileRef.current = false;
      }
    };
    fetchProfile();

    return () => {
      isCancelled = true;
    };
  }, [userId, accountLifecycleStatus, accountStatusLoading]);

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
    if (!canSubmitIdentity) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.submitIdentity || lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
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
    if (!canSendOtp) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.sendOtp || lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
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
    if (!canVerifyOtp) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.verifyOtp || lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
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
    if (!canManageInterests) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.manageInterests || lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
    if (newInterest.trim()) {
      setFormData((prev) => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest(""); // Clear the input
    }
  };

  const handleAddLanguage = () => {
    if (!canManageLanguages) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.manageLanguages || lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
    if (newLanguage.trim()) {
      setFormData((prev) => ({ ...prev, languages: [...prev.languages, newLanguage.trim()] }));
      setNewLanguage("");
    }
  };

  const handleFileChange = (e) => {
    if (!canUploadPhoto) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.uploadPhoto || lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
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
    if (!canSaveProfile) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.save || lifecycleReadOnlyMessage,
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
      setEditingSection(null);
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

  const handleEditSection = (sectionKey) => {
    if (isLifecycleReadOnly) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
    if (!canSaveProfile) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.save || lifecycleReadOnlyMessage,
        severity: "info",
      });
      return;
    }
    if (rawProfile) populateFormData(rawProfile);
    setEditingSection(sectionKey);
  };

  const handleCancelEdit = () => {
    if (rawProfile) populateFormData(rawProfile);
    setEditingSection(null);
  };

  const handleManagePayments = () => {
    if (!canManagePayments) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.payments ||
          "Billing management is currently unavailable.",
        severity: "info",
      });
      return;
    }
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

    if (!canToggleVisibility) {
      event.preventDefault();
      setSnackbar({
        open: true,
        messageKey: "",
        message: capabilityReasons.toggleVisibility || lifecycleReadOnlyMessage,
        severity: "info",
      });
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
    if (!canRemoveAccount) {
      setSnackbar({
        open: true,
        messageKey: "",
        message:
          capabilityReasons.removeAccount ||
          "Account removal is currently unavailable.",
        severity: "info",
      });
      return;
    }
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
  const isEditing = editingSection !== null;
  const shouldShowForm = (!profile || isEditing) && !isLifecycleReadOnly;

  const sectionLabelMap = useMemo(() => {
    return profileSectionDefinitions.reduce((acc, { key, labelKey }) => {
      acc[key] = labelKey;
      return acc;
    }, {});
  }, []);

  const activeFormSection = profile ? editingSection : "all";
  const isSectionActive = useCallback(
    (sectionKey) =>
      !profile || activeFormSection === "all" || activeFormSection === sectionKey,
    [activeFormSection, profile]
  );

  const editingSectionLabel =
    editingSection && sectionLabelMap[editingSection]
      ? t(sectionLabelMap[editingSection])
      : "";

  useEffect(() => {
    if (isLifecycleReadOnly) {
      setEditingSection(null);
    }

    if (
      accountLifecycleStatus === ACCOUNT_LIFECYCLE.DEACTIVATED &&
      previousLifecycleStatusRef.current !== ACCOUNT_LIFECYCLE.DEACTIVATED
    ) {
      setSnackbar({
        open: true,
        messageKey: "",
        message: lifecycleReadOnlyMessage,
        severity: "info",
      });
    }

    previousLifecycleStatusRef.current = accountLifecycleStatus;
  }, [accountLifecycleStatus, isLifecycleReadOnly, lifecycleReadOnlyMessage]);

  return (
    <Container maxWidth="lg" sx={{ py: spacing.pagePadding }}>
      <Stack spacing={0}>
        {isLifecycleReadOnly && (
          <Alert severity="info">{lifecycleReadOnlyMessage}</Alert>
        )}
        <Box component="section" sx={sectionWrapperStyles}>
          <Typography variant="overline" sx={sectionTitleStyles}>
            {t("profile.sections.profileManagement", {
              defaultValue: "PROFILE MANAGEMENT",
            })}
          </Typography>
          <Card elevation={6} sx={createSectionCardStyles(SECTION_BACKGROUNDS.profile)}>
            <CardHeader
              avatar={<PersonIcon fontSize="large" />}
              title={
                profile
                  ? shouldShowForm
                    ? editingSection
                      ? t("profile.headers.editSection", {
                          defaultValue: "Edit {{section}}",
                          section: editingSectionLabel,
                        })
                      : t("profile.headers.edit", {
                          defaultValue: "Edit your profile",
                        })
                    : t("profile.headers.view", { defaultValue: "Your profile" })
                  : t("profile.headers.create", { defaultValue: "Create your profile" })
              }
              subheader={
                shouldShowForm
                  ? t("profile.headers.formSubheader")
                  : t("profile.headers.viewSubheader")
              }
              action={null}
              sx={(theme) => ({
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.primary.contrastText,
                px: 3,
                py: 2.5,
                boxShadow: theme.shadows[4],
                borderTopLeftRadius: theme.shape.borderRadius * 2,
                borderTopRightRadius: theme.shape.borderRadius * 2,
                '& .MuiCardHeader-subheader': {
                  color: theme.palette.primary.contrastText,
                  opacity: 0.85,
                },
                '& .MuiCardHeader-avatar': {
                  color: theme.palette.primary.contrastText,
                },
              })}
            />
            <Divider />
            {shouldShowForm ? (
              <CardContent>
                <Box component="form" id="owner-profile-form" onSubmit={handleSubmit}>
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
              </Box>
            </CardContent>
          ) : (
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="body2" color="text.secondary">
                  {t("profile.headers.viewDescription", {
                    defaultValue:
                      "Review and manage the personal, lifestyle, and verification details that other members can see.",
                  })}
                </Typography>
                {profile?.profile_image && (
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Avatar
                      variant="rounded"
                      src={profile.profile_image}
                      alt={t("profile.fields.profileImage")}
                      sx={{
                        width: 150,
                        height: 150,
                        boxShadow: 6,
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                )}
                {profile ? (
                  <>
                    <ProfileSections
                      data={profile}
                      onEditSection={handleEditSection}
                      disableEditing={
                        isLifecycleReadOnly || !canSaveProfile || saving || isEditing
                      }
                    />
                    {profile.created_at && (
                      <Stack spacing={1.5}>
                        <Divider flexItem sx={{ my: 0 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("common.messages.profileCreatedOn", {
                            date: new Date(profile.created_at).toLocaleDateString(),
                          })}
                        </Typography>
                      </Stack>
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
          )}
          </Card>
        </Box>
        <Box component="section" sx={sectionWrapperStyles}>
          <Typography variant="overline" sx={sectionTitleStyles}>
            {t("profile.sections.accountSecurity", {
              defaultValue: "ACCOUNT & SECURITY",
            })}
          </Typography>
          <Card elevation={6} sx={createSectionCardStyles(SECTION_BACKGROUNDS.account)}>
            <CardHeader
              avatar={<SettingsIcon fontSize="large" />}
              title={t("profile.preferences.accountSettings", {
                defaultValue: "Account settings",
              })}
              subheader={
                <Stack spacing={0.75}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.92)",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    {t("profile.preferences.accountTagline", {
                      defaultValue:
                        "Your account, your control — manage privacy and preferences easily.",
                    })}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.75)",
                      lineHeight: 1.5,
                    }}
                  >
                    {t("profile.preferences.accountSubtitle", {
                      defaultValue:
                        "Fine-tune language, billing, security, and removal options whenever you like.",
                    })}
                  </Typography>
                </Stack>
              }
              sx={(theme) => ({
                background: "linear-gradient(90deg, #ff4f87, #ff7f64)",
                color: theme.palette.secondary.contrastText,
                px: { xs: 3, sm: 4 },
                py: { xs: 2.5, sm: 3 },
                boxShadow: "0 1px 0 rgba(255, 255, 255, 0.1)",
                borderTopLeftRadius: theme.shape.borderRadius * 2,
                borderTopRightRadius: theme.shape.borderRadius * 2,
                '& .MuiCardHeader-avatar': {
                  color: theme.palette.secondary.contrastText,
                  backgroundColor: alpha("#ffffff", 0.12),
                  borderRadius: "50%",
                  padding: 0.5,
                },
                '& .MuiCardHeader-title': {
                  color: theme.palette.secondary.contrastText,
                  letterSpacing: '0.02em',
                },
                '& .MuiCardHeader-subheader': {
                  color: alpha(theme.palette.secondary.contrastText, 0.85),
                },
              })}
            />
            <CardContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: { xs: 3, sm: 3.75 } }}>
              <Stack spacing={4}>
                <Box>
                  <Typography sx={accountSectionHeadingStyles}>
                    {t("profile.preferences.accountPreferencesTitle", {
                      defaultValue: "Account Preferences",
                    })}
                  </Typography>
                  <Stack spacing={3}>
                    <Box sx={createAccountActionStyles(canChangeLanguage, "default", 0)}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2.5}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                letterSpacing: 0.2,
                              }}
                            >
                              {t("app.language.label", { defaultValue: "Language" })}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: SECTION_SUBTEXT_COLOR,
                                fontSize: "0.875rem",
                                lineHeight: 1.5,
                              }}
                            >
                              {t("profile.preferences.languageDescription", {
                                defaultValue:
                                  "Choose the language you prefer to use across the app.",
                              })}
                            </Typography>
                          </Stack>
                          <FormControl
                            size="small"
                            disabled={!canChangeLanguage}
                            sx={{ width: { xs: "100%", sm: 240 } }}
                          >
                            <InputLabel id="profile-language-select-label">
                              {t("app.language.label")}
                            </InputLabel>
                            <Select
                              labelId="profile-language-select-label"
                              label={t("app.language.label")}
                              value={i18n.language || "en"}
                              onChange={handleLanguageChange}
                            >
                              {languageOptions.map((option) => (
                                <MenuItem key={option.code} value={option.code}>
                                  {t(option.labelKey)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                        {!canChangeLanguage && changeLanguageReason && (
                          <Typography variant="caption" color="text.secondary">
                            {changeLanguageReason}
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box sx={createAccountActionStyles(canManagePayments, "default", 1)}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2.5}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            <Box
                              component="span"
                              aria-hidden
                              data-account-action-icon="true"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pt: 0.5,
                                borderRadius: "999px",
                                padding: 0.75,
                                backgroundColor: alpha("#ffffff", 0.04),
                                transition:
                                  "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
                              }}
                            >
                              <CreditCardIcon color={canManagePayments ? "primary" : "disabled"} />
                            </Box>
                            <Stack spacing={0.75} sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  letterSpacing: 0.2,
                                }}
                              >
                                {t("profile.preferences.billing", {
                                  defaultValue: "Billing & subscriptions",
                                })}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: SECTION_SUBTEXT_COLOR,
                                  fontSize: "0.875rem",
                                  lineHeight: 1.5,
                                }}
                              >
                                {t("profile.preferences.billingDescription", {
                                  defaultValue:
                                    "Review and manage your membership plan, payment methods, and receipts.",
                                })}
                                {" "}
                                {t("profile.preferences.billingReminder", {
                                  defaultValue:
                                    "Access your invoices and update payment preferences in one place.",
                                })}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<CreditCardIcon />}
                            onClick={handleManagePayments}
                            disabled={!canManagePayments}
                            sx={{
                              width: { xs: "100%", sm: "auto" },
                              borderColor: "rgba(148, 163, 184, 0.45)",
                              color: "rgba(226, 232, 240, 0.85)",
                              backgroundColor: "transparent",
                              transition: "all 0.3s ease",
                              '&:hover': {
                                borderColor: "rgba(226, 232, 240, 0.75)",
                                backgroundColor: "rgba(24, 29, 40, 0.9)",
                              },
                              '&.Mui-disabled': {
                                opacity: 0.5,
                                borderColor: "rgba(148, 163, 184, 0.2)",
                              },
                            }}
                          >
                            {t("profile.preferences.manageBilling", {
                              defaultValue: "Manage billing",
                            })}
                          </Button>
                        </Stack>
                        {!canManagePayments && capabilityReasons.payments && (
                          <Typography variant="caption" color="text.secondary">
                            {capabilityReasons.payments}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={accountSectionHeadingStyles}>
                    {t("profile.preferences.securityPrivacyTitle", {
                      defaultValue: "Security & Privacy",
                    })}
                  </Typography>
                  <Stack spacing={3}>
                    <Box sx={createAccountActionStyles(canToggleVisibility, "default", 0)}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box
                            component="span"
                            aria-hidden
                            data-account-action-icon="true"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              pt: 0.5,
                              borderRadius: "999px",
                              padding: 0.75,
                              backgroundColor: alpha("#ffffff", 0.04),
                              transition:
                                "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
                            }}
                          >
                            <VisibilityOffIcon color={isAccountHidden ? "warning" : "primary"} />
                          </Box>
                          <Stack spacing={0.75} sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                letterSpacing: 0.2,
                              }}
                            >
                              {t("profile.preferences.visibility", {
                                defaultValue: "Profile visibility",
                              })}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: SECTION_SUBTEXT_COLOR,
                                fontSize: "0.875rem",
                                lineHeight: 1.5,
                              }}
                            >
                              {t("profile.preferences.visibilityDescription", {
                                defaultValue:
                                  "Hide your profile from potential matches without deleting your information.",
                              })}
                            </Typography>
                            <Typography
                              variant="body2"
                              key={isAccountHidden ? "hidden" : "visible"}
                              sx={{
                                color: isAccountHidden ? "#ff7f9f" : "#7dd3fc",
                                fontSize: "0.875rem",
                                lineHeight: 1.5,
                                transition: "opacity 0.35s ease, transform 0.35s ease",
                                opacity:
                                  accountStatusLoading || isUpdatingAccountVisibility ? 0.7 : 1,
                                transform: "translateY(0)",
                              }}
                            >
                              {visibilityStatusText}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack
                          spacing={2}
                          direction={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Stack spacing={1} sx={{ flex: 1 }}>
                            {(accountStatusLoading || isUpdatingAccountVisibility) && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                              >
                                <CircularProgress size={14} />
                                {t("profile.preferences.updatingVisibility", {
                                  defaultValue: "Updating visibility...",
                                })}
                              </Typography>
                            )}
                            {!canToggleVisibility && capabilityReasons.toggleVisibility && (
                              <Typography variant="caption" color="text.secondary">
                                {capabilityReasons.toggleVisibility}
                              </Typography>
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Switch
                              checked={isAccountHidden}
                              onChange={handleHideAccountToggle}
                              disabled={
                                accountStatusLoading ||
                                isUpdatingAccountVisibility ||
                                !canToggleVisibility
                              }
                              inputProps={{
                                "aria-label": "Hide my profile",
                                "aria-busy": accountStatusLoading || isUpdatingAccountVisibility,
                              }}
                              sx={{
                                '& .MuiSwitch-thumb': {
                                  boxShadow: "0 0 6px rgba(255, 79, 135, 0.45)",
                                },
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: "#ff4f87",
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: alpha("#ff4f87", 0.6),
                                },
                              }}
                            />
                            {(accountStatusLoading || isUpdatingAccountVisibility) && (
                              <CircularProgress size={18} />
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>

                    <Box sx={createAccountActionStyles(canSignOut, "default", 1)}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2.5}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            <Box
                              component="span"
                              aria-hidden
                              data-account-action-icon="true"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pt: 0.5,
                                borderRadius: "999px",
                                padding: 0.75,
                                backgroundColor: alpha("#ffffff", 0.04),
                                transition:
                                  "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
                              }}
                            >
                              <LogoutIcon color={canSignOut ? "primary" : "disabled"} />
                            </Box>
                            <Stack spacing={0.75} sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  letterSpacing: 0.2,
                                }}
                              >
                                {t("app.signOut", { defaultValue: "Sign out" })}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: SECTION_SUBTEXT_COLOR,
                                  fontSize: "0.875rem",
                                  lineHeight: 1.5,
                                }}
                              >
                                {t("profile.preferences.signOutDescription", {
                                  defaultValue:
                                    "End your session on this device whenever you need to.",
                                })}
                                {" "}
                                {t("profile.preferences.signOutReminder", {
                                  defaultValue:
                                    "Signing out keeps your account secure on shared devices.",
                                })}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={
                              signingOut ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <LogoutIcon />
                              )
                            }
                            onClick={handleProfileSignOut}
                            disabled={signingOut || !canSignOut}
                            sx={{
                              width: { xs: "100%", sm: "auto" },
                              borderColor: "rgba(255, 111, 156, 0.6)",
                              color: "#ff4f87",
                              backgroundColor: "transparent",
                              transition: "all 0.3s ease",
                              '&:hover': {
                                color: "#0b0d18",
                                borderColor: "transparent",
                                background: "linear-gradient(90deg, #ff4f87, #ff7f64)",
                                boxShadow: "0 0 12px rgba(255, 79, 135, 0.45)",
                              },
                              '&.Mui-disabled': {
                                color: alpha("#ff4f87", 0.45),
                                borderColor: alpha("#ff4f87", 0.3),
                              },
                            }}
                          >
                            {signingOut
                              ? t("app.signingOut", { defaultValue: "Signing out..." })
                              : t("app.signOut", { defaultValue: "Sign out" })}
                          </Button>
                        </Stack>
                        {!canSignOut && signOutReason && (
                          <Typography variant="caption" color="text.secondary">
                            {signOutReason}
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box sx={createAccountActionStyles(canRemoveAccount, "danger", 2)}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2.5}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                            sx={{ flex: 1, minWidth: 0 }}
                          >
                            <Box
                              component="span"
                              aria-hidden
                              data-account-action-icon="true"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pt: 0.5,
                                borderRadius: "999px",
                                padding: 0.75,
                                backgroundColor: alpha("#ffffff", 0.04),
                                transition:
                                  "transform 0.3s ease, filter 0.3s ease, background 0.3s ease",
                              }}
                            >
                              <DeleteForeverIcon color="error" />
                            </Box>
                            <Stack spacing={0.75} sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  letterSpacing: 0.2,
                                }}
                              >
                                {t("profile.preferences.removeAccount", {
                                  defaultValue: "Remove account",
                                })}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: SECTION_SUBTEXT_COLOR,
                                  fontSize: "0.875rem",
                                  lineHeight: 1.5,
                                }}
                              >
                                {t("profile.preferences.removeAccountDescription", {
                                  defaultValue:
                                    "Permanently delete your profile, matches, and conversations.",
                                })}
                                {" "}
                                {t("profile.preferences.removeAccountWarning", {
                                  defaultValue:
                                    "This action cannot be undone. Your conversations, matches, and profile will be permanently deleted.",
                                })}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={handleRemoveAccount}
                            startIcon={
                              isRemovingAccount ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <DeleteForeverIcon />
                              )
                            }
                            disabled={isRemovingAccount || !canRemoveAccount}
                            sx={{
                              width: { xs: "100%", sm: "auto" },
                              background: "#ff3d3d",
                              border: "none",
                              color: "white",
                              transition: "all 0.3s ease",
                              boxShadow: "0 0 0 rgba(255, 61, 61, 0.4)",
                              '&:hover': {
                                background: "#ff5b5b",
                                boxShadow: "0 0 12px rgba(255, 61, 61, 0.5)",
                                transform: "translateY(-1px)",
                              },
                              '&.Mui-disabled': {
                                background: alpha("#ff3d3d", 0.5),
                                color: alpha("#ffffff", 0.8),
                              },
                            }}
                          >
                            {isRemovingAccount
                              ? t("profile.preferences.removingAccount", {
                                  defaultValue: "Processing...",
                                })
                              : t("profile.preferences.removeAccountButton", {
                                  defaultValue: "Remove my account",
                                })}
                          </Button>
                        </Stack>
                        {!canRemoveAccount && capabilityReasons.removeAccount && (
                          <Typography variant="caption" color="text.secondary">
                            {capabilityReasons.removeAccount}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box component="section" sx={sectionWrapperStyles}>
          <Typography variant="overline" sx={sectionTitleStyles}>
            {t("profile.sections.trustSafety", {
              defaultValue: "TRUST & SAFETY",
            })}
          </Typography>
          <ProfileLegalInformation />
        </Box>
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

function OwnerProfileAccess({ accountLifecycle }) {
  const { groups } = useUserCapabilities();
  const viewCapability = groups.ownerProfile.view;
  const viewFallback = useCallback(
    () => (
      <Alert severity="warning">
        {viewCapability.reason || "Profile management is currently unavailable."}
      </Alert>
    ),
    [viewCapability.reason]
  );

  return (
    <Guard can={CAPABILITIES.OWNER_PROFILE_VIEW} fallback={viewFallback}>
      <OwnerProfileContent accountLifecycle={accountLifecycle} />
    </Guard>
  );
}

function OwnerProfile() {
  const accountLifecycle = useAccountLifecycle();

  return <OwnerProfileAccess accountLifecycle={accountLifecycle} />;
}

export default OwnerProfile;
