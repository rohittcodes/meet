import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllPlans, getPlanById } from "@/lib/subscription-plans";
import type { SubscriptionPlan, UserSubscription } from "@/types";

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      // static plans
      return getAllPlans();
    },
    staleTime: Infinity, // static data, never stale
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ["current-subscription"],
    queryFn: async (): Promise<UserSubscription | null> => {
      const response = await fetch("/api/subscription/current");
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch subscription");
      }
      
      if (!data.subscription) {
        return null;
      }
      
      // static config
      const plan = getPlanById(data.subscription.planId);
      if (!plan) {
        throw new Error("Invalid subscription plan");
      }
      
      return {
        id: data.subscription.id,
        userId: data.subscription.userId,
        planId: data.subscription.planId,
        status: data.subscription.status,
        currentPeriodStart: data.subscription.currentPeriodStart,
        currentPeriodEnd: data.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd,
        plan: plan,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpgradeSubscription() {
  return {
    mutate: (planId: string) => {
      const plan = getPlanById(planId);
      toast.info(`Subscription upgrades coming soon! You'll be able to upgrade to ${plan?.name || planId} plan.`);
    },
    isPending: false,
  };
}

export function useCancelSubscription() {
  return {
    mutate: () => {
      toast.info("Subscription management coming soon! You'll be able to cancel your subscription through the billing portal.");
    },
    isPending: false,
  };
}
