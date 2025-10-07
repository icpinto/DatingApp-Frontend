import {
  CAPABILITIES,
  selectCapabilities,
} from "../capabilities";
import {
  ACCOUNT_STATUS,
  defaultUserSnapshot,
  normalizeSnapshotPayload,
} from "../userDimensions";

const buildFacts = (overrides = {}) => ({
  user: normalizeSnapshotPayload({
    ...defaultUserSnapshot(),
    ...overrides,
  }),
});

describe("capabilities regression", () => {
  it("retains navigation for activated accounts", () => {
    const { allowed } = selectCapabilities(buildFacts());
    expect(allowed[CAPABILITIES.NAV_ACCESS_HOME]).toBe(true);
    expect(allowed[CAPABILITIES.NAV_ACCESS_PROFILE]).toBe(true);
  });

  it("blocks navigation for deleted accounts", () => {
    const { allowed, reasons } = selectCapabilities(
      buildFacts({ account: ACCOUNT_STATUS.DELETED })
    );
    expect(allowed[CAPABILITIES.NAV_ACCESS_HOME]).toBe(false);
    expect(allowed[CAPABILITIES.NAV_ACCESS_MESSAGES]).toBe(false);
    expect(reasons[CAPABILITIES.NAV_ACCESS_HOME]).toMatch(/removed/i);
  });

  it("prevents suspended accounts from sending messages", () => {
    const { allowed, reasons } = selectCapabilities(
      buildFacts({ account: ACCOUNT_STATUS.SUSPENDED })
    );
    expect(allowed[CAPABILITIES.MESSAGING_SEND_MESSAGE]).toBe(false);
    expect(reasons[CAPABILITIES.MESSAGING_SEND_MESSAGE]).toMatch(/suspended/i);
  });

  it("respects conversation level blocks", () => {
    const base = buildFacts();
    const { allowed, reasons } = selectCapabilities({
      ...base,
      conversation: { isBlocked: true },
    });
    expect(allowed[CAPABILITIES.MESSAGING_SEND_MESSAGE]).toBe(false);
    expect(reasons[CAPABILITIES.MESSAGING_SEND_MESSAGE]).toMatch(/blocked/i);
  });

  it("requires saved preferences before answering questionnaire", () => {
    const base = buildFacts();
    const { allowed, reasons } = selectCapabilities({
      ...base,
      hasSavedCorePreferences: false,
      questionnaireLocked: true,
    });
    expect(allowed[CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE]).toBe(false);
    expect(
      reasons[CAPABILITIES.INSIGHTS_ANSWER_QUESTIONNAIRE]
    ).toMatch(/preferences|unlock/i);
  });
});
