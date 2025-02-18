import { Switch, Route, Redirect } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import MenuPage from "@/pages/menu-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import ProfilePage from "@/pages/profile-page";
import LandingPage from "@/pages/landing-page";
import PricingPage from "@/pages/pricing-page";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { Toaster } from "@/components/ui/toaster";

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
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/analytics" component={AnalyticsDashboard} adminOnly={true} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;