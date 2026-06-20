"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface SubscriptionContextType {
  subscription: any;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  refresh: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<any>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.subscriptions.current();
      setSubscription(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SubscriptionContext.Provider value={{ subscription, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
