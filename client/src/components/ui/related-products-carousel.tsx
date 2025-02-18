import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { Product } from "@shared/schema";
import { SuggestionsWidget } from "./suggestions-widget";
import { SuggestionType } from "@/types/suggestion";
import { Heart } from "lucide-react";
import { Button } from "./button";

interface RelatedProductsCarouselProps {
  products: Product[];
  favorites: number[];
  onToggleFavorite: (productId: number) => void;
  formatPrice: (price: string | number) => string;
  categories: { id: number; name: string; }[];
  className?: string;
}

export function RelatedProductsCarousel({
  products,
  favorites,
  onToggleFavorite,
  formatPrice,
  categories,
  className
}: RelatedProductsCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        skipSnaps: false,
        inViewThreshold: 0.7,
      }}
      className={cn("w-full", className)}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="p-1">
              <Card className="relative overflow-hidden border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 hover:shadow-lg transition-all duration-300">
                <div className="aspect-square">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onToggleFavorite(product.id)}
                    >
                      <Heart
                        className={favorites.includes(product.id)
                          ? "h-4 w-4 fill-current text-red-500"
                          : "h-4 w-4 text-muted-foreground"
                        }
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-12 bg-background hover:bg-background border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 hover:text-[var(--theme-color)]" />
      <CarouselNext className="hidden md:flex -right-12 bg-background hover:bg-background border-[var(--theme-color)]/20 hover:border-[var(--theme-color)]/40 hover:text-[var(--theme-color)]" />
    </Carousel>
  );
}