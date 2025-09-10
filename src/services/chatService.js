import axios from "axios";

// Use a relative base URL so requests are proxied during development.
// The proxy is configured in package.json to avoid CORS issues when
// communicating with the chat service.
const chatService = axios.create({
  baseURL: "",
});

export default chatService;
