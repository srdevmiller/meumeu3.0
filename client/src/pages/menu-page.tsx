import { useQuery, useMutation } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { useParams } from "wouter";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo, useEffect } from "react";
import { Search, LayoutGrid, List, Moon, Sun, Heart, Filter, Share2, CheckCheck, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";


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

type MenuData = {
  products: Product[];
  businessName: string;
  bannerImageUrl?: string;
  favorites: number[];
  themeColor?: string;
  logoUrl?: string;
};

export default function MenuPage() {
  const { businessName, id } = useParams();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("menu-theme") as "light" | "dark") || "light"
  );
  const [copied, setCopied] = useState(false);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showCompareSheet, setShowCompareSheet] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("menu-theme", theme);
  }, [theme]);

  const { data, isLoading } = useQuery<MenuData>({
    queryKey: [`/api/menu/${id}`],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/favorites", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/menu/${id}`] });
      toast({
        title: "Produto favoritado",
        description: "O produto foi adicionado aos seus favoritos!",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/menu/${id}`] });
      toast({
        title: "Produto removido",
        description: "O produto foi removido dos seus favoritos!",
      });
    },
  });

  const toggleFavorite = (productId: number) => {
    if (!user) {
      toast({
        title: "Necessário fazer login",
        description: "Faça login para favoritar produtos!",
        variant: "destructive",
      });
      return;
    }

    if (data?.favorites.includes(productId)) {
      removeFavoriteMutation.mutate(productId);
    } else {
      addFavoriteMutation.mutate(productId);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];

    return data.products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.categoryId);
      const price = Number(product.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [data?.products, search, selectedCategories, priceRange]);

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));
  };

  const themeStyles = {
    "--theme-color": data?.themeColor || "#7c3aed",
    "--theme-color-90": data?.themeColor ? `${data.themeColor}E6` : "#7c3aedE6",
  } as React.CSSProperties;

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

  const copyMenuLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copiado!",
        description: "O link do cardápio foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link do cardápio.",
        variant: "destructive",
      });
    }
  };

  const toggleCompare = (product: Product) => {
    setCompareProducts((current) => {
      const isSelected = current.some((p) => p.id === product.id);
      if (isSelected) {
        return current.filter((p) => p.id !== product.id);
      }
      if (current.length >= 3) {
        toast({
          title: "Limite atingido",
          description: "Você pode comparar até 3 produtos por vez",
          variant: "destructive",
        });
        return current;
      }
      return [...current, product];
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">
          Estabelecimento não encontrado
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background" style={themeStyles}>
        <div className="relative h-48 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {data.bannerImageUrl && (
              <img
                src={data.bannerImageUrl}
                alt={data.businessName}
                className="w-full h-full object-cover filter blur-[1px] scale-105"
              />
            )}
            <div className="absolute inset-0 bg-[var(--theme-color)]/90" />
          </div>
          <div className="z-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              {data.logoUrl && (
                <img
                  src={data.logoUrl}
                  alt={`Logo ${data.businessName}`}
                  className="w-16 h-16 object-contain bg-transparent"
                />
              )}
              <h1 className="text-4xl font-bold text-white">{data.businessName}</h1>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm relative overflow-hidden w-10 h-10"
                    onClick={(e) => {
                      createRipple(e);
                      copyMenuLink();
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Share2 className={`h-4 w-4 absolute transition-opacity duration-200 ${copied ? 'opacity-0' : 'opacity-100'}`} />
                      <CheckCheck className={`h-4 w-4 absolute text-green-500 transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copiar link do cardápio</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm relative overflow-hidden w-10 h-10"
                    onClick={(e) => {
                      createRipple(e);
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sun className={`h-4 w-4 absolute transition-opacity duration-200 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                      <Moon className={`h-4 w-4 absolute transition-opacity duration-200 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alternar tema</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Buscar</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          placeholder="Buscar produtos..."
                          className="pl-8"
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            if (showFilters) setShowFilters(false);
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Digite para buscar produtos por nome</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center gap-2 bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters ? "Ocultar filtros" : "Filtrar produtos"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para {showFilters ? 'ocultar' : 'exibir'} opções de filtro</p>
                </TooltipContent>
              </Tooltip>

              <AnimatePresence>
                {showFilters && (
                  <div
                    className="space-y-6"
                    style={{
                      opacity: 1,
                      height: "auto",
                      transition: "opacity 0.2s, height 0.2s",
                    }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Categorias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <Tooltip key={category.id}>
                              <TooltipTrigger asChild>
                                <button
                                  className="flex items-center space-x-2 min-w-[120px] hover:bg-accent/50 p-1 rounded-md"
                                  onClick={() => {
                                    setSelectedCategories(
                                      selectedCategories.includes(category.id)
                                        ? selectedCategories.filter((id) => id !== category.id)
                                        : [...selectedCategories, category.id]
                                    );
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedCategories.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      setSelectedCategories(
                                        checked
                                          ? [...selectedCategories, category.id]
                                          : selectedCategories.filter((id) => id !== category.id)
                                      );
                                    }}
                                  />
                                  <label className="text-sm font-medium leading-none cursor-pointer">
                                    {category.name}
                                  </label>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Filtrar produtos da categoria {category.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Faixa de Preço</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Slider
                                min={0}
                                max={5000}
                                step={1}
                                value={priceRange}
                                onValueChange={setPriceRange}
                                className="my-6 [&_[role=slider]]:bg-[var(--theme-color)] [&_[role=slider]]:border-[var(--theme-color)] [&_[role=slider]]:focus:ring-[var(--theme-color)]/50 [&_.track]:bg-[var(--theme-color)]"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ajuste o intervalo de preços dos produtos</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex justify-between text-sm">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} •{" "}
                  <span className="font-bold text-[var(--theme-color)]">
                    Qtd Produtos {filteredProducts.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  {compareProducts.length > 0 && (
                    <Sheet open={showCompareSheet} onOpenChange={setShowCompareSheet}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SheetTrigger asChild>
                            <Button
                              variant="default"
                              size="icon"
                              className="bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90 relative"
                            >
                              <Scale className="h-4 w-4" />
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {compareProducts.length}
                              </span>
                            </Button>
                          </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Comparar produtos selecionados</p>
                        </TooltipContent>
                      </Tooltip>
                      <SheetContent side="right" className="w-[90vw] sm:w-[600px]">
                        <SheetHeader>
                          <SheetTitle>Comparação de Produtos</SheetTitle>
                          <SheetDescription>
                            Compare as características dos produtos selecionados
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                          <div className="grid grid-cols-{compareProducts.length} gap-4">
                            {compareProducts.map((product) => (
                              <Card key={product.id}>
                                <CardHeader>
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full aspect-square object-cover rounded-md"
                                  />
                                  <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                                  <CardDescription>
                                    {categories.find((c) => c.id === product.categoryId)?.name}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-2xl font-bold text-[var(--theme-color)]">
                                    {formatPrice(product.price)}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    className="w-full mt-4"
                                    onClick={() => {
                                      toggleCompare(product);
                                      if (compareProducts.length === 1) {
                                        setShowCompareSheet(false);
                                      }
                                    }}
                                  >
                                    Remover da comparação
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualizar em grade</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualizar em lista</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div
                style={{
                  opacity: 1,
                  transition: "opacity 0.1s",
                }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                    : "flex flex-col gap-4"
                }
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      opacity: 1,
                      y: 0,
                      transition: "opacity 0.3s, y 0.3s",
                    }}
                  >
                    <Card
                      className={`overflow-hidden ${viewMode === "list" ? "flex" : ""} border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 hover:shadow-lg transition-all duration-300`}
                    >
                      <div
                        className={viewMode === "list" ? "w-48 h-48" : "aspect-square"}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-sm sm:text-base truncate">
                                {product.name}
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm">
                                <span
                                  className="inline-flex items-center rounded-full bg-[var(--theme-color)]/10 px-2 py-1 text-xs font-medium text-[var(--theme-color)]"
                                >
                                  {categories.find((c) => c.id === product.categoryId)?.name}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="flex justify-between items-center">
                            <p
                              className="text-lg sm:text-xl font-bold"
                            >
                              {formatPrice(product.price)}
                            </p>
                            <div className="flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 relative overflow-hidden ${
                                      compareProducts.some((p) => p.id === product.id)
                                        ? "bg-[var(--theme-color)]/10"
                                        : ""
                                    }`}
                                    onClick={() => toggleCompare(product)}
                                  >
                                    <Scale className={`h-4 w-4 ${
                                      compareProducts.some((p) => p.id === product.id)
                                        ? "text-[var(--theme-color)]"
                                        : "text-muted-foreground"
                                    }`} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {compareProducts.some((p) => p.id === product.id)
                                      ? "Remover da comparação"
                                      : "Adicionar à comparação"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 relative overflow-hidden"
                                  onClick={(e) => {
                                    createRipple(e);
                                    toggleFavorite(product.id);
                                  }}
                                >
                                  <div
                                    style={{
                                      scale: data?.favorites.includes(product.id) ? 1 : 1,
                                      rotate: data?.favorites.includes(product.id) ? 0 : 0,
                                      transition: "scale 0.4s ease, rotate 0.4s ease",
                                    }}
                                  >
                                    <Heart
                                      className={`h-4 w-4 transition-colors ${
                                        data?.favorites.includes(product.id)
                                          ? "fill-current text-red-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum produto encontrado com os filtros selecionados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}