import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { eq, and, count } from "drizzle-orm";
import { products, users } from "@shared/schema";
import { db } from "./db";

async function ensureAdminUser() {
  const adminUser = await storage.getUserByUsername("admin-miller@gmail.com");
  if (!adminUser) {
    await storage.createUser({
      username: "admin-miller@gmail.com",
      password: await hashPassword("Thmpv77d6f@"),
      businessName: "Admin",
      phone: "0000000000",
      bannerImageUrl: null,
      confirmPassword: "Thmpv77d6f@",
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
    if (!req.isAuthenticated() || req.user?.username !== "admin-miller@gmail.com") {
      return res.sendStatus(401);
    }

    try {
      const allUsers = await storage.getAllUsers(); 
      const productsCount = await storage.getProductsCount(); 

      res.json({
        totalUsers: allUsers.length,
        totalProducts: productsCount,
        users: allUsers.map((user) => ({
          ...user,
          password: undefined 
        }))
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
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
    const products = await storage.getProducts(req.user!.id);
    res.json(products);
  });

  // Nova rota para buscar produtos públicos por userId
  app.get("/api/menu/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
      const products = await storage.getProducts(userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }

      res.json({
        products,
        businessName: user.businessName,
        bannerImageUrl: user.bannerImageUrl
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;
    const productId = parseInt(req.params.id);

    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, userId, productData);

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      res.json(product);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;
    const productId = parseInt(req.params.id);

    try {
      await storage.deleteProduct(productId, userId);
      res.sendStatus(200);
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

  // Add this route before the last return statement
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;

    try {
      const { businessName, phone } = req.body;
      const user = await storage.updateUserProfile(userId, { businessName, phone });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}