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


export default function MenuPage() {
  // ... (previous state and hooks remain the same)

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
          </div>

        </div>

        {/* Footer with CTA - Updated link to go to landing page */}
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