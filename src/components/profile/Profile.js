import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Forum,
  InfoOutlined,
  PersonOff,
  Verified as VerifiedIcon,
  ErrorOutline,
} from "@mui/icons-material";
import api from "../../services/api";
import { spacing } from "../../styles";
import ProfileSections from "./ProfileSections";
import { useTranslation } from "../../i18n";
import { formatProfileData } from "./profileUtils";
import { CAPABILITIES } from "../../utils/capabilities";
import Guard from "./Guard";
import { useUserContext } from "../../context/UserContext";

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
  const { hasCapability, getReason } = useUserContext();

  const sendRequestReason = useMemo(
    () => getReason(CAPABILITIES.PROFILE_SEND_REQUEST),
    [getReason]
  );

  const viewSectionsReason = useMemo(
    () => getReason(CAPABILITIES.PROFILE_VIEW_SECTIONS),
    [getReason]
  );

  const handleNavigateBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  useEffect(() => {
    let active = true;

    const fetchUserProfile = async () => {
      setLoading(true);
      setLoadError(null);
      setFeedback(null);
      try {
        const token = localStorage.getItem("token");
        const [profileResponse, requestResponse] = await Promise.all([
          api.get(`/user/profile/${userId}`, {
            headers: { Authorization: `${token}` },
          }),
          api.get(`/user/checkReqStatus/${userId}`, {
            headers: { Authorization: `${token}` },
          }),
        ]);

        if (!active) {
          return;
        }

        const formatted = formatProfileData(profileResponse.data);
        setProfile(formatted);
        setRequestStatus(Boolean(requestResponse.data.requestStatus));
      } catch (error) {
        if (!active) {
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
    };
  }, [userId]);

  const handleSendRequest = async () => {
    if (!hasCapability(CAPABILITIES.PROFILE_SEND_REQUEST)) {
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
        {getReason(CAPABILITIES.PROFILE_VIEW_MEMBER) ||
          t("profile.viewer.noProfile")}
      </Alert>
    ),
    [getReason, t]
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
          <Stack spacing={spacing.section}>
            <Card>
              <CardHeader
                avatar={<Skeleton variant="circular" width={72} height={72} />}
                title={<Skeleton width="40%" />}
                subheader={<Skeleton width="60%" />}
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <Skeleton width="100%" height={24} />
                  <Skeleton width="80%" height={20} />
                  <Skeleton width="90%" height={20} />
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardHeader
                avatar={<Skeleton variant="circular" width={40} height={40} />}
                title={<Skeleton width="30%" />}
              />
              <CardContent>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          </Stack>
        ) : profile ? (
          <Stack spacing={spacing.section}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardHeader
                avatar={
                  <Avatar
                    src={profile.profile_image}
                    alt={displayName}
                    sx={{ width: 72, height: 72, fontSize: 32 }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title={
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {displayName}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {location || t("common.placeholders.notAvailable")}
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Stack spacing={spacing.section}>
                  <Typography variant="body1" color="text.primary">
                    {profile.personal.bio || t("common.placeholders.noBio")}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="overline" color="text.secondary">
                        {t("home.labels.age")}
                      </Typography>
                      <Typography variant="body1">
                        {age !== null
                          ? t("profile.viewer.ageYears", { count: age })
                          : t("common.placeholders.notAvailable")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="overline" color="text.secondary">
                        {t("home.labels.location")}
                      </Typography>
                      <Typography variant="body1">
                        {location || t("common.placeholders.notAvailable")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="overline" color="text.secondary">
                        {t("profile.fields.civilStatus")}
                      </Typography>
                      <Typography variant="body1">
                        {profile.personal.civil_status ||
                          t("common.placeholders.notAvailable")}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Guard can={CAPABILITIES.PROFILE_VIEW_BADGES}>
                    {({ isAllowed }) =>
                      isAllowed && (
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {identityChip}
                          {contactChip}
                        </Stack>
                      )
                    }
                  </Guard>
                  {languages.length > 0 && (
                    <Stack spacing={1}>
                      <Typography variant="overline" color="text.secondary">
                        {t("profile.viewer.languagesLabel")}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {languages.map((language) => (
                          <Chip
                            key={`language-${language}`}
                            label={language}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Stack>
                  )}
                  {interests.length > 0 && (
                    <Stack spacing={1}>
                      <Typography variant="overline" color="text.secondary">
                        {t("profile.viewer.interestsLabel")}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {interests.map((interest) => (
                          <Chip
                            key={`interest-${interest}`}
                            label={interest}
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <InfoOutlined />
                  </Avatar>
                }
                title={t("profile.viewer.detailsTitle")}
              />
              <Divider />
              <CardContent>
                <Guard
                  can={CAPABILITIES.PROFILE_VIEW_SECTIONS}
                  fallback={
                    <Alert severity="info">
                      {viewSectionsReason || t("profile.viewer.noProfile")}
                    </Alert>
                  }
                >
                  <ProfileSections data={profile} />
                </Guard>
              </CardContent>
            </Card>

            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <Forum />
                  </Avatar>
                }
                title={t("profile.viewer.requestCard.title", { name: displayName })}
                subheader={t("profile.viewer.requestCard.description")}
              />
              <Divider />
              <CardContent>
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
                      <Stack spacing={spacing.section}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label={t("home.labels.requestMessage")}
                          value={requestMessage}
                          onChange={(event) => {
                            setRequestMessage(event.target.value);
                            setRequestMessageError("");
                            setFeedback(null);
                          }}
                          helperText={helperText}
                          error={Boolean(requestMessageError)}
                          disabled={requestStatus || !isAllowed}
                        />
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                        >
                          <Button
                            variant="contained"
                            onClick={() => {
                              if (!isAllowed) {
                                return;
                              }
                              handleSendRequest();
                            }}
                            disabled={isRequestDisabled}
                          >
                            {requestStatus
                              ? t("home.labels.requestSent")
                              : t("home.labels.sendRequest")}
                          </Button>
                        </Stack>
                        {!isAllowed && sendRequestReason && (
                          <Alert severity="info">{sendRequestReason}</Alert>
                        )}
                        {feedback?.key && (
                          <Alert
                            severity={
                              feedback.type === "error" ? "error" : "success"
                            }
                          >
                            {t(feedback.key)}
                          </Alert>
                        )}
                      </Stack>
                    );
                  }}
                </Guard>
              </CardContent>
            </Card>
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
