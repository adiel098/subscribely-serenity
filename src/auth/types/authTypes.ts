
import { User } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isLoading: boolean; // Adding this property to match usage
  signOut: () => Promise<void>;
};
