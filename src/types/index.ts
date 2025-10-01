export interface SubscriptionPlan {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  price: number;
  currency: string;
  interval: "month" | "year";
  maxOrganizations: number;
  maxMembers: number;
  features: readonly string[];
  stripePriceId: string | null;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "inactive" | "cancelled" | "past_due";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt: string;
  metadata?: any;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}