"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth/client";
import { 
  useSubscriptionPlans, 
  useCurrentSubscription, 
  useUpgradeSubscription, 
  useCancelSubscription 
} from "@/queries";
import type { SubscriptionPlan, UserSubscription } from "@/types";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  
  const { data: availablePlans = [], isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading, error: subscriptionError } = useCurrentSubscription();
  const upgradeMutation = useUpgradeSubscription();
  const cancelMutation = useCancelSubscription();

  const handleUpgrade = (planId: string) => {
    upgradeMutation.mutate(planId);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      cancelMutation.mutate();
    }
  };

  const loading = plansLoading || subscriptionLoading;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading subscription...</div>
      </div>
    );
  }

  if (plansError || subscriptionError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading subscription data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      {currentSubscription && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Plan: {currentSubscription.plan.name}</CardTitle>
            <CardDescription>
              {currentSubscription.plan.price === 0 
                ? "Free plan - no billing" 
                : `$${currentSubscription.plan.price}/${currentSubscription.plan.interval}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Plan Details</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Organizations: {currentSubscription.plan.maxOrganizations === -1 ? "Unlimited" : currentSubscription.plan.maxOrganizations}</li>
                  <li>• Members per org: {currentSubscription.plan.maxMembers === -1 ? "Unlimited" : currentSubscription.plan.maxMembers}</li>
                  <li>• Status: {currentSubscription.status}</li>
                  {currentSubscription.cancelAtPeriodEnd && (
                    <li>• Cancels at period end</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="space-y-1 text-sm">
                  {currentSubscription.plan.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            {currentSubscription.plan.plan !== "free" && (
              <div className="mt-4">
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={currentSubscription.cancelAtPeriodEnd || cancelMutation.isPending}
              >
                {cancelMutation.isPending 
                  ? "Cancelling..." 
                  : currentSubscription.cancelAtPeriodEnd 
                    ? "Cancelling at period end" 
                    : "Cancel Subscription"
                }
              </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {availablePlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              currentSubscription?.planId === plan.id 
                ? "ring-2 ring-blue-500" 
                : ""
            }`}
          >
            {currentSubscription?.planId === plan.id && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  Current Plan
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-center">{plan.name}</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">
                  ${plan.price}
                </span>
                <span className="text-gray-500">/{plan.interval}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full"
                onClick={() => handleUpgrade(plan.id)}
                disabled={currentSubscription?.planId === plan.id || upgradeMutation.isPending}
                variant={plan.plan === "enterprise" ? "default" : "outline"}
              >
                {upgradeMutation.isPending 
                  ? "Processing..." 
                  : currentSubscription?.planId === plan.id 
                    ? "Current Plan" 
                    : plan.plan === "free" 
                      ? "Downgrade" 
                      : "Upgrade"
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help choosing a plan?{" "}
          <a href="mailto:support@example.com" className="text-blue-500 hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}
