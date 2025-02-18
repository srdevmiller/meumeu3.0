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
import { Search, LayoutGrid, List, Moon, Sun, Heart, Filter, Share2, CheckCheck, Scale, ArrowUp01, ArrowDown01 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import { SuggestionsWidget } from "@/components/ui/suggestions-widget";
import {SuggestionType} from "@/types/suggestion";


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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

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

  const sortedProducts = useMemo(() => {
    if (!sortOrder) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.price);
      const priceB = Number(b.price);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });
  }, [filteredProducts, sortOrder]);

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

  const createRipple = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    const element = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = element.getBoundingClientRect();

    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.className = "ripple";

    const existingRipple = element.getElementsByClassName("ripple")[0];
    if (existingRipple) {
      existingRipple.remove();
    }

    element.appendChild(ripple);

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

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted rounded-lg aspect-square mb-2"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSkeleton />
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
    <TooltipProvider delayDuration={150}>
      <motion.div
        className="min-h-screen bg-background motion-safe"
        style={themeStyles}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="relative h-48 flex items-center justify-center overflow-hidden motion-safe"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
        </motion.div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[300px_1fr] gap-8 grid-container">
            <motion.div
              className="space-y-6 motion-safe"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
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
                      <TooltipContent side="right" align="center">
                        <p>Digite para buscar produtos por nome</p>
                        <p className="text-xs text-muted-foreground mt-1">A busca é atualizada automaticamente enquanto você digita</p>
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
                <TooltipContent side="right" align="center">
                  <p>Clique para {showFilters ? 'ocultar' : 'exibir'} opções de filtro</p>
                  <p className="text-xs text-muted-foreground mt-1">Filtre por categoria e faixa de preço</p>
                </TooltipContent>
              </Tooltip>

              <AnimatePresence>
                {showFilters && (
                  <div
                    className="space-y-6 filter-transition"
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
                                  className="flex items-center space-x-2 min-w-[120px] hover:bg-accent/50 p-1 rounded-md category-pill"
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
                              <TooltipContent side="right">
                                <p>Filtrar produtos da categoria {category.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">Clique para {selectedCategories.includes(category.id) ? 'remover' : 'adicionar'} o filtro</p>
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
                                className="my-6 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-[var(--theme-color)] [&_[role=slider]]:border-2 [&_[role=slider]]:border-background [&_[role=slider]]:shadow-sm [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:transition-transform [&_[role=slider]]:focus:ring-2 [&_[role=slider]]:focus:ring-[var(--theme-color)]/50 [&_.range]:bg-[var(--theme-color)] [&_.track]:bg-muted"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Ajuste o intervalo de preços dos produtos</p>
                            <p className="text-xs text-muted-foreground mt-1">Arraste os controles para definir o preço mínimo e máximo</p>
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
            </motion.div>

            <motion.div
              className="motion-safe"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm">
                  <span className="font-bold text-[var(--theme-color)]">
                    Qtd Produtos {filteredProducts.length}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={sortOrder === "asc" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
                        className={sortOrder === "asc" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""}
                      >
                        <ArrowUp01 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ordenar por preço crescente</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={sortOrder === "desc" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
                        className={sortOrder === "desc" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""}
                      >
                        <ArrowDown01 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ordenar por preço decrescente</p>
                    </TooltipContent>
                  </Tooltip>

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
                          <p>Ver produtos selecionados para comparação</p>
                        </TooltipContent>
                      </Tooltip>

                      <SheetContent side="right" className="w-[90vw] sm:w-[500px]">
                        <SheetHeader>
                          <SheetTitle>Comparação de Produtos</SheetTitle>
                          <SheetDescription>
                            Compare as características dos produtos selecionados
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                          <div className="grid grid-cols-1 gap-4">
                            {compareProducts.map((product) => (
                              <Card key={product.id} className="relative">
                                <CardHeader className="flex md:flex-row gap-4">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-32 h-32 object-cover rounded-md flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <CardTitle className="text-lg">{product.name}</CardTitle>
                                    <CardDescription>
                                      {categories.find((c) => c.id === product.categoryId)?.name}
                                    </CardDescription>
                                    <p className="text-2xl font-bold text-[var(--theme-color)] mt-2">
                                      {formatPrice(product.price)}
                                    </p>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <Button
                                    variant="ghost"
                                    className="w-full"
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
                      <p>Visualizar produtos em grade</p>
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
                      <p>Visualizar produtos em lista</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <motion.div
                  style={{
                    opacity: 1,
                    transition: "opacity 0.1s",
                  }}
                  className={`grid-container ${
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                      : "flex flex-col gap-4"
                  }`}
                >
                  {sortedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="card-interactive scroll-reveal"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`relative overflow-hidden ${viewMode === "list" ? "flex" : ""} border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 hover:shadow-lg transition-all duration-300`}
                        onClick={(e) => createRipple(e)}
                      >
                        <div
                          className={viewMode === "list" ? "w-48 h-48" : "aspect-square"}
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <CardHeader className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <CardTitle className="text-sm sm:text-base truncate">
                                  {product.name}
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                  <span className="inline-flex items-center rounded-full bg-[var(--theme-color)]/10 px-2 py-1 text-xs font-medium text-[var(--theme-color)]">
                                    {categories.find((c) => c.id === product.categoryId)?.name}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                            {product.suggestions && product.suggestions.length > 0 && (
                              <SuggestionsWidget
                                suggestions={product.suggestions as unknown as SuggestionType[]}
                                className="mt-1"
                              />
                            )}
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="flex justify-between items-center">
                              <p className="text-lg sm:text-xl font-bold">
                                {formatPrice(product.price)}
                              </p>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-8 w-8 ${
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleFavorite(product.id)}
                                >
                                  <Heart
                                    className={data?.favorites.includes(product.id)
                                      ? "h-4 w-4 fill-current text-red-500"
                                      : "h-4 w-4 text-muted-foreground"
                                    }
                                  />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <AnimatePresence>
                {filteredProducts.length === 0 && (
                  <motion.div
                    className="text-center py-12 animate-presence"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-muted-foreground">
                      Nenhum produto encontrado com os filtros selecionados.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Footer with CTA */}
        <motion.div
          className="py-8 bg-[var(--theme-color)] mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-6 text-white">Quer ter um cardápio digital como este?</h3>
            <Link href="/">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 text-black hover:text-black px-12 py-8 h-auto text-xl font-semibold tracking-wide rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-white/20"
              >
                Crie seu cardápio gratuitamente
              </Button>
            </Link>
          </div>
        </motion.div>

        <style>
          {`
            .ripple {
              position: absolute;
              border-radius: 50%;
              transform: scale(0);
              animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
              background-color: rgba(255, 255, 255, 0.7);
              pointer-events: none;
              z-index: 50;
            }

            @keyframes ripple {
              to {
                transform: scale(4);
                opacity: 0;
              }
            }

            /* Ensure proper stacking context for animations */
            .relative {
              position: relative;
            }

            /* Smooth transitions for interactive elements */
            button,
            .card-interactive {
              transition: all 0.2s ease-in-out;
              transform: translateZ(0);
              backface-visibility: hidden;
            }

            /* Prevent animation flicker */
            .motion-safe:transform {
              transform: translateZ(0);
              backface-visibility: hidden;
              perspective: 1000px;
            }

            /* Ensure proper z-index stacking for tooltips */
            .tooltip-trigger {
              position: relative;
              z-index: 30;
            }

            /* Fix for Safari animation performance */
            .animate-presence {
              will-change: transform, opacity;
            }

            /* Smoother hover transitions */
            .hover-scale {
              transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .hover-scale:hover {
              transform: scale(1.02);
            }

            /* Prevent layout shifts during animations */
            .grid-container {
              contain: layout style paint;
            }

            /* Enhanced hover effects */
            .card-interactive {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .card-interactive:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 24px -10px rgba(0,0, 0, 0.1);
            }

            /* Smooth transitions for filters */
            .filter-transition {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            /* Interactive tooltips */
            .tooltip-content {
              transform-origin: var(--radix-tooltip-content-transform-origin);
              animation: tooltip-slide 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes tooltip-slide {
              from {
                opacity: 0;
                transform: scale(0.96);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }

            /* Filter highlight effect */
            .filter-active {
              background: var(--theme-color);
              color: white;
              transform: scale(1.05);
            }

            /* Scroll reveal animation */
            .scroll-reveal {            opacity: 0;
              transform: translateY(20px);
              transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .scroll-reveal.visible {
              opacity: 1;
              transform: translateY(0);
            }

            /* Loading skeleton pulse animation */
            @keyframes skeleton-pulse {
              0% {
                opacity: 0.6;
              }
              50% {
                opacity: 0.8;
              }
              100% {
                opacity: 0.6;
              }
            }

            .animate-pulse {
              animation: skeleton-pulse 1.5s ease-in-out infinite;
            }

            /* Smooth slider transitions */
            [role="slider"] {
              transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            [role="slider"]:hover {
              transform: scale(1.2);
            }

            [role="slider"]:active {
              transform: scale(0.95);
            }

            /* Range track styling */
            .range {
              transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            /* Add spring effect to buttons */
            button:active {
              transform: scale(0.95);
              transition: transform 0.1s;
            }

            /* Enhance ripple effect */
            .ripple {
              position: absolute;
              border-radius: 50%;
              transform: scale(0);
              animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
              background-color: rgba(255, 255, 255, 0.7);
              pointer-events: none;
              z-index: 50;
            }

            @keyframes ripple {
              to {
                transform: scale(4);
                opacity: 0;
              }
            }

            /* Checkbox animations */
            [role="checkbox"] {
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            [role="checkbox"]:hover {
              background-color: var(--theme-color-90);
            }

            /* Category pill animations */
            .category-pill {
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .category-pill:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.1);
            }
          `}
        </style>
      </motion.div>
    </TooltipProvider>
  );
}