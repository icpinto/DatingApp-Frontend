import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Home from "./Home.page";
import { AccountLifecycleContext } from "../../../shared/context/AccountLifecycleContext";
import { UserProvider } from "../../../shared/context/UserContext";
import { ACCOUNT_DEACTIVATED_MESSAGE } from "../../../domain/accountLifecycle";
import api from "../../../shared/services/api";

jest.mock("../../../shared/services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("../../../i18n", () => ({
  useTranslation: () => ({
    t: (key, options) => options?.defaultValue ?? key,
  }),
}));

jest.mock("../ui/MatchRecommendations", () => () => (
  <div data-testid="match-recommendations">Match recommendations placeholder</div>
));

describe("Home discovery gating", () => {
  it("keeps active users visible without showing the deactivation banner", async () => {
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
      await screen.findByText("home.headers.activeUsers")
    ).toBeInTheDocument();

    expect(
      screen.queryByText(ACCOUNT_DEACTIVATED_MESSAGE)
    ).not.toBeInTheDocument();
  });
});
