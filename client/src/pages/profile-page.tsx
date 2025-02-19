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
import { Link } from "wouter";

const themeColors = [
  { name: "Grapefruit", hex: "#0BD979" },
  { name: "Bittersweet", hex: "#F2CB05" },
  { name: "Sunflower", hex: "#D90718" },
  { name: "Grass", hex: "#F27405" },
  { name: "Mint", hex: "#41A8BF" },
  { name: "Aqua", hex: "#F2B077" },
  { name: "Blue Jeans", hex: "#F25A38" },
  { name: "Lavander", hex: "#7EADBF" },
  { name: "Pink Rose", hex: "#F29991" },
  { name: "Light Gray", hex: "#2730F2" },
  { name: "Medium Gray", hex: "#D900D9" },
  { name: "Dark Gray", hex: "#5C0499" }
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
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Editar Perfil</h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline">
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informações do Estabelecimento</CardTitle>
          <CardDescription>
            Personalize a aparência do seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo do Estabelecimento */}
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

          {/* Imagem de Fundo */}
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

          {/* Nome do Estabelecimento e Telefone */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do Estabelecimento
              </label>
              <Input
                placeholder="Nome do seu estabelecimento"
                defaultValue={user?.businessName}
                onChange={(e) => {
                  updateProfileMutation.mutate({ businessName: e.target.value });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Telefone
              </label>
              <Input
                placeholder="Seu telefone de contato"
                defaultValue={user?.phone}
                onChange={(e) => {
                  updateProfileMutation.mutate({ phone: e.target.value });
                }}
              />
            </div>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium mb-4">
              Tema
            </label>
            <div className="grid grid-cols-4 gap-4">
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
            <div className="mt-6">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending || updateBannerMutation.isPending}
                className="w-full"
              >
                {(updateProfileMutation.isPending || updateBannerMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}