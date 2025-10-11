export const normalizeRequests = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload.requests)) return payload.requests;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};
