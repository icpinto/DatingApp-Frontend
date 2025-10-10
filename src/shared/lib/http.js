import httpClient from "../../services/http";

const wrap = (method) => async (url, payload, config) => {
  if (method === "get" || method === "delete") {
    const response = await httpClient[method](url, payload);
    return response?.data;
  }

  const response = await httpClient[method](url, payload, config);
  return response?.data;
};

export const http = {
  get: (url, config) => wrap("get")(url, config),
  post: (url, body, config) => wrap("post")(url, body, config),
  put: (url, body, config) => wrap("put")(url, body, config),
  patch: (url, body, config) => wrap("patch")(url, body, config),
  delete: (url, config) => wrap("delete")(url, config),
};

export default http;
