import api from "./api";

const basePath = "/user/core-preferences";

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
  education_level: data.education_level ?? data.educationLevel,
  smoking_habit: data.smoking_habit ?? data.smokingHabit,
  country_of_residence:
    data.country_of_residence ?? data.countryOfResidence ?? data.residence_country,
  occupation_status: data.occupation_status ?? data.occupationStatus,
  civil_status: data.civil_status ?? data.civilStatus,
  religion: data.religion,
  min_height: data.min_height ?? data.minHeight,
  max_height: data.max_height ?? data.maxHeight,
  food_preference: data.food_preference ?? data.foodPreference,
});

export const getCorePreferences = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const response = await api.get(basePath, {
      headers: buildAuthHeaders(),
    });

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


const normalizeUserId = (userId) => {
  const numericUserId = Number(userId);

  if (Number.isNaN(numericUserId)) {
    throw new Error("A valid numeric user id is required to persist preferences.");
  }

  return numericUserId;
};

const buildPayload = (userId, preferences) => ({
  user_id: normalizeUserId(userId),
  min_age: preferences.minAge,
  max_age: preferences.maxAge,
  gender: preferences.gender,
  drinking_habit: preferences.drinkingHabit,
  education_level: preferences.educationLevel,
  smoking_habit: preferences.smokingHabit,
  country_of_residence: preferences.countryOfResidence,
  occupation_status: preferences.occupationStatus,
  civil_status: preferences.civilStatus,
  religion: preferences.religion,
  min_height: preferences.minHeight,
  max_height: preferences.maxHeight,
  food_preference: preferences.foodPreference,
});

export const saveCorePreferences = async (userId, preferences) => {
  if (!userId) {
    throw new Error("A valid user id is required to save preferences.");
  }

  const payload = buildPayload(userId, preferences);

  const response = await api.post(basePath, payload, {
    headers: buildAuthHeaders(),
  });

  return normalizeResponse(response?.data || payload);
};

export const updateCorePreferences = async (userId, preferences) => {
  if (!userId) {
    throw new Error("A valid user id is required to update preferences.");
  }

  const payload = buildPayload(userId, preferences);

  const response = await api.put(basePath, payload, {
    headers: buildAuthHeaders(),
  });

  return normalizeResponse(response?.data || payload);
};

const matchPreferencesService = {
  getCorePreferences,
  saveCorePreferences,
  updateCorePreferences,
};

export default matchPreferencesService;
