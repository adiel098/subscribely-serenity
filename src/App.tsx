import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { RouterConfig } from "./router";
import { AuthProvider } from "@/hooks/useAuth";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterConfig />
        <Toaster />
        <SonnerToaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
