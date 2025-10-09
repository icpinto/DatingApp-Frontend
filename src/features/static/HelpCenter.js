import React, { useMemo } from "react";
import StaticPageLayout from "./StaticPageLayout";
import { useTranslation } from "../../i18n";

function HelpCenter() {
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      {
        heading: t("static.help.gettingStarted.heading", {
          defaultValue: "Getting started",
        }),
        content: [
          t("static.help.gettingStarted.profile", {
            defaultValue:
              "Complete your profile with clear photos, a warm introduction, and details about your background. Profiles with more detail receive significantly better responses.",
          }),
          t("static.help.gettingStarted.discovery", {
            defaultValue:
              "Use filters such as language, location, and lifestyle preferences to discover members who align with your goals.",
          }),
        ],
      },
      {
        heading: t("static.help.safety.heading", {
          defaultValue: "Staying safe",
        }),
        content: [
          t("static.help.safety.tips", {
            defaultValue:
              "Keep conversations on MatchUp until you feel comfortable sharing personal contact details. Arrange first meetings in public places and let someone you trust know your plans.",
          }),
          t("static.help.safety.report", {
            defaultValue:
              "If you encounter inappropriate behaviour, report it directly from the member profile or email safety@matchup.lk. Our team investigates every report.",
          }),
        ],
      },
      {
        heading: t("static.help.support.heading", {
          defaultValue: "Need more support?",
        }),
        content: [
          t("static.help.support.channels", {
            defaultValue:
              "Visit our Support Centre within the app for quick answers, or email support@matchup.lk for personalised assistance.",
          }),
          t("static.help.support.hours", {
            defaultValue:
              "We respond to emails Monday to Friday, 9:00 AM – 6:00 PM Sri Lanka Standard Time.",
          }),
        ],
      },
    ],
    [t]
  );

  return (
    <StaticPageLayout
      title={t("static.help.title", { defaultValue: "Help Centre" })}
      description={t("static.help.description", {
        defaultValue:
          "Find answers to common questions and learn how to get the most out of your MatchUp experience.",
      })}
      sections={sections}
    />
  );
}

export default HelpCenter;
