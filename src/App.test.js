import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./i18n", () => ({
  useTranslation: () => ({
    t: (key, options) => options?.defaultValue ?? key,
    i18n: { language: "en", changeLanguage: jest.fn() },
  }),
  languageOptions: [],
}));

jest.mock("./shared/services/api", () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

test("renders landing page call-to-action", () => {
  render(<App />);
  const ctaButton = screen.getByText(/Join now/i);
  expect(ctaButton).toBeInTheDocument();
});
