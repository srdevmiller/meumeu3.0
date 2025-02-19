import { useQuery, useMutation } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { useParams } from "wouter";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SuggestionsWidget } from "@/components/ui/suggestions-widget";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import {
  Search,
  LayoutGrid,
  List,
  Moon,
  Sun,
  Heart,
  Share2,
  CheckCheck,
  Scale,
  ArrowUp01,
  ArrowDown01,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";

import { type SuggestionType } from "@/types/suggestion";
import { ProductDetailsDialog } from "@/components/ui/product-details-dialog";

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
  products: (Product & {
    suggestions?: string[];
  })[];
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
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 640);
  const [showSearch, setShowSearch] = useState(window.innerWidth >= 640);
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("menu-theme") as "light" | "dark") || "light"
  );
  const [copied, setCopied] = useState(false);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showCompareSheet, setShowCompareSheet] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 640;
      setShowSearch(isLargeScreen);
      setShowFilters(isLargeScreen);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          className="relative h-36 md:h-48 flex items-center justify-center overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            {data?.bannerImageUrl && (
              <img
                src={data.bannerImageUrl}
                alt={data.businessName}
                className="w-full h-full object-cover filter blur-[1px] scale-105"
              />
            )}
            <div className="absolute inset-0 bg-[var(--theme-color)]/90" />
          </div>

          <div className="z-10 flex flex-col items-center gap-2 md:gap-4 px-4">
            <div className="flex items-center gap-2 md:gap-4">
              {data?.logoUrl && (
                <img
                  src={data.logoUrl}
                  alt={`Logo ${data.businessName}`}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain bg-transparent"
                />
              )}
              <h1 className="text-2xl md:text-4xl font-bold text-white text-center">{data?.businessName}</h1>
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm relative overflow-hidden w-8 h-8 md:w-10 md:h-10"
                    onClick={(e) => {
                      createRipple(e);
                      copyMenuLink();
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Share2 className={`h-3 w-3 md:h-4 md:w-4 absolute transition-opacity duration-200 ${copied ? 'opacity-0' : 'opacity-100'}`} />
                      <CheckCheck className={`h-3 w-3 md:h-4 md:w-4 absolute text-green-500 transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`} />
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
                    className="bg-background/80 backdrop-blur-sm relative overflow-hidden w-8 h-8 md:w-10 md:h-10"
                    onClick={(e) => {
                      createRipple(e);
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sun className={`h-3 w-3 md:h-4 md:w-4 absolute transition-opacity duration-200 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                      <Moon className={`h-3 w-3 md:h-4 md:w-4 absolute transition-opacity duration-200 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
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

        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
          <div className="grid md:grid-cols-[300px_1fr] gap-4 md:gap-8">
            <motion.div
              className="space-y-4 md:space-y-6"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="sm:!h-auto sm:!opacity-100"
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Buscar</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar produtos..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              if (showFilters) setShowFilters(false);
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="sm:!h-auto sm:!opacity-100"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Categorias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              className={`flex items-center space-x-2 hover:bg-accent/50 p-2 rounded-md transition-colors ${
                                selectedCategories.includes(category.id)
                                  ? "bg-[var(--theme-color)]/10 text-[var(--theme-color)]"
                                  : ""
                              }`}
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
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Faixa de Preço</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Slider
                          min={0}
                          max={5000}
                          step={1}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="my-6"
                        />
                        <div className="flex justify-between text-sm">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--theme-color)]">
                    Qtd Produtos {filteredProducts.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showSearch ? "default" : "outline"}
                      size="icon"
                      onClick={() => setShowSearch(!showSearch)}
                      className={`h-8 w-8 md:h-10 md:w-10 sm:hidden ${
                        showSearch ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""
                      }`}
                    >
                      <Search className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>

                    <Button
                      variant={showFilters ? "default" : "outline"}
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`h-8 w-8 md:h-10 md:w-10 sm:hidden ${
                        showFilters ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""
                      }`}
                    >
                      <Filter className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>

                    <Button
                      variant={sortOrder === "asc" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
                      className={`h-8 w-8 md:h-10 md:w-10 ${
                        sortOrder === "asc" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""
                      }`}
                    >
                      <ArrowUp01 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>

                    <Button
                      variant={sortOrder === "desc" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
                      className={`h-8 w-8 md:h-10 md:w-10 ${
                        sortOrder === "desc" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""
                      }`}
                    >
                      <ArrowDown01 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>

                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className={`h-8 w-8 md:h-10 md:w-10 ${
                        viewMode === "grid" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""
                      }`}
                    >
                      <LayoutGrid className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>

                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className={`h-8 w-8 md:h-10 md:h-10 ${
                        viewMode === "list" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""
                      }`}
                    >
                      <List className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-[1200px] mx-auto"
                    : "flex flex-col gap-4 md:gap-6"
                }
              >
                {sortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className={`overflow-hidden ${
                        viewMode === "list"
                          ? "flex h-36 sm:h-48"
                          : "flex flex-col h-full"
                      } border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div
                        className={
                          viewMode === "list"
                            ? "w-36 sm:w-48 h-full flex-shrink-0"
                            : "w-full aspect-square"
                        }
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div
                        className={
                          viewMode === "list"
                            ? "flex-1 p-4 relative"
                            : "flex flex-col p-4 flex-1"
                        }
                      >
                        <div className="flex flex-col space-y-2">
                          <div className={viewMode === "list" ? "flex justify-between items-start" : ""}>
                            <h3 className="font-semibold text-lg line-clamp-2">
                              {product.name}
                            </h3>
                            {viewMode === "list" && (
                              <p className="text-xl font-bold ml-4">
                                {formatPrice(product.price)}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="inline-flex items-center rounded-md bg-[var(--theme-color)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--theme-color)] w-fit">
                              {categories.find((c) => c.id === product.categoryId)?.name}
                            </span>
                            <SuggestionsWidget suggestions={product.suggestions || []} />
                          </div>
                        </div>

                        {viewMode !== "list" && (
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <p className="text-xl font-bold">
                              {formatPrice(product.price)}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-9 w-9 rounded-full transition-all duration-200 ${
                                  compareProducts.some((p) => p.id === product.id)
                                    ? "bg-[var(--theme-color)]/10 hover:bg-[var(--theme-color)]/20"
                                    : "hover:bg-[var(--theme-color)]/5"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompare(product);
                                }}
                              >
                                <Scale
                                  className={`h-4 w-4 ${
                                    compareProducts.some((p) => p.id === product.id)
                                      ? "text-[var(--theme-color)]"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(product.id);
                                }}
                              >
                                <Heart
                                  className={`h-4 w-4 transition-colors ${
                                    data?.favorites.includes(product.id)
                                      ? "fill-current text-red-500"
                                      : "text-muted-foreground hover:text-red-400"
                                  }`}
                                />
                              </Button>
                            </div>
                          </div>
                        )}

                        {viewMode === "list" && (
                          <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-9 w-9 rounded-full transition-all duration-200 ${
                                compareProducts.some((p) => p.id === product.id)
                                  ? "bg-[var(--theme-color)]/10 hover:bg-[var(--theme-color)]/20"
                                  : "hover:bg-[var(--theme-color)]/5"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompare(product);
                              }}
                            >
                              <Scale
                                className={`h-4 w-4 ${
                                  compareProducts.some((p) => p.id === product.id)
                                    ? "text-[var(--theme-color)]"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                            >
                              <Heart
                                className={`h-4 w-4 transition-colors ${
                                  data?.favorites.includes(product.id)
                                    ? "fill-current text-red-500"
                                    : "text-muted-foreground hover:text-red-400"
                                }`}
                              />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <motion.div
                  className="text-center py-8 md:py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-muted-foreground">
                    Nenhum produto encontrado com os filtros selecionados.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <Sheet open={showCompareSheet} onOpenChange={setShowCompareSheet}>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Comparação de Produtos</SheetTitle>
              <SheetDescription>
                Compare as características dos produtos selecionados
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {compareProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-background hover:bg-destructive/10"
                      onClick={() => {
                        setCompareProducts((current) =>
                          current.filter((p) => p.id !== product.id)
                        );
                        if (compareProducts.length <= 1) {
                          setShowCompareSheet(false);
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Card className="overflow-hidden">
                      <div className="w-full">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full aspect-[4/3] object-cover"
                        />
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>
                          {categories.find((c) => c.id === product.categoryId)?.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-xl font-bold text-[var(--theme-color)]">
                          {formatPrice(product.price)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {compareProducts.length > 1 && !showCompareSheet && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => setShowCompareSheet(true)}
              className="bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90 shadow-lg"
            >
              <Scale className="mr-2 h-4 w-4" />
              Comparar {compareProducts.length} produtos
            </Button>
          </div>
        )}


        <ProductDetailsDialog
          product={selectedProduct}
          categories={categories}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
        />

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

        <style jsx global>
          {`
            /* Animations */
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

            /* Hover effects */
            .hover-scale {
              transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .hover-scale:hover {
              transform: scale(1.05);
            }

            /* Scroll reveal animation*/
            .scroll-reveal {
              opacity: 0;
              transform: translateY(20px);
              transition: all 0.6s cubic-bezier(0.4,0, 0.2, 1);
            }

            .scroll-reveal.visible {
              opacity:1;
              transform: translateY(0);
            }
          `}
        </style>
      </motion.div>
    </TooltipProvider>
  );
}