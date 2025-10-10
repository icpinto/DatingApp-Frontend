import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { ArrowBack, PersonOff, Verified as VerifiedIcon, ErrorOutline } from "@mui/icons-material";
import api from "../../shared/services/api";
import { spacing } from "../../styles";
import { useTranslation } from "../../i18n";
import { formatProfileData } from "./profileUtils";
import { CAPABILITIES } from "../../domain/capabilities";
import Guard from "./Guard";
import { useUserCapabilities } from "../../shared/context/UserContext";
import { isAbortError } from "../../utils/http";
import {
  ProfileDetailsCard,
  ProfileOverviewCard,
  ProfileRequestCard,
  ProfileSkeleton,
} from "./components";

const calculateAge = (dateString) => {
  if (!dateString) {
    return null;
  }

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const diff = Date.now() - parsedDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const buildLocationString = (residency = {}) => {
  if (!residency) {
    return "";
  }

  if (residency.location) {
    return residency.location;
  }

  const parts = [residency.city, residency.province, residency.country_code].filter(
    Boolean
  );
  return parts.join(", ");
};

const STATUS_LABEL_MAP = {
  verified: "profile.status.verified",
  pending: "profile.status.pending",
  not_verified: "profile.status.notVerified",
};

const createVerificationChip = (label, status, t) => {
  if (!status) {
    return null;
  }

  const isVerified = status === "verified";
  const isPending = status === "pending";
  const icon = isVerified ? <VerifiedIcon /> : <ErrorOutline />;
  const translatedStatus = t(STATUS_LABEL_MAP[status] || STATUS_LABEL_MAP.not_verified);

  return (
    <Chip
      key={`${label}-${status}`}
      icon={icon}
      label={`${label}: ${translatedStatus}`}
      color={isVerified ? "success" : isPending ? "warning" : "default"}
      variant={isVerified ? "filled" : "outlined"}
      sx={{ fontWeight: 500 }}
    />
  );
};

function ProfileContent() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [requestStatus, setRequestStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestMessageError, setRequestMessageError] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const { groups } = useUserCapabilities();
  const profileCapabilities = groups.profile;
  const canViewProfile = profileCapabilities.viewMember.can;

  const sendRequestReason = useMemo(
    () => profileCapabilities.sendRequest.reason,
    [profileCapabilities.sendRequest.reason]
  );

  const viewSectionsReason = useMemo(
    () => profileCapabilities.viewSections.reason,
    [profileCapabilities.viewSections.reason]
  );

  const viewProfileReason = useMemo(
    () => profileCapabilities.viewMember.reason,
    [profileCapabilities.viewMember.reason]
  );

  const handleNavigateBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  useEffect(() => {
    if (!canViewProfile) {
      setLoading(false);
      setProfile(null);
      setRequestStatus(false);
      setFeedback(null);
      setLoadError(viewProfileReason || "home.messages.profileError");
      return () => {};
    }

    let active = true;
    const controller = new AbortController();

    const fetchUserProfile = async () => {
      setLoading(true);
      setLoadError(null);
      setFeedback(null);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `${token}` };
        const [profileResult, requestResult] = await Promise.allSettled([
          api.get(`/user/profile/${userId}`, {
            headers,
            signal: controller.signal,
          }),
          api.get(`/user/checkReqStatus/${userId}`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!active) {
          return;
        }

        if (profileResult.status !== "fulfilled") {
          if (isAbortError(profileResult.reason)) {
            return;
          }
          throw profileResult.reason;
        }

        const formatted = formatProfileData(profileResult.value.data);
        setProfile(formatted);

        if (requestResult.status === "fulfilled") {
          setRequestStatus(Boolean(requestResult.value.data.requestStatus));
        } else if (!isAbortError(requestResult.reason)) {
          setRequestStatus(false);
        }
      } catch (error) {
        if (!active || isAbortError(error)) {
          return;
        }
        setProfile(null);
        setLoadError("home.messages.profileError");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      active = false;
      controller.abort();
    };
  }, [userId, canViewProfile, viewProfileReason]);

  const handleSendRequest = async () => {
    if (!profileCapabilities.sendRequest.can) {
      return;
    }
    const trimmedMessage = requestMessage.trim();

    if (!trimmedMessage) {
      setRequestMessageError("home.validation.requestMessageRequired");
      return;
    }

    setRequestMessageError("");
    setSendingRequest(true);
    try {
      const token = localStorage.getItem("token");
      const parsedId = Number(userId);
      await api.post(
        `/user/sendRequest`,
        {
          receiver_id: Number.isNaN(parsedId) ? userId : parsedId,
          description: trimmedMessage,
        },
        {
          headers: { Authorization: `${token}` },
        }
      );
      setRequestStatus(true);
      setFeedback({ type: "success", key: "home.messages.requestSuccess" });
      setRequestMessage(trimmedMessage);
    } catch (error) {
      setFeedback({ type: "error", key: "home.messages.requestError" });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleRequestMessageChange = useCallback((event) => {
    setRequestMessage(event.target.value);
    setRequestMessageError("");
    setFeedback(null);
  }, []);

  const age = useMemo(
    () => calculateAge(profile?.personal?.date_of_birth),
    [profile]
  );
  const location = useMemo(
    () => buildLocationString(profile?.residency),
    [profile]
  );
  const languages = useMemo(
    () => (profile?.personal?.languages ? [...profile.personal.languages] : []),
    [profile]
  );
  const interests = useMemo(
    () => (profile?.personal?.interests ? [...profile.personal.interests] : []),
    [profile]
  );

  const identityChip = useMemo(
    () =>
      createVerificationChip(
        t("profile.fields.identityStatus"),
        profile?.verification?.identity_status,
        t
      ),
    [profile, t]
  );
  const contactChip = useMemo(
    () =>
      createVerificationChip(
        t("profile.fields.contactStatus"),
        profile?.verification?.contact_status,
        t
      ),
    [profile, t]
  );

  const displayName = profile?.username || t("common.placeholders.user");

  const profileUnavailableFallback = useCallback(
    () => (
      <Alert severity="warning">
        {profileCapabilities.viewMember.reason ||
          t("profile.viewer.noProfile")}
      </Alert>
    ),
    [profileCapabilities.viewMember.reason, t]
  );

  const locationText =
    location || t("common.placeholders.notAvailable");

  return (
    <Guard
      can={CAPABILITIES.PROFILE_VIEW_MEMBER}
      fallback={profileUnavailableFallback}
    >
      <Container sx={{ p: spacing.pagePadding }}>
        <Stack spacing={spacing.section}>
          <Button
            onClick={handleNavigateBack}
            startIcon={<ArrowBack />}
            variant="text"
            sx={{ alignSelf: "flex-start" }}
          >
            {t("profile.viewer.back")}
          </Button>

          {loading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <Stack spacing={spacing.section}>
              <ProfileOverviewCard
                profile={profile}
                displayName={displayName}
                locationText={locationText}
                age={age}
                identityChip={identityChip}
                contactChip={contactChip}
                languages={languages}
                interests={interests}
                t={t}
              />

              <ProfileDetailsCard
                profile={profile}
                viewSectionsReason={viewSectionsReason}
                t={t}
              />

              <ProfileRequestCard
                displayName={displayName}
                requestMessage={requestMessage}
                requestMessageError={requestMessageError}
                requestStatus={requestStatus}
                sendingRequest={sendingRequest}
                sendRequestReason={sendRequestReason}
                feedback={feedback}
                onRequestMessageChange={handleRequestMessageChange}
                onSendRequest={handleSendRequest}
                t={t}
              />
            </Stack>
          ) : (
            <Stack spacing={spacing.section} alignItems="center">
              <PersonOff fontSize="large" color="disabled" />
              <Typography>
                {loadError ? t(loadError) : t("profile.viewer.noProfile")}
              </Typography>
            </Stack>
          )}

          {loadError && profile && (
            <Alert severity="error">{t(loadError)}</Alert>
          )}
        </Stack>
      </Container>
    </Guard>
  );
}

function Profile() {
  return <ProfileContent />;
}

export default Profile;
