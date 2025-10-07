import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import MatchRecommendations from "./MatchRecommendations";
import { AccountLifecycleContext } from "../../context/AccountLifecycleContext";
import { UserProvider } from "../../context/UserContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../utils/accountLifecycle";
import { fetchMatches } from "../../services/matchmaking";
import api from "../../services/api";

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

  it("shows the deactivation banner and skips loading matches when discovery is disabled", async () => {
    const contextValue = {
      status: "deactivated",
      loading: false,
      error: null,
      refresh: jest.fn(),
      setStatus: jest.fn(),
      isDeactivated: true,
    };

    fetchMatches.mockResolvedValue([]);
    api.get.mockResolvedValue({ data: { requests: [] } });

    render(
      <AccountLifecycleContext.Provider value={contextValue}>
        <UserProvider
          accountStatus={contextValue.status}
          initialSnapshot={{ account: contextValue.status }}
        >
          <MemoryRouter>
            <MatchRecommendations />
          </MemoryRouter>
        </UserProvider>
      </AccountLifecycleContext.Provider>
    );

    expect(
      await screen.findByText(ACCOUNT_DEACTIVATED_MESSAGE)
    ).toBeInTheDocument();
    expect(fetchMatches).not.toHaveBeenCalled();
  });
});
