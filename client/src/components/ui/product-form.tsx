import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { insertProductSchema } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "./checkbox";

const suggestions = [
  {
    value: "new",
    label: "Novidade",
    description: "Item recém adicionado ao cardápio",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Item especial com ingredientes selecionados",
  },
  {
    value: "popular",
    label: "Mais Pedido",
    description: "Este item é um dos mais populares do nosso cardápio",
  },
  {
    value: "out-of-stock",
    label: "Em Falta",
    description: "Este item está temporariamente indisponível",
  },
  {
    value: "promotion",
    label: "Promoção",
    description: "Este item está em promoção",
  },
];

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

export const formSchema = insertProductSchema.extend({
  suggestions: z.array(z.string()).optional(),
});

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
  loading?: boolean;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  loading = false,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      suggestions: [],
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Nome do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do produto"
                  className="resize-none"
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

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Tags</FormLabel>
          {suggestions.map((suggestion) => (
            <FormField
              key={suggestion.value}
              control={form.control}
              name="suggestions"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(suggestion.value)}
                      onCheckedChange={(checked) => {
                        const values = new Set(field.value || []);
                        if (checked) {
                          values.add(suggestion.value);
                        } else {
                          values.delete(suggestion.value);
                        }
                        field.onChange(Array.from(values));
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{suggestion.label}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
}
