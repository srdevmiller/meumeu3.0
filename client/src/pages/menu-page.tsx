import { useQuery, useMutation } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { useParams, Link } from "wouter";
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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, LayoutGrid, List, Heart, Scale } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<MenuData>({
    queryKey: [`/api/menu/${id}`],
  });

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));
  };

  const toggleFavorite = (productId: number) => {
    // Placeholder for favorite toggle functionality
    console.log("Toggle favorite:", productId);
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

  // The existing JSX remains the same, only adding the missing state and functions
  return (
    <TooltipProvider>
      <motion.div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Cardápio</h1>
            <div className="flex gap-4">
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

          <div>
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
              {data?.products?.map((product, index) => (
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

            <AnimatePresence>
              {data?.products?.length === 0 && (
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
          </div>

        </div>

        {/* Footer with CTA - Already updated to redirect to landing page */}
        <motion.div
          className="py-8 bg-muted mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Quer ter um cardápio digital como este?
            </h3>
            <Link href="/">
              <Button
                variant="default"
                size="lg"
                className="bg-[var(--theme-color)] hover:bg-[var(--theme-color)]/90 text-white px-8 py-6 h-auto text-lg font-semibold relative overflow-hidden"
              >
                Crie seu cardápio gratuitamente
              </Button>
            </Link>
          </div>
        </motion.div>

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

          .card-interactive {
            cursor: pointer;
          }

          .scroll-reveal {
            visibility: visible;
          }

          @media (prefers-reduced-motion: no-preference) {
            .motion-safe {
              transition: all 0.3s ease;
            }
          }

          .filter-transition {
            transition: opacity 0.2s, height 0.2s;
          }
        `}</style>
      </motion.div>
    </TooltipProvider>
  );
}