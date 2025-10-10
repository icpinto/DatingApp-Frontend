export const AGE_RANGE = { min: 18, max: 80 };
export const HEIGHT_RANGE = { min: 120, max: 220 };

export const DEFAULT_PREFERENCES = {
  minAge: 25,
  maxAge: 40,
  gender: "any",
  drinkingHabit: "any",
  educationLevel: "any",
  smokingHabit: "any",
  countryOfResidence: "",
  occupationStatus: "any",
  civilStatus: "any",
  religion: "any",
  minHeight: 155,
  maxHeight: 190,
  foodPreference: "any",
};

export const GENDER_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
];

export const DRINKING_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "never", label: "Never" },
  { value: "social", label: "Socially" },
  { value: "often", label: "Often" },
];

export const EDUCATION_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "high_school", label: "High School" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
  { value: "other", label: "Other" },
];

export const SMOKING_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "never", label: "Never" },
  { value: "occasionally", label: "Occasionally" },
  { value: "regularly", label: "Regularly" },
];

export const OCCUPATION_STATUS_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "student", label: "Student" },
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "business_owner", label: "Business owner" },
  { value: "not_working", label: "Not working" },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "single", label: "Single" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
];

export const RELIGION_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "agnostic", label: "Agnostic" },
  { value: "atheist", label: "Atheist" },
  { value: "christian", label: "Christian" },
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "spiritual", label: "Spiritual" },
  { value: "other", label: "Other" },
];

export const FOOD_PREFERENCE_OPTIONS = [
  { value: "any", label: "No preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "omnivore", label: "Omnivore" },
  { value: "pescatarian", label: "Pescatarian" },
];
