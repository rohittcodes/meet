export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    plan: "free" as const,
    price: 0,
    currency: "USD",
    interval: "month" as const,
    maxOrganizations: 1,
    maxMembers: 5,
    features: [
      "1 Organization",
      "Up to 5 members",
      "Basic support",
      "Standard features"
    ],
    stripePriceId: null,
  },
  PRO: {
    id: "pro",
    name: "Pro",
    plan: "pro" as const,
    price: 29,
    currency: "USD",
    interval: "month" as const,
    maxOrganizations: 10,
    maxMembers: 50,
    features: [
      "Up to 10 Organizations",
      "Up to 50 members per org",
      "Priority support",
      "Advanced features",
      "Custom branding",
      "API access"
    ],
    stripePriceId: "price_pro_monthly",
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    plan: "enterprise" as const,
    price: 99,
    currency: "USD",
    interval: "month" as const,
    maxOrganizations: -1, // Unlimited
    maxMembers: -1, // Unlimited
    features: [
      "Unlimited Organizations",
      "Unlimited members",
      "24/7 support",
      "All features",
      "Custom integrations",
      "SSO",
      "Audit logs",
      "Dedicated account manager"
    ],
    stripePriceId: "price_enterprise_monthly",
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[SubscriptionPlanId];

export function getPlanById(planId: string): SubscriptionPlan | null {
  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
  return plan || null;
}

export function getPlanByType(planType: "free" | "pro" | "enterprise"): SubscriptionPlan | null {
  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.plan === planType);
  return plan || null;
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}
