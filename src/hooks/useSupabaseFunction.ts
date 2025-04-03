import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UseFunctionResult<T> {
  loading: boolean;
  error: Error | null;
  execute: (payload?: object) => Promise<T | null>;
}

export function useSupabaseFunction<T = any>(functionName: string): UseFunctionResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const execute = async (payload: object = {}): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://gagzfzcfrezfurwhdbhj.supabase.co/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZ3pmemNmcmV6ZnVyd2hkYmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzM2NDYsImV4cCI6MjA1OTEwOTY0Nn0.ICm3PZQo51XxH88B-Vtwt7jp1vaHJyIbuEyDdYX4kL0`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          userId: user?.id
        }),
      });

      const text = await response.text();
      console.log(`Edge Function status: ${response.status}`);
      console.log(`Edge Function response: ${text}`);

      if (!response.ok) {
        throw new Error(`Edge Function failed with status ${response.status}: ${text}`);
      }

      const data = JSON.parse(text);
      return data;
    } catch (err: any) {
      console.error(`Error calling ${functionName}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
}