import React, { useMemo } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import StaticPageLayout from "../ui/layouts/StaticPageLayout";
import FeatureCard from "../../../shared/components/FeatureCard";
import { useTranslation } from "../../../i18n";

function Pricing() {
  const { t } = useTranslation();

  const plans = useMemo(
    () => [
      {
        name: t("static.pricing.free.name", { defaultValue: "Community" }),
        price: t("static.pricing.free.price", { defaultValue: "Free" }),
        description: t("static.pricing.free.description", {
          defaultValue: "Create a profile, browse members, and send limited connection requests each month.",
        }),
        features: [
          t("static.pricing.free.features.profile", {
            defaultValue: "Complete profile builder with cultural preferences",
          }),
          t("static.pricing.free.features.requests", {
            defaultValue: "Send up to 5 introduction requests per month",
          }),
          t("static.pricing.free.features.security", {
            defaultValue: "Community verification and safety resources",
          }),
        ],
      },
      {
        name: t("static.pricing.premium.name", { defaultValue: "Premium" }),
        price: t("static.pricing.premium.price", { defaultValue: "LKR 4,900 / month" }),
        description: t("static.pricing.premium.description", {
          defaultValue: "Ideal for members who want more visibility and unlimited introductions.",
        }),
        features: [
          t("static.pricing.premium.features.unlimited", {
            defaultValue: "Unlimited introduction requests and message replies",
          }),
          t("static.pricing.premium.features.priority", {
            defaultValue: "Priority placement in match recommendations",
          }),
          t("static.pricing.premium.features.insights", {
            defaultValue: "Detailed compatibility insights and profile analytics",
          }),
        ],
      },
      {
        name: t("static.pricing.elite.name", { defaultValue: "Elite Concierge" }),
        price: t("static.pricing.elite.price", { defaultValue: "Starting at LKR 24,900 / month" }),
        description: t("static.pricing.elite.description", {
          defaultValue: "A dedicated relationship advisor for families seeking a guided matchmaking experience.",
        }),
        features: [
          t("static.pricing.elite.features.advisor", {
            defaultValue: "Personal advisor who curates introductions and coordinates meetings",
          }),
          t("static.pricing.elite.features.family", {
            defaultValue: "Family consultations to align expectations and preferences",
          }),
          t("static.pricing.elite.features.events", {
            defaultValue: "Invitations to private community gatherings and cultural events",
          }),
        ],
      },
    ],
    [t]
  );

  const sections = useMemo(
    () => [
      {
        heading: t("static.pricing.faq.heading", {
          defaultValue: "Frequently asked questions",
        }),
        content: [
          t("static.pricing.faq.billing", {
            defaultValue:
              "Plans renew automatically, and you can switch or cancel anytime from your account. We will send a reminder before each renewal.",
          }),
          t("static.pricing.faq.support", {
            defaultValue:
              "Need help choosing the right plan? Email premium@matchup.lk and our advisors will guide you.",
          }),
        ],
      },
    ],
    [t]
  );

  return (
    <StaticPageLayout
      title={t("static.pricing.title", { defaultValue: "Membership Pricing" })}
      description={t("static.pricing.description", {
        defaultValue:
          "Choose the level of support that fits your journey. You can upgrade or downgrade at any time.",
      })}
      sections={sections}
    >
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.name}>
            <FeatureCard
              divider={false}
              sx={{ height: "100%" }}
              contentProps={{ sx: { display: "flex", flexDirection: "column", gap: 2 } }}
            >
              <div>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {plan.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {plan.price}
                </Typography>
              </div>
              <Typography variant="body2" color="text.secondary">
                {plan.description}
              </Typography>
              <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0 }}>
                {plan.features.map((feature, index) => (
                  <Typography key={`${plan.name}-feature-${index}`} component="li" variant="body2" color="text.secondary">
                    {feature}
                  </Typography>
                ))}
              </Stack>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>
    </StaticPageLayout>
  );
}

export default Pricing;
