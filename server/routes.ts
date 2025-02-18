import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertFavoriteSchema, updateProductSchema, insertAdminLogSchema, insertSiteVisitSchema } from "@shared/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { products, users, favorites } from "@shared/schema";
import { db } from "./db";

// Função para criar logs administrativos
async function createAdminLog(req: Request, action: string, details: string) {
  if (!req.user?.id) return;

  try {
    await storage.createAdminLog({
      userId: req.user.id,
      action,
      details,
      ipAddress: req.ip
    });
  } catch (error) {
    console.error('Error creating admin log:', error);
  }
}

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

// Middleware para registrar visitas
function trackVisit(req: Request, res: Response, next: NextFunction) {
  // Lista de extensões e caminhos para ignorar
  const ignoredPaths = [
    '/api/',
    '/assets/',
    '/_next/',
    '/static/',
    '/favicon.ico',
    '/manifest.json',
    '/src/',
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.ico',
    '/admin',  // Ignorar todas as páginas administrativas
    '/auth',   // Ignorar páginas de autenticação
    '/@'       // Ignorar rotas internas do Vite
  ];

  // Verifica se o caminho deve ser ignorado
  const shouldIgnorePath = ignoredPaths.some(path => 
    req.path.startsWith(path) || req.path.includes(path)
  );

  // Só rastreia se for uma página de menu e for uma requisição GET
  if (!shouldIgnorePath && req.method === 'GET' && req.path.startsWith('/menu')) {
    const userAgent = req.get('user-agent') || 'unknown';

    // Detecção de dispositivo melhorada
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet/i.test(userAgent)) deviceType = 'tablet';

    // Usar um identificador de sessão para evitar contagens duplicadas
    const sessionId = req.sessionID;
    const currentPath = req.path;

    // Chave única para esta visita
    const visitKey = `${sessionId}:${currentPath}`;

    // Inicializar arrays de visitas se necessário
    if (!req.session.visitedPaths) {
      req.session.visitedPaths = [];
    }

    if (!req.session.visitTimes) {
      req.session.visitTimes = {};
    }

    // Tempo mínimo entre visitas da mesma página (15 minutos)
    const MIN_TIME_BETWEEN_VISITS = 15 * 60 * 1000; // 15 minutos em milissegundos

    // Verificar quando foi a última visita
    const lastVisitTime = req.session.visitTimes[visitKey] || 0;
    const now = Date.now();

    // Só registra se ainda não visitou esta página nesta sessão ou se já passou tempo suficiente
    if (!req.session.visitedPaths.includes(visitKey) || (now - lastVisitTime) > MIN_TIME_BETWEEN_VISITS) {
      storage.createSiteVisit({
        path: currentPath,
        ipAddress: req.ip || req.socket.remoteAddress || '',
        userAgent,
        referrer: req.get('referrer') || '',
        deviceType,
        sessionDuration: 0,
        pageInteractions: {}
      }).catch(error => {
        console.error('Error tracking visit:', error);
      });

      // Atualizar o array de visitas e o tempo da última visita
      if (!req.session.visitedPaths.includes(visitKey)) {
        req.session.visitedPaths.push(visitKey);
      }
      req.session.visitTimes[visitKey] = now;
    }
  }
  next();
}


export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  await ensureAdminUser();

  // Registrar o middleware de rastreamento antes das rotas
  app.use(trackVisit);

  // Novas rotas para logs administrativos
  app.get("/api/admin/logs", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.username !== "admin@admin.com") {
      return res.status(403).json({ 
        error: "FORBIDDEN",
        message: "Acesso negado. Apenas administradores podem acessar esta rota." 
      });
    }

    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const logs = await storage.getAdminLogs(page, limit);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      res.status(500).json({ 
        error: "SERVER_ERROR",
        message: "Erro ao buscar logs administrativos" 
      });
    }
  });

  // Rota para estatísticas do admin (atualizada com log)
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: "AUTH_ERROR",
        message: "Não autorizado" 
      });
    }

    if (!req.user || req.user.username !== "admin@admin.com") {
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
      const visitsCount = await storage.getSiteVisitsCount();

      await createAdminLog(req, "VIEW_STATS", "Visualização das estatísticas do sistema");

      res.json({
        totalUsers: usersWithProducts.length,
        totalProducts: productsCount,
        totalVisits: visitsCount,
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

  // New analytics routes
  app.get("/api/admin/analytics", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.username !== "admin@admin.com") {
      return res.status(403).json({ 
        error: "FORBIDDEN",
        message: "Acesso negado. Apenas administradores podem acessar esta rota." 
      });
    }

    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const analytics = await storage.getAnalyticsSummary(days);

      await createAdminLog(req, "VIEW_ANALYTICS", "Visualização das análises de engajamento");

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ 
        error: "SERVER_ERROR",
        message: "Erro ao buscar análises" 
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

      await createAdminLog(req, "CREATE_PRODUCT", `Produto criado: ${product.name}`);

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
      await createAdminLog(req, "UPDATE_PRODUCT", `Produto atualizado: ${updatedProduct.name}`); //Added Log
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
      await createAdminLog(req, "DELETE_PRODUCT", `Produto excluído: ${existingProduct.name}`); //Added Log
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
      await createAdminLog(req, "CREATE_FAVORITE", `Favorito criado: Produto ID ${favorite.productId}`); //Added Log
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
      await createAdminLog(req, "DELETE_FAVORITE", `Favorito removido: Produto ID ${productId}`); //Added Log
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
      await createAdminLog(req, "UPDATE_BANNER", `Banner atualizado para usuário ID ${userId}`); //Added Log
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
      await createAdminLog(req, "UPDATE_PROFILE", `Perfil atualizado para usuário ID ${userId}`); //Added Log
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Nova rota para atualização de usuário pelo admin
  app.patch("/api/admin/users/:userId", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.username !== "admin@admin.com") {
      return res.status(403).json({ 
        error: "FORBIDDEN",
        message: "Acesso negado. Apenas administradores podem acessar esta rota." 
      });
    }

    const userId = parseInt(req.params.userId);
    const { username, businessName, phone } = req.body;

    try {
      const user = await storage.updateUserAsAdmin(userId, {
        username,
        businessName,
        phone
      });

      await createAdminLog(req, "UPDATE_USER", `Usuário atualizado: ID ${userId}`);

      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        error: "SERVER_ERROR",
        message: "Erro ao atualizar usuário" 
      });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}