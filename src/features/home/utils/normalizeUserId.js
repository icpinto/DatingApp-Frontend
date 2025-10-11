export const normalizeUserId = (rawUserId) => {
  if (rawUserId === undefined || rawUserId === null || rawUserId === "") {
    return undefined;
  }

  const numericValue = Number(rawUserId);
  return Number.isNaN(numericValue) ? rawUserId : numericValue;
};

export const getUserIdentifier = (user) => {
  if (!user) {
    return undefined;
  }

  const value =
    user.user_id ??
    user.id ??
    user.userId ??
    user.profile_id ??
    user.profileId;

  return normalizeUserId(value);
};
