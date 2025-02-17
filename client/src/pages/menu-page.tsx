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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo, useEffect } from "react";
import { Search, LayoutGrid, List, Moon, Sun, Heart, Filter, Share2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
];

type MenuData = {
  products: Product[];
  businessName: string;
  bannerImageUrl?: string;
  favorites: number[];
  themeColor?: string;
  logoUrl?: string; // Added logoUrl
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.5,
    },
  },
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

  const themeStyles = {
    "--theme-color": data?.themeColor || "#7c3aed",
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
    <div className="min-h-screen bg-background" style={themeStyles}>
      <div className="relative h-48 bg-black/50 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {data.bannerImageUrl && (
            <img
              src={data.bannerImageUrl}
              alt={data.businessName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-[var(--theme-color)]/50" />
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
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 backdrop-blur-sm relative overflow-hidden"
                onClick={(e) => {
                  createRipple(e);
                  copyMenuLink();
                }}
              >
                {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 backdrop-blur-sm relative overflow-hidden"
                onClick={(e) => {
                  createRipple(e);
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center gap-2 bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90"
            >
              <Filter className="h-4 w-4" />
              Filtrar produtos
            </Button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Categorias</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2 min-w-[120px]">
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
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {category.name}
                            </label>
                          </div>
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
                        style={{
                          "--theme-color": data?.themeColor || "#7c3aed",
                        } as React.CSSProperties}
                      />
                      <div className="flex justify-between text-sm">
                        <span>R$ {priceRange[0]}</span>
                        <span>R$ {priceRange[1]}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                R$ {priceRange[0]} - R$ {priceRange[1]} •{" "}
                <span className="font-bold text-[var(--theme-color)]">
                  Qtd Produtos {filteredProducts.length}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className={`overflow-hidden ${viewMode === "list" ? "flex" : ""} border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 transition-colors`}>
                    <div className={viewMode === "list" ? "w-48 h-48" : "aspect-square"}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
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
                              <span className="inline-flex items-center rounded-full bg-[var(--theme-color)]/10 px-2 py-1 text-xs font-medium text-[var(--theme-color)]">
                                {categories.find((c) => c.id === product.categoryId)?.name}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex justify-between items-center">
                          <p className="text-lg sm:text-xl font-bold">
                            R$ {Number(product.price).toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 relative overflow-hidden"
                            onClick={(e) => {
                              createRipple(e);
                              toggleFavorite(product.id);
                            }}
                          >
                            <motion.div
                              initial={{ scale: 1 }}
                              animate={{
                                scale: data?.favorites.includes(product.id) ? [1, 1.3, 1] : 1
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  data?.favorites.includes(product.id)
                                    ? "fill-current text-red-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </motion.div>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

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
    </div>
  );
}