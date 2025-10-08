import httpClient from "./api";

const chatBaseURL =
  process.env.REACT_APP_CHAT_SERVICE_URL || "http://localhost:8082";

const withChatBase = (config = {}) => ({
  ...config,
  baseURL: chatBaseURL,
});

const chatService = {
  get: (url, config) => httpClient.get(url, withChatBase(config)),
  post: (url, data, config) =>
    httpClient.post(url, data, withChatBase(config)),
  put: (url, data, config) =>
    httpClient.put(url, data, withChatBase(config)),
  patch: (url, data, config) =>
    httpClient.patch(url, data, withChatBase(config)),
  delete: (url, config) => httpClient.delete(url, withChatBase(config)),
};

export default chatService;
