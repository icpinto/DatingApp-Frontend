import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./i18n", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en", changeLanguage: jest.fn() },
  }),
  languageOptions: [],
}));

jest.mock("./services/api", () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

test("renders Login heading", () => {
  render(<App />);
  const heading = screen.getByText(/Login/i);
  expect(heading).toBeInTheDocument();
});
