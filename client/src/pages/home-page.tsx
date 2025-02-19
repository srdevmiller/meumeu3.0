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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { motion } from 'framer-motion'; // Import motion

const categories = [
  { id: 1, name: "Bebidas" },
  { id: 2, name: "Alimentos" },
  { id: 3, name: "Tabacaria" },
  { id: 4, name: "Destilados" },
  { id: 5, name: "Cervejas" },
  { id: 6, name: "Vinhos" },
  { id: 7, name: "Petiscos" },
  { id: 8, name: "Porções" },
  { id: 9, name: "Drinks" },
  { id: 10, name: "Sobremesas" },
  { id: 11, name: "Outros" },
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

        // Configurar o canvas para preservar transparência
        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Verificar se é PNG para manter a transparência
        const isPNG = file.type === 'image/png';
        const dataUrl = canvas.toDataURL(isPNG ? 'image/png' : 'image/jpeg', 0.9);
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { businessName: string; phone: string; themeColor: string; logoUrl: string }) => {
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
      themeColor: user?.themeColor || "#7c3aed",
      logoUrl: user?.logoUrl || "", // Add default value for logoUrl
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        businessName: user.businessName,
        phone: user.phone,
        themeColor: user.themeColor || "#7c3aed",
        logoUrl: user.logoUrl || "", // Add logoUrl to reset
      });
    }
  }, [user]);

  // Array de cores predefinidas
  const predefinedColors = [
    "#7c3aed", // Roxo
    "#ef4444", // Vermelho
    "#f97316", // Laranja
    "#84cc16", // Verde
    "#06b6d4", // Ciano
    "#3b82f6", // Azul
    "#ec4899", // Rosa
  ];

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();

    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.className = "ripple";

    const existingRipple = button.getElementsByClassName("ripple")[0];
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
    },
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
  };

  const sortedProducts = products.sort((a, b) => b.id - a.id); // Sort products by ID in descending order

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
          <motion.div whileTap={{ scale: 0.95 }}>
            <Link href="/profile">
              <Button
                variant="outline"
                className="relative overflow-hidden"
                onClick={createRipple}
              >
                <Settings className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Link href={`/menu/${encodeURIComponent(user?.businessName || '')}/${user?.id}`}>
              <Button
                variant="outline"
                className="relative overflow-hidden"
                onClick={createRipple}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Cardápio Público
              </Button>
            </Link>
          </motion.div>
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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

          {/* Products Section */}
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
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className={viewMode === "grid"
                    ? "grid grid-cols-2 gap-3 md:gap-4"
                    : "flex flex-col gap-4"}
                >
                  {sortedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={item}
                      className={`relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 ${
                        viewMode === "list"
                          ? "flex items-center"
                          : ""
                      } border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 hover:shadow-lg transition-all duration-300`}
                    >
                      <div className={viewMode === "list" ? "w-36 sm:w-48 h-full flex-shrink-0" : "aspect-square"}>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={viewMode === "list" ? "flex-1 flex flex-col p-3 sm:p-4" : "p-3"}>
                        <div className="flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-base font-semibold break-words max-h-[2.8rem] overflow-hidden">
                                {product.name}
                              </h3>
                              <span className="inline-flex items-center rounded-full bg-[var(--theme-color)]/10 px-2 py-1 text-xs font-medium text-[var(--theme-color)]">
                                {categories.find((c) => c.id === product.categoryId)?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex ${viewMode === "list" ? "flex-col" : "flex-col"} mt-auto pt-2`}>
                          <p className="text-base font-bold mb-2">
                            R$ {Number(product.price).toFixed(2)}
                          </p>
                          <div className={`flex gap-2 ${viewMode === "list" ? "flex-row" : "flex-col w-full"}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className={viewMode === "list" ? "flex-1" : "w-full"}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setProductToDelete(product)}
                              className={`text-red-500 hover:text-red-600 ${viewMode === "list" ? "flex-1" : "w-full"}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
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

<style jsx global>{`
  .ripple {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 600ms linear;
    background-color: rgba(255, 255, 255, 0.7);
  }

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  .button-hover {
    transition: transform 0.2s ease;
  }

  .button-hover:hover {
    transform: translateY(-2px);
  }
`}</style>