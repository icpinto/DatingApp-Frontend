import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import MatchRecommendations from "./MatchRecommendations";
import { AccountLifecycleContext } from "../../context/AccountLifecycleContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../utils/accountLifecycle";
import { fetchMatches } from "../../services/matchmaking";

jest.mock("../../i18n", () => ({
  useTranslation: () => ({
    t: (key, options) => options?.defaultValue ?? key,
  }),
}));

jest.mock("../../services/matchmaking", () => ({
  fetchMatches: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("MatchRecommendations discovery gating", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows the deactivation banner and skips loading matches when discovery is disabled", () => {
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
          <MatchRecommendations />
        </MemoryRouter>
      </AccountLifecycleContext.Provider>
    );

    expect(screen.getByText(ACCOUNT_DEACTIVATED_MESSAGE)).toBeInTheDocument();
    expect(fetchMatches).not.toHaveBeenCalled();
  });
});
