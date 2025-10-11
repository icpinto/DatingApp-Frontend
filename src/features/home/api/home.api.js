import api from "../../../shared/services/api";

const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }
  const token = localStorage.getItem("token");
  return token ? { Authorization: `${token}` } : {};
};

export async function fetchActiveUsersApi({ params = {}, signal } = {}) {
  const response = await api.get("/user/profiles", {
    headers: getAuthHeaders(),
    params,
    signal,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function fetchUserProfileApi(userId, { signal } = {}) {
  if (userId === undefined || userId === null || userId === "") {
    throw new Error("A valid user identifier is required to fetch a profile");
  }

  const response = await api.get(`/user/profile/${userId}`, {
    headers: getAuthHeaders(),
    signal,
  });
  return response.data;
}

export async function fetchRequestStatusApi(userId, { signal } = {}) {
  if (userId === undefined || userId === null || userId === "") {
    throw new Error("A valid user identifier is required to fetch request status");
  }

  const response = await api.get(`/user/checkReqStatus/${userId}`, {
    headers: getAuthHeaders(),
    signal,
  });
  return Boolean(response?.data?.requestStatus);
}

export async function sendConnectionRequestApi(userId, description) {
  if (userId === undefined || userId === null || userId === "") {
    throw new Error("A valid user identifier is required to send a request");
  }

  const payload = {
    receiver_id: userId,
    description,
  };

  return api.post(
    `/user/sendRequest`,
    payload,
    {
      headers: getAuthHeaders(),
    }
  );
}
