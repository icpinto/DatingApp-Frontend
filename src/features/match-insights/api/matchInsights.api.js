import matchPreferencesService from "../../../shared/services/matchPreferences";
import questionnaireService from "../../../shared/services/questionnaireService";

const getUserId = () => localStorage.getItem("user_id") || "";

export const getPreferences = async () => {
  const userId = getUserId();
  if (!userId) {
    return null;
  }
  return matchPreferencesService.getCorePreferences(userId);
};

export const createPreferences = async (data) => {
  const userId = getUserId();
  if (!userId) {
    throw new Error("A valid user id is required to save preferences.");
  }
  return matchPreferencesService.saveCorePreferences(userId, data);
};

export const updatePreferences = async (data) => {
  const userId = getUserId();
  if (!userId) {
    throw new Error("A valid user id is required to update preferences.");
  }
  return matchPreferencesService.updateCorePreferences(userId, data);
};

export const getQuestionnaire = async ({ category } = {}) => {
  const userId = getUserId();
  if (!userId) {
    throw new Error("A valid user id is required to load the questionnaire.");
  }
  const params = { user_id: userId };
  if (category && category !== "All") {
    params.category = category;
  }
  const response = await questionnaireService.get("/chat/next", { params });
  return response.data || null;
};

export const saveQuestionnaire = async ({ question_instance_id, answer }) => {
  const userId = getUserId();
  if (!userId) {
    throw new Error("A valid user id is required to submit answers.");
  }
  return questionnaireService.post("/chat/answer", {
    user_id: userId,
    question_instance_id,
    answer,
  });
};

export const getQuestionnaireCategories = async () => {
  const response = await questionnaireService.get("/questions/categories");
  return response.data?.categories || [];
};
