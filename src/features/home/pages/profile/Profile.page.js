import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Chip,
  Container,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack, PersonOff, Verified as VerifiedIcon, ErrorOutline } from "@mui/icons-material";
import api from "../../../../shared/services/api";
import { spacing } from "../../../../styles";
import {
  ProfileHeaderCard,
  ProfileDetailsCard,
  ProfileRequestCard,
} from "./components";
import { useTranslation } from "../../../../i18n";
import { formatProfileData } from "./utils/profileUtils";
import { CAPABILITIES } from "../../../../domain/capabilities";
import Guard from "../../../../shared/components/Guard";
import { useUserCapabilities } from "../../../../shared/context/UserContext";
import { isAbortError } from "../../../../utils/http";
import FeatureCard from "../../../../shared/components/FeatureCard";

const STATUS_LABEL_MAP = {
  verified: "profile.status.verified",
  pending: "profile.status.pending",
  not_verified: "profile.status.notVerified",
};

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

  const parts = [residency.city, residency.province, residency.country_code].filter(Boolean);
  return parts.join(", ");
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
        {profileCapabilities.viewMember.reason || t("profile.viewer.noProfile")}
      </Alert>
    ),
    [profileCapabilities.viewMember.reason, t]
  );

  const locationText =
    location || t("common.placeholders.notAvailable");

  const renderLoadingState = () => (
    <Stack spacing={spacing.section}>
      <ProfileHeaderCard
        displayName={t("common.placeholders.user")}
        profile={null}
        locationText={t("common.placeholders.notAvailable")}
        age={null}
        languages={[]}
        interests={[]}
        badges={null}
        isLoading
        t={t}
      />
      {[48, 40].map((avatarSize, index) => (
        <FeatureCard
          key={`profile-skeleton-${index}`}
          avatar={
            <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
          }
          title={<Skeleton width="40%" />}
          subheader={<Skeleton width="60%" />}
          divider={false}
        >
          <Stack spacing={1.5}>
            <Skeleton width="100%" height={24} />
            <Skeleton width="90%" height={20} />
            <Skeleton width="80%" height={20} />
          </Stack>
        </FeatureCard>
      ))}
    </Stack>
  );

  const verificationBadges = (
    <Guard can={CAPABILITIES.PROFILE_VIEW_BADGES}>
      {({ isAllowed }) =>
        isAllowed && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {identityChip}
            {contactChip}
          </Stack>
        )
      }
    </Guard>
  );

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
            renderLoadingState()
          ) : profile ? (
            <Stack spacing={spacing.section}>
              <ProfileHeaderCard
                displayName={displayName}
                profile={profile}
                locationText={locationText}
                age={age}
                languages={languages}
                interests={interests}
                badges={verificationBadges}
                t={t}
              />

              <ProfileDetailsCard
                profile={profile}
                t={t}
                viewSectionsReason={viewSectionsReason}
              />

              <Guard can={CAPABILITIES.PROFILE_SEND_REQUEST}>
                {({ isAllowed }) => {
                  const helperText = requestMessageError
                    ? t(requestMessageError)
                    : isAllowed
                    ? t("home.helpers.requestMessage")
                    : sendRequestReason ||
                      "Activate your profile to send a connection request.";

                  const isRequestDisabled =
                    requestStatus || sendingRequest || !isAllowed;

                  return (
                    <ProfileRequestCard
                      displayName={displayName}
                      requestMessage={requestMessage}
                      onRequestMessageChange={(event) => {
                        setRequestMessage(event.target.value);
                        setRequestMessageError("");
                        setFeedback(null);
                      }}
                      onSendRequest={() => {
                        if (!isAllowed) {
                          return;
                        }
                        handleSendRequest();
                      }}
                      helperText={helperText}
                      requestMessageError={requestMessageError}
                      isAllowed={isAllowed}
                      isRequestDisabled={isRequestDisabled}
                      requestStatus={requestStatus}
                      sendingRequest={sendingRequest}
                      sendRequestReason={sendRequestReason}
                      feedback={feedback}
                      t={t}
                    />
                  );
                }}
              </Guard>
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

function ProfilePage() {
  return <ProfileContent />;
}

export default ProfilePage;
