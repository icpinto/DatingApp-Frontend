import axios from "axios";

// Configure the questionnaire service to expose proper CORS headers.
// The base URL can be customized via the REACT_APP_QUESTIONNAIRE_SERVICE_URL
// environment variable to point directly to the questionnaire backend service.
// The service itself must send the correct CORS headers.
const questionnaireService = axios.create({
  baseURL:
    process.env.REACT_APP_QUESTIONNAIRE_SERVICE_URL || "http://localhost:8005",
});

export default questionnaireService;
