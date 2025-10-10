const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return [trimmed];
    }
  }

  return [];
};

export const formatProfileData = (data) => {
  if (!data) {
    return null;
  }

  const dateOfBirth = data.date_of_birth
    ? data.date_of_birth.split("T")[0]
    : "";

  return {
    username: data.username || "",
    profile_image: data.profile_image_url || "",
    verification: {
      identity_status: data.identity_verified ? "verified" : "not_verified",
      contact_status: data.contact_verified ? "verified" : "not_verified",
      phone_number: data.phone_number || "",
    },
    personal: {
      bio: data.bio || "",
      gender: data.gender || "",
      date_of_birth: dateOfBirth,
      civil_status: data.civil_status || "",
      religion: data.religion || "",
      religion_detail: data.religion_detail || "",
      caste: data.caste || "",
      height_cm: data.height_cm || "",
      weight_kg: data.weight_kg || "",
      dietary_preference: data.dietary_preference || "",
      smoking: data.smoking || "",
      alcohol: data.alcohol || "",
      languages: toArray(data.languages),
      interests: toArray(data.interests),
    },
    residency: {
      location: data.location || data.location_legacy || "",
      country_code: data.country_code || "",
      province: data.province || "",
      district: data.district || "",
      city: data.city || "",
      postal_code: data.postal_code || "",
    },
    education: {
      highest_education: data.highest_education || "",
      field_of_study: data.field_of_study || "",
      institution: data.institution || "",
      employment_status: data.employment_status || "",
      occupation: data.occupation || "",
    },
    family: {
      family_type: data.family_type || "",
      father_occupation: data.father_occupation || "",
      mother_occupation: data.mother_occupation || "",
      siblings_count: data.siblings_count || "",
      siblings: data.siblings || "",
    },
    horoscope: {
      horoscope_available: data.horoscope_available ?? "",
      birth_time: data.birth_time || "",
      birth_place: data.birth_place || "",
      sinhala_raasi: data.sinhala_raasi || "",
      nakshatra: data.nakshatra || "",
      horoscope: data.horoscope || "",
      star_sign: data.star_sign || "",
    },
  };
};

