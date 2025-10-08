// @ts-nocheck
import axios from "axios";
import { isAbortError } from "../utils/http";

const pendingControllers = new Set();

const baseURL =
  process.env.REACT_APP_API_SERVICE_URL || "http://localhost:8080";

const httpClient = axios.create({ baseURL });

const releaseController = (config) => {
  const controller = config?.__internal?.__controller;
  if (controller) {
    pendingControllers.delete(controller);
  }
};

httpClient.interceptors.request.use((config = {}) => {
  const nextConfig = { ...config };
  nextConfig.headers = { ...(config.headers || {}) };

  const token = localStorage.getItem("token");
  if (token && !nextConfig.headers.Authorization) {
    nextConfig.headers.Authorization = `${token}`;
  }

  if (!nextConfig.signal) {
    const controller = new AbortController();
    pendingControllers.add(controller);
    nextConfig.signal = controller.signal;
    nextConfig.__internal = {
      ...(nextConfig.__internal || {}),
      __controller: controller,
    };
  }

  return nextConfig;
});

httpClient.interceptors.response.use(
  (response) => {
    releaseController(response?.config);
    return response;
  },
  (error) => {
    releaseController(error?.config);
    if (isAbortError(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const cancelAllRequests = (reason = "capability-disabled") => {
  pendingControllers.forEach((controller) => {
    try {
      controller.abort(reason);
    } catch (error) {
      // ignore controller abort errors
    }
  });
  pendingControllers.clear();
};

export const trackExternalRequest = (controller) => {
  if (!controller) {
    return () => {};
  }

  pendingControllers.add(controller);
  return () => {
    pendingControllers.delete(controller);
  };
};

export default httpClient;
