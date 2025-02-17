import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

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
  const { user, isLoading } = useAuth();

  // Debug logs
  useEffect(() => {
    console.log("ProtectedRoute - Auth state:", {
      path,
      adminOnly,
      user,
      isLoading,
      isAdmin: user?.username === "admin@admin.com"
    });
  }, [path, adminOnly, user, isLoading]);

  return (
    <Route
      path={path}
      component={() => {
        // Aguarda o carregamento da autenticação
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          );
        }

        // Se não houver usuário, redireciona para login
        if (!user) {
          console.log("Protected route: no user, redirecting to auth");
          return <Redirect to="/auth" />;
        }

        // Se a rota for apenas para admin, verifica se é admin
        if (adminOnly && user.username !== "admin@admin.com") {
          console.log("Protected route: user is not admin, redirecting to home");
          return <Redirect to="/" />;
        }

        // Se passou pelas verificações, renderiza o componente
        return <Component />;
      }}
    />
  );
}