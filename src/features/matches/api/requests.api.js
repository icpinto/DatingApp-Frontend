import api from "../../../shared/services/api";

const getAuthToken = () => localStorage.getItem("token");

export const fetchReceivedRequests = (config = {}) =>
  api.get("/user/requests", config);

export const fetchSentRequests = (config = {}) =>
  api.get("user/sentRequests", config);

export const fetchProfile = (userId, config = {}) =>
  api.get(`/user/profile/${userId}`, config);

export const acceptMatchRequest = async (id) => {
  const token = getAuthToken();
  return api.post(
    `/user/acceptRequest`,
    { id: parseInt(id, 10) },
    {
      headers: {
        Authorization: `${token}`,
      },
    }
  );
};

export const rejectMatchRequest = async (id) => {
  const token = getAuthToken();
  return api.post(
    `/user/rejectRequest`,
    { id: parseInt(id, 10) },
    {
      headers: {
        Authorization: `${token}`,
      },
    }
  );
};
