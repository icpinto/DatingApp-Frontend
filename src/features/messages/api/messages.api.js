import { http } from "../../../shared/lib/http";

export const getConversations = async () => {
  const data = await http.get("/messages/conversations");
  return Array.isArray(data) ? data : [];
};

export const getThread = async (id) => {
  if (!id) {
    return null;
  }
  const data = await http.get(`/messages/conversations/${id}`);
  if (!data) {
    return { messages: [] };
  }
  if (Array.isArray(data)) {
    return { messages: data };
  }
  const messages = Array.isArray(data.messages) ? data.messages : [];
  return { ...data, messages };
};

export const sendMessage = async (id, text) => {
  if (!id) {
    throw new Error("Conversation id is required");
  }
  await http.post(`/messages/conversations/${id}/messages`, { text });
};

export const blockUser = async (peerId) => {
  if (!peerId) {
    throw new Error("peerId is required");
  }
  await http.post(`/users/${peerId}/block`, {});
};

export const closeThread = async (id) => {
  if (!id) {
    throw new Error("Conversation id is required");
  }
  await http.post(`/messages/conversations/${id}/close`, {});
};
