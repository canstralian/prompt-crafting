import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getTierByProductId, type StripeTier } from "@/lib/stripe";

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  tier: StripeTier | null;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    tier: null,
    isLoading: false,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({
        subscribed: false,
        productId: null,
        subscriptionEnd: null,
        tier: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    setState({
      subscribed: false,
      productId: null,
      subscriptionEnd: null,
      tier: null,
      isLoading: false,
      error: null,
    });
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    ...state,
    refetch: checkSubscription,
  };
}
