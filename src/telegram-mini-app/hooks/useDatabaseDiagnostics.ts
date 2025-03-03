
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type DiagnosticsAction = 
  | 'check_user_exists' 
  | 'check_user_payments' 
  | 'table_info'
  | 'check_plan_details';

interface DiagnosticsParams {
  action: DiagnosticsAction;
  telegram_user_id?: string;
  table_name?: string;
  plan_id?: string;
}

export const useDatabaseDiagnostics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async (params: DiagnosticsParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Running diagnostics: ${params.action}`, params);
      
      const { data, error } = await supabase.functions.invoke('database-diagnostics', {
        body: params,
      });
      
      if (error) {
        console.error('Error running diagnostics:', error);
        throw error;
      }
      
      console.log('Diagnostics results:', data);
      setResults(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Failed to run diagnostics:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    runDiagnostics,
    isLoading,
    results,
    error,
  };
};
