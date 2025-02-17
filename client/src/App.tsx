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
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {user ? <HomePage /> : <Redirect to="/auth" />}
      </Route>
      <Route path="/auth" component={AuthPage} />
      <Route path="/menu/:businessName/:id" component={MenuPage} />
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