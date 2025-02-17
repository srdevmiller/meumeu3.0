import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { useParams } from "wouter";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: 1, name: "Bebidas" },
  { id: 2, name: "Alimentos" },
  { id: 3, name: "Tabacaria" },
  { id: 4, name: "Outros" },
];

type MenuData = {
  products: Product[];
  businessName: string;
  bannerImageUrl?: string;
};

export default function MenuPage() {
  const { userId } = useParams();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading } = useQuery<MenuData>({
    queryKey: [`/api/menu/${userId}`],
  });

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-48 bg-black/50 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {data.bannerImageUrl && (
            <img
              src={data.bannerImageUrl}
              alt={data.businessName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40" />
        </div>
        <h1 className="text-4xl font-bold text-white z-10">{data.businessName}</h1>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar with filters */}
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
                />
                <div className="flex justify-between text-sm">
                  <span>R$ {priceRange[0]}</span>
                  <span>R$ {priceRange[1]}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div>
            <div className="flex justify-end mb-4 gap-2">
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

            <div className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-3"
                : "grid-cols-1"
            }`}>
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className={`${viewMode === "list" ? "flex" : ""}`}>
                    <div className={`${
                      viewMode === "list"
                        ? "w-48 h-48"
                        : "aspect-square"
                    } relative`}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm sm:text-base truncate">{product.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {categories.find((c) => c.id === product.categoryId)?.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-lg sm:text-xl font-bold">
                          R$ {Number(product.price).toFixed(2)}
                        </p>
                      </CardContent>
                    </div>
                  </div>
                </Card>
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
  );
}