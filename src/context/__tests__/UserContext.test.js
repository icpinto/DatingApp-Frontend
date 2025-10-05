import { deriveCapabilities, normalizeUserFacts } from "../userCapabilities";

describe("deriveCapabilities", () => {
  it("grants full access for an activated, paid, verified member", () => {
    const capabilities = deriveCapabilities({
      account: "activated",
      billing: "paid",
      verification: "verified",
      role: "user",
    });

    expect(capabilities.browseDiscovery).toBe(true);
    expect(capabilities.respondToMatchRequests).toBe(true);
    expect(capabilities.sendMessage).toBe(true);
    expect(capabilities.accessPremium).toBe(true);
    expect(capabilities.editProfile).toBe(true);
  });

  it("keeps deactivated accounts read-only", () => {
    const capabilities = deriveCapabilities({
      account: "deactivated",
      billing: "paid",
      verification: "verified",
      role: "user",
    });

    expect(capabilities.viewMatchRequests).toBe(true);
    expect(capabilities.respondToMatchRequests).toBe(false);
    expect(capabilities.sendMessage).toBe(false);
    expect(capabilities.reactivateAccount).toBe(true);
  });

  it("honors server-provided capability overrides", () => {
    const capabilities = deriveCapabilities({
      account: "deactivated",
      billing: "unpaid",
      verification: "unverified",
      role: "user",
      capabilities: ["viewInsights", "sendMessage"],
    });

    expect(capabilities.viewInsights).toBe(true);
    expect(capabilities.sendMessage).toBe(true);
  });

  it("disables premium access when billing is past due", () => {
    const capabilities = deriveCapabilities({
      account: "activated",
      billing: "past_due",
      verification: "verified",
      role: "moderator",
    });

    expect(capabilities.accessPremium).toBe(false);
    expect(capabilities.sendMessage).toBe(false);
    expect(capabilities.assistMembers).toBe(true);
  });
});

describe("normalizeUserFacts", () => {
  it("normalizes mixed-case status values", () => {
    const facts = normalizeUserFacts({
      account_status: "Active",
      billing_status: "PastDue",
      verification_status: "Pending",
      role: "Support",
    });

    expect(facts.account).toBe("activated");
    expect(facts.billing).toBe("past_due");
    expect(facts.verification).toBe("pending");
    expect(facts.role).toBe("support");
  });
});
