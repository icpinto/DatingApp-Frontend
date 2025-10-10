import React, { useMemo } from "react";
import StaticPageLayout from "./StaticPageLayout";
import { useTranslation } from "../../../i18n";

function PrivacyPolicy() {
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      {
        heading: t("static.privacy.collection.heading", {
          defaultValue: "Information we collect",
        }),
        content: [
          t("static.privacy.collection.profile", {
            defaultValue:
              "Account details you share such as your name, contact information, preferences, and any profile photos or descriptions you upload.",
          }),
          t("static.privacy.collection.usage", {
            defaultValue:
              "Usage data that helps us improve the experience, including how you navigate the product, device information, and crash diagnostics.",
          }),
          t("static.privacy.collection.interactions", {
            defaultValue:
              "Messages and connection requests you send to other members, which are stored securely so that you can revisit your conversations.",
          }),
        ],
      },
      {
        heading: t("static.privacy.usage.heading", {
          defaultValue: "How we use your information",
        }),
        content: [
          t("static.privacy.usage.matching", {
            defaultValue:
              "To suggest compatible introductions, highlight nearby members, and tailor discovery filters that are relevant to you.",
          }),
          t("static.privacy.usage.safety", {
            defaultValue:
              "To maintain a trusted community by verifying profiles, preventing fraud, and responding to reports of unsafe behaviour.",
          }),
          t("static.privacy.usage.communication", {
            defaultValue:
              "To send essential account notifications and helpful tips about getting the most out of MatchUp. You can adjust your communication preferences at any time.",
          }),
        ],
      },
      {
        heading: t("static.privacy.sharing.heading", {
          defaultValue: "When we share data",
        }),
        content: [
          t("static.privacy.sharing.partners", {
            defaultValue:
              "We may partner with vetted service providers for secure hosting, analytics, or payment processing. They are bound by strict confidentiality agreements.",
          }),
          t("static.privacy.sharing.legal", {
            defaultValue:
              "We will disclose information if required to do so by law or to protect the rights, property, or safety of our members, employees, or the public.",
          }),
          t("static.privacy.sharing.control", {
            defaultValue:
              "We never sell your personal information. You remain in control of what you share on your profile and can request deletion of your data at any time.",
          }),
        ],
      },
      {
        heading: t("static.privacy.choices.heading", {
          defaultValue: "Your choices and rights",
        }),
        content: [
          t("static.privacy.choices.update", {
            defaultValue:
              "Update your profile details, notification preferences, and visibility controls directly from your account settings.",
          }),
          t("static.privacy.choices.export", {
            defaultValue:
              "Contact us if you would like a copy of the information we store about you or if you wish to deactivate or delete your account.",
          }),
          t("static.privacy.choices.support", {
            defaultValue:
              "Have questions? Reach our support team at support@matchup.lk and we will respond within two business days.",
          }),
        ],
      },
    ],
    [t]
  );

  return (
    <StaticPageLayout
      title={t("static.privacy.title", { defaultValue: "Privacy Policy" })}
      description={t("static.privacy.description", {
        defaultValue:
          "We are committed to safeguarding your personal data and being transparent about how your information is used across MatchUp.",
      })}
      sections={sections}
    />
  );
}

export default PrivacyPolicy;
