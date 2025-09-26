import api from "./api";

const basePath = "/match/preferences";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `${token}` } : {};
};

const normalizeResponse = (data = {}) => ({
  min_age: data.min_age ?? data.minAge,
  max_age: data.max_age ?? data.maxAge,
  gender: data.gender ?? data.partner_gender ?? data.target_gender,
  drinking_habit:
    data.drinking_habit ?? data.drinkingHabit ?? data.partner_drinking_habit,
});

export const getCorePreferences = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const response = await api.get(
      `${basePath}/${encodeURIComponent(userId)}`,
      {
        headers: buildAuthHeaders(),
      }
    );

    if (response?.data) {
      return normalizeResponse(response.data);
    }

    return null;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const saveCorePreferences = async (userId, preferences) => {
  if (!userId) {
    throw new Error("A valid user id is required to save preferences.");
  }

  const payload = {
    min_age: preferences.minAge,
    max_age: preferences.maxAge,
    gender: preferences.gender,
    drinking_habit: preferences.drinkingHabit,
  };

  const response = await api.put(
    `${basePath}/${encodeURIComponent(userId)}`,
    payload,
    {
      headers: buildAuthHeaders(),
    }
  );

  return normalizeResponse(response?.data || payload);
};

const matchPreferencesService = {
  getCorePreferences,
  saveCorePreferences,
};

export default matchPreferencesService;
