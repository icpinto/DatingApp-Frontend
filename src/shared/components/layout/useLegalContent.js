import { useMemo } from "react";
import { useTranslation } from "../../../i18n";

function useLegalContent() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const sections = useMemo(
    () => [
      {
        id: "privacy",
        title: t("profile.legal.sections.privacy.title", {
          defaultValue: "Privacy safeguards",
        }),
        summary: t("profile.legal.sections.privacy.summary", {
          defaultValue:
            "Understand how we protect your personal data and keep your matches secure.",
        }),
        body: [
          t("profile.legal.sections.privacy.body.1", {
            defaultValue:
              "We collect only the details needed to personalise your experience and never sell your information to advertisers.",
          }),
          t("profile.legal.sections.privacy.body.2", {
            defaultValue:
              "You can download or delete your data at any time from the privacy controls in your account settings.",
          }),
        ],
      },
      {
        id: "terms",
        title: t("profile.legal.sections.terms.title", {
          defaultValue: "Fair play guidelines",
        }),
        summary: t("profile.legal.sections.terms.summary", {
          defaultValue:
            "Review the community standards that keep conversations respectful and genuine.",
        }),
        body: [
          t("profile.legal.sections.terms.body.1", {
            defaultValue:
              "MatchUp expects every member to engage honestly, avoid harassment, and follow local laws while using the app.",
          }),
          t("profile.legal.sections.terms.body.2", {
            defaultValue:
              "Violations may lead to content removal or account suspension so that everyone feels safe exploring connections.",
          }),
        ],
      },
      {
        id: "pricing",
        title: t("profile.legal.sections.pricing.title", {
          defaultValue: "Membership options",
        }),
        summary: t("profile.legal.sections.pricing.summary", {
          defaultValue:
            "See what is included in our free plan and how premium upgrades enhance your reach.",
        }),
        body: [
          t("profile.legal.sections.pricing.body.1", {
            defaultValue:
              "The free experience lets you browse profiles, send likes, and start conversations with compatible matches.",
          }),
          t("profile.legal.sections.pricing.body.2", {
            defaultValue:
              "Premium tiers add weekly spotlights, unlimited rewinds, and priority support with transparent monthly billing.",
          }),
        ],
      },
      {
        id: "support",
        title: t("profile.legal.sections.support.title", {
          defaultValue: "Support and safety",
        }),
        summary: t("profile.legal.sections.support.summary", {
          defaultValue:
            "Learn how to get help from our Sri Lanka-based team whenever you need assistance.",
        }),
        body: [
          t("profile.legal.sections.support.body.1", {
            defaultValue:
              "Browse curated safety tips, contact our moderators, or report concerns directly from any conversation.",
          }),
          t("profile.legal.sections.support.body.2", {
            defaultValue:
              "We respond to urgent issues 24/7 and typically resolve general questions within one business day.",
          }),
        ],
      },
    ],
    [t]
  );

  const tagline = t("app.footer.tagline", {
    defaultValue: "Guiding Sri Lankan singles with care and respect.",
  });

  const links = useMemo(
    () => [
      {
        to: "/privacy-policy",
        label: t("app.footer.links.privacy", {
          defaultValue: "Privacy",
        }),
      },
      {
        to: "/terms",
        label: t("app.footer.links.terms", {
          defaultValue: "Terms",
        }),
      },
      {
        to: "/pricing",
        label: t("app.footer.links.pricing", {
          defaultValue: "Pricing",
        }),
      },
      {
        to: "/help",
        label: t("app.footer.links.support", {
          defaultValue: "Help Center",
        }),
      },
    ],
    [t]
  );

  const copyright = t("app.footer.copyright", {
    defaultValue: "© {{year}} MatchUp. All rights reserved.",
    year,
  });

  return { sections, tagline, links, copyright };
}

export default useLegalContent;
