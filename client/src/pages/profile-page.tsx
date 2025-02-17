import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// 12 cores diferentes que combinam bem entre si
const themeColors = [
  { name: "Roxo Imperial", hex: "#7c3aed" },
  { name: "Verde Oceano", hex: "#10b981" },
  { name: "Azul Safira", hex: "#2563eb" },
  { name: "Rosa Flamingo", hex: "#ec4899" },
  { name: "Laranja Sol", hex: "#f97316" },
  { name: "Vermelho Carmim", hex: "#dc2626" },
  { name: "Azul Turquesa", hex: "#06b6d4" },
  { name: "Verde Limão", hex: "#84cc16" },
  { name: "Dourado", hex: "#f59e0b" },
  { name: "Azul Índigo", hex: "#4f46e5" },
  { name: "Roxo Lavanda", hex: "#9333ea" },
  { name: "Coral", hex: "#f43f5e" }
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(user?.themeColor || themeColors[0].hex);
  const [previewBanner, setPreviewBanner] = useState<string | null>(user?.bannerImageUrl || null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(user?.logoUrl || null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { businessName?: string; phone?: string; themeColor?: string; logoUrl?: string; }) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso!",
      });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: async (bannerImageUrl: string) => {
      const response = await apiRequest("PATCH", "/api/user/banner", { bannerImageUrl });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Banner atualizado",
        description: "Sua imagem de fundo foi atualizada com sucesso!",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type for logo
    if (type === 'logo' && file.type !== 'image/png') {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione apenas arquivos PNG para o logo.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID ' + import.meta.env.VITE_IMGUR_CLIENT_ID,
        },
        body: formData,
      });

      const data = await response.json();
      const imageUrl = data.data.link;

      if (type === 'banner') {
        setPreviewBanner(imageUrl);
        updateBannerMutation.mutate(imageUrl);
      } else {
        setPreviewLogo(imageUrl);
        updateProfileMutation.mutate({ logoUrl: imageUrl });
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      themeColor: selectedColor,
      // Add other fields if needed
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Editar Perfil</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = `/menu/${user?.businessName}/${user?.id}`}
          >
            Ver Cardápio Público
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || updateBannerMutation.isPending}
          >
            {(updateProfileMutation.isPending || updateBannerMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
            <CardDescription>
              Personalize a aparência do seu estabelecimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Imagem de Fundo
              </label>
              {previewBanner && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={previewBanner}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'banner')}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recomendado: 1920x1080px ou maior
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Logo do Estabelecimento
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Envie um arquivo PNG com fundo transparente para melhor apresentação
              </p>
              {previewLogo && (
                <div className="relative w-32 h-32 mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 grid place-items-center">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iI2UyZThlYyIgZD0iTTAgMGgxMHYxMEgwek0xMCAxMGgxMHYxMEgxMHoiLz48L3N2Zz4=')] opacity-30"></div>
                  <img
                    src={previewLogo}
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain relative z-10"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/png"
                onChange={(e) => handleImageUpload(e, 'logo')}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Apenas arquivos PNG com transparência
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tema</CardTitle>
            <CardDescription>
              Escolha a cor principal do seu estabelecimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {themeColors.map((color) => (
                <motion.button
                  key={color.hex}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedColor(color.hex);
                  }}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selectedColor === color.hex
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-transparent hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}