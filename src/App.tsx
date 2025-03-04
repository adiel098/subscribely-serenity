
import AppRoutes from "@/routes/AppRoutes";
import { AppProviders } from "@/providers/AppProviders";

const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

export default App;
