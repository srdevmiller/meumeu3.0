import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { SuggestionsWidget } from "./suggestions-widget";
import { SuggestionType } from "@/types/suggestion";

interface ProductDetailsDialogProps {
  product: Product | null;
  categories: { id: number; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({
  product,
  categories,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{product.name}</DialogTitle>
          <DialogDescription>
            <span className="inline-flex items-center rounded-full bg-[var(--theme-color)]/10 px-2 py-1 text-xs font-medium text-[var(--theme-color)]">
              {category?.name}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {product.description && (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </p>
            {product.suggestions && product.suggestions.length > 0 && (
              <SuggestionsWidget
                suggestions={product.suggestions as unknown as SuggestionType[]}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
