import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Home from "./Home";
import { AccountLifecycleContext } from "../../context/AccountLifecycleContext";
import { UserProvider } from "../../context/UserContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../utils/accountLifecycle";
import api from "../../services/api";

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
  it("hides active users and shows the deactivation banner when discovery is disabled", async () => {
    const contextValue = {
      status: "deactivated",
      loading: false,
      error: null,
      refresh: jest.fn(),
      setStatus: jest.fn(),
      isDeactivated: true,
    };

    api.get.mockResolvedValue({ data: [] });

    render(
      <AccountLifecycleContext.Provider value={contextValue}>
        <UserProvider
          accountStatus={contextValue.status}
          initialSnapshot={{ account: contextValue.status }}
        >
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </UserProvider>
      </AccountLifecycleContext.Provider>
    );

    expect(
      await screen.findByText(
        "Access to the discovery feed is unavailable for your account."
      )
    ).toBeInTheDocument();
  });
});
