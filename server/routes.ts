import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertFavoriteSchema, updateProductSchema } from "@shared/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { products, users, favorites } from "@shared/schema";
import { db } from "./db";

async function ensureAdminUser() {
  const adminUser = await storage.getUserByUsername("admin@admin.com");
  if (!adminUser) {
    await storage.createUser({
      username: "admin@admin.com",
      password: await hashPassword("Admin@123"),
      businessName: "Administrador",
      phone: "0000000000",
      bannerImageUrl: null,
      confirmPassword: "Admin@123",
    });
    console.log("Admin user created successfully");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Garantir que o usuário admin existe
  await ensureAdminUser();

  // Rota para estatísticas do admin
  app.get("/api/admin/stats", async (req, res) => {
    // Log para debug
    console.log("Admin stats request:", {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      headers: req.headers,
      session: req.session
    });

    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.status(401).json({ 
        error: "AUTH_ERROR",
        message: "Não autorizado" 
      });
    }

    if (!req.user || req.user.username !== "admin@admin.com") {
      console.log("User not admin:", req.user?.username);
      return res.status(403).json({ 
        error: "FORBIDDEN",
        message: "Acesso negado. Apenas administradores podem acessar esta rota." 
      });
    }

    try {
      const usersWithProducts = await db
        .select({
          id: users.id,
          username: users.username,
          businessName: users.businessName,
          phone: users.phone,
          product_count: sql<number>`count(${products.id})::integer`
        })
        .from(users)
        .leftJoin(products, eq(users.id, products.userId))
        .groupBy(users.id)
        .orderBy(users.id);

      const productsCount = await storage.getProductsCount();

      res.json({
        totalUsers: usersWithProducts.length,
        totalProducts: productsCount,
        users: usersWithProducts
      });
    } catch (error) {
      console.error('Error in admin stats:', error);
      res.status(500).json({ 
        error: "SERVER_ERROR",
        message: "Erro ao buscar estatísticas" 
      });
    }
  });

  // Product routes
  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;

    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...productData,
        userId,
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;
    try {
      // Garantindo que só retorne produtos do usuário logado
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;
    const productId = parseInt(req.params.id);

    try {
      // Primeiro, verifica se o produto existe e pertence ao usuário
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar este produto" });
      }

      // Valida e atualiza o produto
      const productData = updateProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, productData);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;
    const productId = parseInt(req.params.id);

    try {
      // Primeiro, verifica se o produto existe e pertence ao usuário
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para excluir este produto" });
      }

      await storage.deleteProduct(productId, userId);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Novas rotas para favoritos
  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;

    try {
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      const favorite = await storage.createFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const favorites = await storage.getFavorites(req.user!.id);
      res.json(favorites);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/favorites/:productId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;
    const productId = parseInt(req.params.productId);

    try {
      await storage.removeFavorite(userId, productId);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Update the menu route to include themeColor and logoUrl
  app.get("/api/menu/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
      const products = await storage.getProducts(userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }

      // Get favorites if user is authenticated
      let favorites = [];
      if (req.isAuthenticated()) {
        favorites = await storage.getFavorites(req.user!.id);
      }

      res.json({
        products,
        businessName: user.businessName,
        bannerImageUrl: user.bannerImageUrl,
        themeColor: user.themeColor || "#7c3aed", // Garantir um valor padrão
        logoUrl: user.logoUrl, // Incluir o logoUrl na resposta
        favorites: favorites.map(f => f.productId)
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Adicionar nova rota para atualizar banner
  app.patch("/api/user/banner", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;

    try {
      const { bannerImageUrl } = req.body;
      const user = await storage.updateUserBanner(userId, bannerImageUrl);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;

    try {
      const { businessName, phone, themeColor, logoUrl } = req.body;
      const user = await storage.updateUserProfile(userId, {
        businessName,
        phone,
        themeColor,
        logoUrl
      });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}