import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertFavoriteSchema, updateProductSchema, insertAdminLogSchema, insertSiteVisitSchema, insertUserSchema } from "@shared/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { products, users, favorites, paymentSettings } from "@shared/schema";
import { db } from "./db";
import { generatePix, checkPaymentStatus } from "./payment";
import { sendWelcomeEmail } from './email';

// Corrigindo o problema do req.ip undefined
async function createAdminLog(req: Request, action: string, details: string) {
  if (!req.user?.id) return;

  try {
    await storage.createAdminLog({
      userId: req.user.id,
      action,
      details,
      ipAddress: req.ip || req.socket.remoteAddress || "unknown"
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

function trackVisit(req: Request, res: Response, next: any) {
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
    '/admin',
    '/auth',
    '/@'
  ];

  const shouldIgnorePath = ignoredPaths.some(path =>
    req.path.startsWith(path) || req.path.includes(path)
  );

  if (!shouldIgnorePath && req.method === 'GET' && req.path.startsWith('/menu')) {
    const userAgent = req.get('user-agent') || 'unknown';
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet/i.test(userAgent)) deviceType = 'tablet';
    const sessionId = req.sessionID;
    const currentPath = req.path;
    const visitKey = `${sessionId}:${currentPath}`;
    if (!req.session.visitedPaths) {
      req.session.visitedPaths = [];
    }
    if (!req.session.visitTimes) {
      req.session.visitTimes = {};
    }
    const MIN_TIME_BETWEEN_VISITS = 15 * 60 * 1000;
    const lastVisitTime = req.session.visitTimes[visitKey] || 0;
    const now = Date.now();
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

  app.use(trackVisit);

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
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar este produto" });
      }

      const productData = updateProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, productData);

      if (!updatedProduct) {
        return res.status(500).json({ message: "Erro ao atualizar produto" });
      }

      await createAdminLog(req, "UPDATE_PRODUCT", `Produto atualizado: ${updatedProduct.name}`);
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
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      if (existingProduct.userId !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para excluir este produto" });
      }

      await storage.deleteProduct(productId, userId);
      await createAdminLog(req, "DELETE_PRODUCT", `Produto excluído: ${existingProduct.name}`);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;

    try {
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      const favorite = await storage.createFavorite(favoriteData);
      await createAdminLog(req, "CREATE_FAVORITE", `Favorito criado: Produto ID ${favorite.productId}`);
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
      await createAdminLog(req, "DELETE_FAVORITE", `Favorito removido: Produto ID ${productId}`);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/menu/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
      const products = await storage.getProducts(userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Estabelecimento não encontrado" });
      }

      let favorites: { productId: number }[] = [];
      if (req.isAuthenticated()) {
        favorites = await storage.getFavorites(req.user!.id);
      }

      res.json({
        products,
        businessName: user.businessName,
        bannerImageUrl: user.bannerImageUrl,
        themeColor: user.themeColor || "#7c3aed",
        logoUrl: user.logoUrl,
        favorites: favorites.map(f => f.productId)
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/user/banner", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user!.id;

    try {
      const { bannerImageUrl } = req.body;
      const user = await storage.updateUserBanner(userId, bannerImageUrl);
      await createAdminLog(req, "UPDATE_BANNER", `Banner atualizado para usuário ID ${userId}`);
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
      await createAdminLog(req, "UPDATE_PROFILE", `Perfil atualizado para usuário ID ${userId}`);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

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

  app.get("/api/admin/payment-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.username !== "admin@admin.com") {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Acesso negado. Apenas administradores podem acessar esta rota."
      });
    }

    try {
      const settings = await storage.getPaymentSettings(req.user.id);
      await createAdminLog(req, "VIEW_PAYMENT_SETTINGS", "Visualização das configurações de pagamento");
      res.json(settings || {});
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: "Erro ao buscar configurações de pagamento"
      });
    }
  });

  app.post("/api/admin/payment-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.username !== "admin@admin.com") {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Acesso negado. Apenas administradores podem acessar esta rota."
      });
    }

    try {
      const { clientSecret, accessToken } = req.body;

      if (!clientSecret || !accessToken) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Client Secret e Access Token são obrigatórios"
        });
      }

      const existingSettings = await storage.getPaymentSettings(req.user.id);
      let settings;

      if (existingSettings) {
        settings = await storage.updatePaymentSettings(req.user.id, {
          clientSecret,
          accessToken
        });
      } else {
        settings = await storage.savePaymentSettings({
          userId: req.user.id,
          clientSecret,
          accessToken
        });
      }

      await createAdminLog(req, "UPDATE_PAYMENT_SETTINGS", "Atualização das configurações de pagamento");

      res.json(settings);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      res.status(500).json({
        error: "SERVER_ERROR",
        message: "Erro ao salvar configurações de pagamento"
      });
    }
  });

  app.post("/api/payments/pix", async (req, res) => {
    try {
      const { amount, planId, customerData, planType } = req.body;

      console.log("Dados recebidos para geração do PIX:", {
        amount,
        planId,
        planType,
        customerData: { ...customerData, cpf: "***" } // Log sem CPF por segurança
      });

      // Formatar os dados do cliente para o Mercado Pago
      const paymentData = {
        transaction_amount: Number(amount), // Garantir que é um número
        description: `Assinatura do Plano ${planId} - ${planType === 'monthly' ? 'Mensal' : 'Anual'}`,
        payer: {
          email: customerData.email,
          first_name: customerData.name.split(' ')[0],
          last_name: customerData.name.split(' ').slice(1).join(' '),
          identification: {
            type: "CPF",
            number: customerData.cpf
          }
        },
        metadata: {
          plan_id: planId,
          plan_type: planType,
          user_data: customerData
        }
      };

      console.log("Dados formatados para o Mercado Pago:", {
        ...paymentData,
        payer: { ...paymentData.payer, identification: { ...paymentData.payer.identification, number: "***" } }
      });

      const pixData = await generatePix(paymentData);
      console.log("Resposta do Mercado Pago:", {
        id: pixData.id,
        status: pixData.status,
        qr_code: "***"
      });

      res.json(pixData);
    } catch (error) {
      console.error("Erro detalhado ao gerar PIX:", error);
      res.status(500).json({
        error: "PAYMENT_ERROR",
        message: "Erro ao gerar o código PIX",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.get("/api/payments/status/:id", async (req, res) => {
    try {
      const paymentId = req.params.id;
      console.log(`Consultando status do pagamento ${paymentId}`);

      const paymentData = await checkPaymentStatus(paymentId);
      console.log("Status do pagamento:", {
        id: paymentId,
        status: paymentData.status,
        status_detail: paymentData.status_detail
      });

      // Lista de status que indicam pagamento aprovado
      const approvedStatuses = ['approved', 'authorized', 'completed'];

      if (approvedStatuses.includes(paymentData.status)) {
        console.log("Pagamento aprovado, criando usuário...");
        const userData = paymentData.metadata.user_data;
        const planType = paymentData.metadata.plan_type;

        try {
          // Verificar se o usuário já existe
          const existingUser = await storage.getUserByUsername(userData.email);

          if (existingUser) {
            // Se o usuário já existe, apenas atualize o plano
            const updatedUser = await storage.updateUserProfile(existingUser.id, {
              planType: planType,
              businessName: userData.name,
              phone: userData.phone
            });

            // Fazer login automático
            req.login(updatedUser, (err) => {
              if (err) {
                console.error("Erro ao fazer login automático:", err);
              }
            });


            const welcomeUrl = `/welcome?name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(userData.email)}&phone=${encodeURIComponent(userData.phone)}&planType=${encodeURIComponent(planType)}`;
            return res.json({ status: "approved", user: updatedUser, redirectUrl: welcomeUrl });
          }

          // Se o usuário não existe, crie um novo
          const user = await storage.createUser({
            username: userData.email,
            businessName: userData.name,
            phone: userData.phone,
            planType: planType,
            password: await hashPassword(userData.password),
            confirmPassword: userData.password
          });

          console.log("Usuário criado/atualizado com sucesso:", {
            id: user.id,
            username: user.username,
            planType
          });

          // Fazer login automático
          req.login(user, (err) => {
            if (err) {
              console.error("Erro ao fazer login automático:", err);
            }
          });

          const welcomeUrl = `/welcome?name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(userData.email)}&phone=${encodeURIComponent(userData.phone)}&planType=${encodeURIComponent(planType)}`;
          res.json({ status: "approved", user, redirectUrl: welcomeUrl });
        } catch (error) {
          console.error("Erro ao criar/atualizar usuário:", error);
          res.status(500).json({
            error: "USER_ERROR",
            message: "Erro ao processar cadastro do usuário"
          });
        }
      } else {
        res.json({
          status: paymentData.status,
          status_detail: paymentData.status_detail
        });
      }
    } catch (error) {
      console.error("Erro detalhado ao verificar status do pagamento:", error);
      res.status(500).json({
        error: "PAYMENT_ERROR",
        message: "Erro ao verificar o status do pagamento",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}