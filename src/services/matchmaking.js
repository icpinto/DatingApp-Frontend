import axios from "axios";

const matchApi = axios.create({
  baseURL:
    process.env.REACT_APP_MATCH_SERVICE_URL || "http://localhost:8003",
});

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
  };

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const response = await matchApi.get(`/matches/${userId}`, {
    params,
    paramsSerializer: () => searchParams.toString(),
  });

  return Array.isArray(response.data) ? response.data : [];
};

export default matchApi;
