import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import { useState, useEffect } from "react";
import { Upload, Pencil, Trash2, Loader2, Settings, Image, ExternalLink, Plus, LayoutGrid, List } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDescriptionDialog,
  DialogHeader as DialogHeaderDialog,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = [
  { id: 1, name: "Bebidas" },
  { id: 2, name: "Alimentos" },
  { id: 3, name: "Tabacaria" },
];

const MAX_IMAGE_SIZE = 800; // pixels

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar se a imagem for muito grande
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_IMAGE_SIZE;
            width = MAX_IMAGE_SIZE;
          } else {
            width = (width / height) * MAX_IMAGE_SIZE;
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade reduzida
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      imageUrl: "",
      categoryId: 0,
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const optimizedImageUrl = await resizeImage(file);
        setImagePreview(optimizedImageUrl);
        form.setValue("imageUrl", optimizedImageUrl);
      } catch (error) {
        toast({
          title: "Erro ao processar imagem",
          description: "Não foi possível processar a imagem selecionada",
          variant: "destructive",
        });
      }
    }
  };

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto criado",
        description: "O produto foi publicado com sucesso!",
      });
      form.reset();
      setImagePreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: InsertProduct & { id: number }) => {
      const { id, ...product } = data;
      const res = await apiRequest("PATCH", `/api/products/${id}`, product);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Falha ao atualizar produto');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso!",
      });
      setEditingProduct(null);
      form.reset();
      setImagePreview(null);
      setShowPublishForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso!",
      });
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowPublishForm(true); // Mostra o formulário quando editar
    form.reset({
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
    });
    setImagePreview(product.imageUrl);
  };

  const handleSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      // Garantir que o ID do produto está sendo passado corretamente
      updateProductMutation.mutate({ 
        ...data, 
        id: editingProduct.id 
      });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { businessName: string; phone: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Perfil atualizado",
        description: "As informações foram atualizadas com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const profileForm = useForm({
    defaultValues: {
      businessName: user?.businessName || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        businessName: user.businessName,
        phone: user.phone,
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[25px] font-medium">
            Bem-vindo, {user?.businessName}!
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={logoutMutation.isPending}
          >
            Sair
          </Button>
        </div>

        <div className="flex gap-2 mb-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeaderDialog>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescriptionDialog>
                  Atualize as informações do seu estabelecimento
                </DialogDescriptionDialog>
              </DialogHeaderDialog>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit((data) =>
                    updateProfileMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
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
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar Alterações
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  try {
                    const optimizedImageUrl = await resizeImage(file);
                    const res = await apiRequest("PATCH", "/api/user/banner", {
                      bannerImageUrl: optimizedImageUrl,
                    });
                    if (res.ok) {
                      toast({
                        title: "Banner atualizado",
                        description: "A imagem de fundo do seu cardápio foi atualizada com sucesso!",
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                    }
                  } catch (error) {
                    toast({
                      title: "Erro ao atualizar banner",
                      description: "Não foi possível atualizar a imagem de fundo",
                      variant: "destructive",
                    });
                  }
                }
              };
              input.click();
            }}
          >
            <Image className="w-4 h-4 mr-2" />
            Imagem de Fundo
          </Button>

          <Link href={`/menu/${user?.id}`}>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Cardápio Público
            </Button>
          </Link>
        </div>

        <Button
          variant="default"
          onClick={() => setShowPublishForm(!showPublishForm)}
          className="mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          {showPublishForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingProduct ? "Editar Produto" : "Publicar Produto"}
                </CardTitle>
                <CardDescription>
                  {editingProduct
                    ? "Atualize os dados do produto"
                    : "Preencha os dados do produto que deseja publicar"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                              <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <span className="mt-2 text-sm text-muted-foreground">
                            Clique para upload
                          </span>
                        </label>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Produto</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome do produto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field: { onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Preço</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              onChange={(e) => onChange(Number(e.target.value))}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={() => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <div className="grid grid-cols-3 gap-4">
                            {categories.map((category) => (
                              <FormField
                                key={category.id}
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value === category.id}
                                        onCheckedChange={() =>
                                          field.onChange(category.id)
                                        }
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {category.name}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 mt-8">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={
                          createProductMutation.isPending ||
                          updateProductMutation.isPending
                        }
                      >
                        {(createProductMutation.isPending ||
                          updateProductMutation.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingProduct ? "Atualizar" : "Publicar"} Produto
                      </Button>
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(null);
                            form.reset();
                            setImagePreview(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card className={showPublishForm ? "" : "md:col-span-2"}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Produtos Publicados</CardTitle>
                  <CardDescription>
                    Gerencie seus produtos publicados
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nenhum produto publicado ainda.
                </p>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-3"
                    : "grid-cols-1"
                }`}>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`flex ${viewMode === "list" ? "items-center" : "flex-col"} gap-4 p-4 border rounded-lg`}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`${
                          viewMode === "list"
                            ? "w-16 h-16"
                            : "w-full aspect-square"
                        } object-cover rounded`}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          R$ {Number(product.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {categories.find((c) => c.id === product.categoryId)?.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          {user?.businessName} - ID#{user?.id}
        </footer>

        <AlertDialog
          open={productToDelete !== null}
          onOpenChange={() => setProductToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir produto</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o produto "{productToDelete?.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (productToDelete) {
                    deleteProductMutation.mutate(productToDelete.id);
                  }
                }}
              >
                {deleteProductMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}