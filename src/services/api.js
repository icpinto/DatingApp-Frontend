import axios from "axios";

// Configure the main API service to expose proper CORS headers.
// The base URL can be customized via the REACT_APP_API_SERVICE_URL
// environment variable to point directly to the backend service.
// The service itself must send the correct CORS headers.
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_SERVICE_URL || "http://localhost:8080",
});

export default api;
