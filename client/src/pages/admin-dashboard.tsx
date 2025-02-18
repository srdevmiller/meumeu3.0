import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Package, LogOut, Pencil, Search, Eye } from "lucide-react"; // Added Eye import
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

type DashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalVisits: number;  // Add this line
  users: {
    id: number;
    username: string;
    businessName: string;
    phone: string;
    product_count: number;
  }[];
};

type AdminLog = {
  id: number;
  userId: number;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
};

type LogsResponse = {
  logs: AdminLog[];
  total: number;
};

// Schema para validação do formulário de edição
const editUserSchema = z.object({
  username: z.string().email("Email inválido"),
  businessName: z.string().min(1, "Nome do estabelecimento é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
});

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  useSessionTimeout();
  const [editingUser, setEditingUser] = useState<DashboardStats["users"][0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Debug logs para acompanhar o estado da autenticação
  useEffect(() => {
    console.log("AdminDashboard - Auth state:", {
      user,
      authLoading,
      isAdmin: user?.username === "admin@admin.com"
    });
  }, [user, authLoading]);

  // Aguarda o carregamento da autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redireciona se não estiver autenticado
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Verifica se é admin
  if (user.username !== "admin@admin.com") {
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive",
    });
    return <Redirect to="/" />;
  }

  const { data: statsData, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: logsData, isLoading: isLoadingLogs } = useQuery<LogsResponse>({
    queryKey: ["/api/admin/logs"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number, username: string, businessName: string, phone: string }) => {
      const { id, ...userData } = data;
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, userData);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Falha ao atualizar usuário');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      businessName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        username: editingUser.username,
        businessName: editingUser.businessName,
        phone: editingUser.phone,
      });
    }
  }, [editingUser, form]);

  const handleEditSubmit = (data: z.infer<typeof editUserSchema>) => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        ...data,
      });
    }
  };

  // Função para filtrar usuários baseado na busca
  const filterUsers = (users: DashboardStats["users"]) => {
    if (!searchQuery) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.businessName.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.phone.includes(query)
    );
  };

  if (isLoadingStats || isLoadingLogs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Erro ao carregar dados
        </h1>
        <Button onClick={logout}>Fazer login novamente</Button>
      </div>
    );
  }

  const filteredUsers = filterUsers(statsData.users);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Painel de controle</h1>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8"> {/* Changed to grid-cols-3 */}
        <Card className="bg-purple-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Clientes</CardTitle>
            <Users className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">{statsData.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Produtos</CardTitle>
            <Package className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">{statsData.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Visitas</CardTitle>
            <Eye className="h-6 w-6 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold">{statsData.totalVisits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Log de Atividades */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Log de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsData?.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes:</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search input */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>email</TableHead>
                <TableHead>id</TableHead>
                <TableHead className="text-right">Qtd produtos</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.businessName}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="text-right">{user.product_count}</TableCell>
                  <TableCell>
                    <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Cliente</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="businessName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Estabelecimento</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefone</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={updateUserMutation.isPending}
                              >
                                {updateUserMutation.isPending ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                ) : (
                                  "Salvar"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}