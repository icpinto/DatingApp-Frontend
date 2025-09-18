import api from "./api";

const defaultQuery = {
  min_age: 0,
  max_age: 12222,
  max_distance_km: 11111,
  orientation: 0,
  gender: 0,
  alpha: 0.5,
  beta: 0.5,
  limit: 50,
};

export const fetchMatches = async (userId, queryOverrides = {}) => {
  if (!userId) {
    throw new Error("A valid user id is required to fetch matches.");
  }

  const { limit, ...restOverrides } = queryOverrides;
  const parsedLimit = Number(limit);
  const safeLimit = Math.min(
    100,
    Number.isFinite(parsedLimit) ? parsedLimit : defaultQuery.limit
  );

  const params = {
    ...defaultQuery,
    ...restOverrides,
    limit: safeLimit,
    user_id: userId,
  };

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const token = localStorage.getItem("token");

  const response = await api.get(`/matches`, {
    params,
    paramsSerializer: () => searchParams.toString(),
    headers: token ? { Authorization: `${token}` } : undefined,
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.matches)) {
    return response.data.matches;
  }

  return [];
};
