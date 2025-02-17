import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  adminOnly?: boolean;
}

export function ProtectedRoute({ 
  component: Component, 
  path,
  adminOnly = false 
}: ProtectedRouteProps) {
  const { user } = useAuth();

  return (
    <Route
      path={path}
      component={() => {
        // Se não houver usuário, redireciona para login
        if (!user) {
          console.log("Protected route: no user, redirecting to auth");
          return <Redirect to="/auth" />;
        }

        // Se a rota for apenas para admin, verifica se é admin
        if (adminOnly && user.username !== "admin-miller@gmail.com") {
          console.log("Protected route: user is not admin, redirecting to home");
          return <Redirect to="/" />;
        }

        // Se passou pelas verificações, renderiza o componente
        return <Component />;
      }}
    />
  );
}