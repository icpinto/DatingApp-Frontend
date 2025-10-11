import api from "../../../shared/services/api";

export const signOut = (token) =>
  api.post(
    "/signout",
    {},
    {
      headers: { Authorization: `${token}` },
    }
  );

export const fetchAccountStatus = (token) =>
  api.get(`/user/status`, {
    headers: { Authorization: `${token}` },
  });

export const fetchProfileEnums = (token) =>
  api.get(`/user/profile/enums`, {
    headers: { Authorization: `${token}` },
  });

export const fetchOwnerProfile = (userId, token) =>
  api.get(`/user/profile/${userId}`, {
    headers: { Authorization: `${token}` },
  });

export const saveOwnerProfile = (formData, token) =>
  api.post(`/user/profile`, formData, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const deactivateAccount = (token) =>
  api.post(
    `/user/deactivate`,
    {},
    {
      headers: { Authorization: `${token}` },
    }
  );

export const reactivateAccount = (token) =>
  api.post(
    `/user/reactivate`,
    {},
    {
      headers: { Authorization: `${token}` },
    }
  );

export const removeAccount = (token) =>
  api.delete(`/user`, {
    headers: { Authorization: `${token}` },
  });

const profileApi = {
  signOut,
  fetchAccountStatus,
  fetchProfileEnums,
  fetchOwnerProfile,
  saveOwnerProfile,
  deactivateAccount,
  reactivateAccount,
  removeAccount,
};

export default profileApi;
