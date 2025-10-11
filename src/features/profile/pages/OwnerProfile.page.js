import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Box, Typography, Avatar, Snackbar, Alert, Stack, Container, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import {
  ProfileSections,
  AccountSettingsSection,
  HelpfulInformationSection,
  OwnerProfileFormCard,
} from "../ui";
import {
  fetchAccountStatus,
  fetchProfileEnums,
  fetchOwnerProfile,
  saveOwnerProfile,
  deactivateAccount,
  reactivateAccount,
  removeAccount,
} from "../api";
import { profileSectionDefinitions } from "../model";
import { spacing } from "../../../styles";
import { useTranslation, languageOptions } from "../../../i18n";
import { useNavigate } from "react-router-dom";
import { useAccountLifecycle } from "../../../shared/context/AccountLifecycleContext";
import Guard from "../Guard";
import { useUserCapabilities } from "../../../shared/context/UserContext";
import { useOwnerProfileCapabilities } from "../hooks";
import { CAPABILITIES } from "../../../domain/capabilities";
import {
  ACCOUNT_DEACTIVATED_MESSAGE,
  ACCOUNT_LIFECYCLE,
  resolveAccountLifecycleStatus,
} from "../../../domain/accountLifecycle";
import { createSectionCardStyles } from "../ui/accountSettings/accountSectionTheme";
import FeatureCard from "../../../shared/components/FeatureCard";
const sectionWrapperStyles = {
  mt: 8,
  mb: 8,
};

const sectionTitleStyles = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "rgba(200, 200, 200, 0.85)",
  mb: 2.5,
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
  const {
    capabilityReasons,
    canEditProfile,
    canUploadPhoto,
    canSubmitIdentity,
    canSendOtp,
    canVerifyOtp,
    canManageInterests,
    canManageLanguages,
    canSaveProfile,
    canManagePayments,
    canToggleVisibility,
    canRemoveAccount,
    canChangeLanguage,
    changeLanguageReason,
  } = useOwnerProfileCapabilities();
  useEffect(() => {
    hasLoadedProfileRef.current = false;
  }, [userId]);

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
      const response = await fetchAccountStatus(token);
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
        const res = await fetchProfileEnums(token);
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
        const response = await fetchOwnerProfile(userId, token);
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
      await saveOwnerProfile(data, token);
      const profileResponse = await fetchOwnerProfile(userId, token);
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
      const response = hidden
        ? await deactivateAccount(token)
        : await reactivateAccount(token);

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
      const response = await removeAccount(token);

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
  const profileViewCardTitle = profile
    ? t("profile.headers.view", { defaultValue: "Your profile" })
    : t("profile.headers.create", { defaultValue: "Create your profile" });
  const profileViewCardSubheader = t("profile.headers.viewSubheader");
  const profileCardHeaderProps = {
    sx: (theme) => ({
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
    }),
    titleTypographyProps: {
      sx: { color: "inherit" },
    },
    subheaderTypographyProps: {
      sx: { color: "inherit", opacity: 0.85 },
    },
  };
  const profileCardContentProps = {
    sx: {
      px: { xs: spacing.section, sm: spacing.section + 1 },
      py: { xs: spacing.section, sm: spacing.section + 1.25 },
    },
  };

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
          {shouldShowForm ? (
            <OwnerProfileFormCard
              profile={profile}
              editingSection={editingSection}
              editingSectionLabel={editingSectionLabel}
              handleSubmit={handleSubmit}
              isSectionActive={isSectionActive}
              identityChipColor={identityChipColor}
              identityStatus={identityStatus}
              statusLabelKey={statusLabelKey}
              contactChipColor={contactChipColor}
              contactStatus={contactStatus}
              verificationSatisfied={verificationSatisfied}
              errors={errors}
              handleIdentityCardChange={handleIdentityCardChange}
              handleIdentitySelfieChange={handleIdentitySelfieChange}
              handleIdentityVerification={handleIdentityVerification}
              identityVerified={identityVerified}
              handlePhoneNumberChange={handlePhoneNumberChange}
              handleOtpCodeChange={handleOtpCodeChange}
              handleSendOtp={handleSendOtp}
              handleVerifyOtp={handleVerifyOtp}
              phoneNumber={phoneNumber}
              otpCode={otpCode}
              otpSent={otpSent}
              otpSending={otpSending}
              otpVerifying={otpVerifying}
              contactVerified={contactVerified}
              isLifecycleReadOnly={isLifecycleReadOnly}
              formData={formData}
              handleChange={handleChange}
              enums={enums}
              newInterest={newInterest}
              setNewInterest={setNewInterest}
              newLanguage={newLanguage}
              setNewLanguage={setNewLanguage}
              handleAddInterest={handleAddInterest}
              handleAddLanguage={handleAddLanguage}
              setFormData={setFormData}
              saving={saving}
              canSaveProfile={canSaveProfile}
              handleCancelEdit={handleCancelEdit}
              t={t}
              handleFileChange={handleFileChange}
            />
          ) : (
            <FeatureCard
              sx={createSectionCardStyles("profile")}
              title={profileViewCardTitle}
              subheader={profileViewCardSubheader}
              avatar={<PersonIcon fontSize="large" />}
              headerProps={profileCardHeaderProps}
              contentProps={profileCardContentProps}
            >
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
                      useFeatureCard={false}
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
            </FeatureCard>
          )}

        </Box>
        <Box component="section" sx={sectionWrapperStyles}>
          <Typography variant="overline" sx={sectionTitleStyles}>
            {t("profile.sections.accountSecurity", {
              defaultValue: "ACCOUNT & SECURITY",
            })}
          </Typography>
          <AccountSettingsSection
            canChangeLanguage={canChangeLanguage}
            changeLanguageReason={changeLanguageReason}
            currentLanguage={i18n.language || "en"}
            onLanguageChange={handleLanguageChange}
            languageOptions={languageOptions}
            canManagePayments={canManagePayments}
            onManagePayments={handleManagePayments}
            capabilityReasons={capabilityReasons}
            t={t}
            canToggleVisibility={canToggleVisibility}
            isAccountHidden={isAccountHidden}
            accountStatusLoading={accountStatusLoading}
            isUpdatingAccountVisibility={isUpdatingAccountVisibility}
            onToggleVisibility={handleHideAccountToggle}
            visibilityStatusText={visibilityStatusText}
            canRemoveAccount={canRemoveAccount}
            removeAccountReason={capabilityReasons.removeAccount}
            onRemoveAccount={handleRemoveAccount}
            isRemovingAccount={isRemovingAccount}
            featureCardProps={{
              sx: createSectionCardStyles("account"),
            }}
            featureCardContentProps={{
              sx: { px: { xs: 2.5, sm: 3.5 }, py: { xs: 3, sm: 3.75 } },
            }}
          />
        </Box>
        <HelpfulInformationSection
          sectionTitleStyles={sectionTitleStyles}
          sx={sectionWrapperStyles}
        />
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
