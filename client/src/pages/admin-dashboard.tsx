import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
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
import { Users, Package, LogOut, Pencil, Search, Eye, BarChart } from "lucide-react";
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
  totalVisits: number;
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

// Add payment settings schema
const paymentSettingsSchema = z.object({
  clientSecret: z.string().min(1, "Client Secret é obrigatório"),
  accessToken: z.string().min(1, "Access Token é obrigatório"),
});

type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  useSessionTimeout();
  const [editingUser, setEditingUser] = useState<DashboardStats["users"][0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add payment settings query
  const { data: paymentSettings } = useQuery({
    queryKey: ["/api/admin/payment-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/payment-settings");
      if (!response.ok) throw new Error("Failed to fetch payment settings");
      return response.json();
    },
    enabled: !!user && user.username === "admin@admin.com",
  });

  // Add payment settings mutation
  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async (data: PaymentSettingsFormData) => {
      const response = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Falha ao salvar configurações de pagamento");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configurações de pagamento atualizadas com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar configurações de pagamento",
        variant: "destructive",
      });
    },
  });

  // Add payment settings form
  const paymentForm = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      clientSecret: "",
      accessToken: "",
    },
  });

  // Load existing payment settings
  useEffect(() => {
    if (paymentSettings) {
      paymentForm.reset({
        clientSecret: paymentSettings.clientSecret || "",
        accessToken: paymentSettings.accessToken || "",
      });
    }
  }, [paymentSettings, paymentForm]);

  const handlePaymentSettingsSubmit = (data: PaymentSettingsFormData) => {
    updatePaymentSettingsMutation.mutate(data);
  };

  // ... rest of the original code ...

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

  useEffect(() => {
    console.log("AdminDashboard - Auth state:", {
      user,
      authLoading,
      isAdmin: user?.username === "admin@admin.com"
    });
  }, [user, authLoading]);

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
        <h1 className="text-4xl font-bold text-foreground">Painel de controle</h1>
        <div className="flex gap-4">
          <Link href="/admin/analytics">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Análise de Engajamento
            </Button>
          </Link>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
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

      {/* Payment Settings Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-foreground">Configurações de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handlePaymentSettingsSubmit)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="clientSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Client Secret</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="accessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Access Token</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={updatePaymentSettingsMutation.isPending}
                className="w-full"
              >
                {updatePaymentSettingsMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Log de Atividades */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-foreground">Log de Atividades</CardTitle>
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
                  <TableHead className="text-foreground">Data</TableHead>
                  <TableHead className="text-foreground">Ação</TableHead>
                  <TableHead className="text-foreground">Detalhes</TableHead>
                  <TableHead className="text-foreground">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsData?.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-foreground">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-foreground">{log.action}</TableCell>
                    <TableCell className="text-foreground">{log.details}</TableCell>
                    <TableCell className="text-foreground">{log.ipAddress}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Clientes:</CardTitle>
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
                <TableHead className="text-foreground">Cliente</TableHead>
                <TableHead className="text-foreground">Telefone</TableHead>
                <TableHead className="text-foreground">email</TableHead>
                <TableHead className="text-foreground">id</TableHead>
                <TableHead className="text-right text-foreground">Qtd produtos</TableHead>
                <TableHead className="w-[100px] text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-foreground">{user.businessName}</TableCell>
                  <TableCell className="text-foreground">{user.phone}</TableCell>
                  <TableCell className="text-foreground">{user.username}</TableCell>
                  <TableCell className="text-foreground">{user.id}</TableCell>
                  <TableCell className="text-right text-foreground">{user.product_count}</TableCell>
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
                          <DialogTitle className="text-foreground">Editar Cliente</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="businessName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground">Nome do Estabelecimento</FormLabel>
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
                                  <FormLabel className="text-foreground">Telefone</FormLabel>
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
                                  <FormLabel className="text-foreground">Email</FormLabel>
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