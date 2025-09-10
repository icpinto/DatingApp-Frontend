import axios from "axios";

// Configure the chat service to expose proper CORS headers.
// The base URL can be customized via the REACT_APP_CHAT_SERVICE_URL
// environment variable to point directly to the chat service.
// The chat service itself must send the correct CORS headers.
const chatService = axios.create({
  baseURL:
    process.env.REACT_APP_CHAT_SERVICE_URL || "http://localhost:8000",
});

export default chatService;
