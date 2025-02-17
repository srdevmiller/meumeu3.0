import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import MenuPage from "@/pages/menu-page";
import AdminDashboard from "@/pages/admin-dashboard";
import ProfilePage from "@/pages/profile-page";
import LandingPage from "@/pages/landing-page";
import PricingPage from "@/pages/pricing-page";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

// Separate component for root route to avoid conditional hook usage
function RootRoute() {
  const { user } = useAuth();
  return user ? <HomePage /> : <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/menu/:businessName/:id" component={MenuPage} />
      <Route path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;