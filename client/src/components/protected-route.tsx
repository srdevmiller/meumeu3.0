import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const { user } = useAuth();

  return (
    <Route
      path={path}
      component={() => (user ? <Component /> : <Redirect to="/auth" />)}
    />
  );
}
