import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bem-vindo, {user?.username}!</h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            disabled={logoutMutation.isPending}
          >
            Sair
          </Button>
        </div>
        <p className="text-muted-foreground">
          Você está logado com sucesso no sistema.
        </p>
      </div>
    </div>
  );
}
