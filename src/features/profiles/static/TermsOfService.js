import React, { useMemo } from "react";
import StaticPageLayout from "./StaticPageLayout";
import { useTranslation } from "../../../i18n";

function TermsOfService() {
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      {
        heading: t("static.terms.account.heading", {
          defaultValue: "Creating and maintaining your account",
        }),
        content: [
          t("static.terms.account.eligibility", {
            defaultValue:
              "You must be at least 18 years old and legally permitted to enter into a relationship to join MatchUp. You are responsible for maintaining the accuracy of the information you provide.",
          }),
          t("static.terms.account.security", {
            defaultValue:
              "Please keep your login credentials confidential. Notify us immediately if you suspect any unauthorised access to your account.",
          }),
        ],
      },
      {
        heading: t("static.terms.conduct.heading", {
          defaultValue: "Community conduct and expectations",
        }),
        content: [
          t("static.terms.conduct.respect", {
            defaultValue:
              "Treat other members with respect and kindness. Harassment, discrimination, or sharing explicit content is strictly prohibited.",
          }),
          t("static.terms.conduct.authenticity", {
            defaultValue:
              "You agree to represent yourself honestly. Profiles that impersonate others, contain misleading details, or promote commercial services may be removed.",
          }),
          t("static.terms.conduct.safety", {
            defaultValue:
              "Report concerning behaviour directly within the app or by emailing safety@matchup.lk. We review all reports promptly.",
          }),
        ],
      },
      {
        heading: t("static.terms.payments.heading", {
          defaultValue: "Memberships and payments",
        }),
        content: [
          t("static.terms.payments.billing", {
            defaultValue:
              "Paid upgrades renew automatically at the end of each billing cycle unless you cancel before the renewal date. Pricing details are available on our Membership Plans page.",
          }),
          t("static.terms.payments.refunds", {
            defaultValue:
              "We do not offer refunds for partially used subscription periods except where required by law. You can manage your plan anytime from account settings.",
          }),
        ],
      },
      {
        heading: t("static.terms.termination.heading", {
          defaultValue: "Suspension or termination",
        }),
        content: [
          t("static.terms.termination.breach", {
            defaultValue:
              "We may suspend or terminate accounts that violate these Terms, harm other members, or compromise the safety of the community.",
          }),
          t("static.terms.termination.choice", {
            defaultValue:
              "You may deactivate or delete your account whenever you choose. Removing your account will limit access to your chat history and other saved information.",
          }),
        ],
      },
      {
        heading: t("static.terms.contact.heading", {
          defaultValue: "Questions about these Terms",
        }),
        content: [
          t("static.terms.contact.support", {
            defaultValue:
              "If you have any questions, reach us at hello@matchup.lk and we will be happy to help.",
          }),
        ],
      },
    ],
    [t]
  );

  return (
    <StaticPageLayout
      title={t("static.terms.title", { defaultValue: "Terms of Service" })}
      description={t("static.terms.description", {
        defaultValue:
          "These Terms outline what you can expect from MatchUp and the standards we ask every member to follow.",
      })}
      sections={sections}
    />
  );
}

export default TermsOfService;
