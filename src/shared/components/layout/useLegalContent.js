import { useMemo } from "react";
import { useTranslation } from "../../../i18n";

function useLegalContent() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const links = useMemo(
    () => [
      {
        to: "/privacy-policy",
        label: t("app.footer.privacy", { defaultValue: "Privacy Policy" }),
      },
      {
        to: "/terms",
        label: t("app.footer.terms", { defaultValue: "Terms of Service" }),
      },
      {
        to: "/pricing",
        label: t("app.footer.pricing", { defaultValue: "Pricing" }),
      },
      {
        to: "/help",
        label: t("app.footer.help", { defaultValue: "Help Centre" }),
      },
    ],
    [t]
  );

  const tagline = t("app.footer.tagline", {
    defaultValue: "Guiding Sri Lankan singles with care and respect.",
  });

  const copyright = t("app.footer.copyright", {
    defaultValue: "© {{year}} MatchUp. All rights reserved.",
    year,
  });

  return { links, tagline, copyright };
}

export default useLegalContent;
