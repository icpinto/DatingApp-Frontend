import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Home from "./Home";
import { AccountLifecycleContext } from "../../context/AccountLifecycleContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../utils/accountLifecycle";

jest.mock("../../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key, options) => options?.defaultValue ?? key,
  }),
}));

jest.mock("../matches/MatchRecommendations", () => () => (
  <div data-testid="match-recommendations">Match recommendations placeholder</div>
));

describe("Home discovery gating", () => {
  it("hides active users and shows the deactivation banner when discovery is disabled", () => {
    const contextValue = {
      status: "deactivated",
      loading: false,
      error: null,
      refresh: jest.fn(),
      setStatus: jest.fn(),
      isDeactivated: true,
    };

    render(
      <AccountLifecycleContext.Provider value={contextValue}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </AccountLifecycleContext.Provider>
    );

    expect(screen.getByText(ACCOUNT_DEACTIVATED_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText("home.headers.activeUsers")).not.toBeInTheDocument();
    expect(
      screen.getByText("Active user discovery is not available for your account.")
    ).toBeInTheDocument();
  });
});
