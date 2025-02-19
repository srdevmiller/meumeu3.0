import { users, products, favorites, adminLogs, type User, type InsertUser, type Product, type InsertProduct, type Favorite, type InsertFavorite, type AdminLog, type InsertAdminLog } from "@shared/schema";
import { db } from "./db";
import { eq, and, count, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { siteVisits, type SiteVisit, type InsertSiteVisit } from "@shared/schema";
import { sql } from "drizzle-orm";
import type { AnalyticsSummary } from "@shared/schema";
import { paymentSettings, type PaymentSettings, type InsertPaymentSettings } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createProduct(product: InsertProduct & { userId: number }): Promise<Product>;
  getProducts(userId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number, userId: number): Promise<void>;
  updateUserBanner(userId: number, bannerImageUrl: string): Promise<User>;
  updateUserProfile(userId: number, data: { 
    businessName?: string; 
    phone?: string;
    themeColor?: string;
    logoUrl?: string;
  }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getProductsCount(): Promise<number>;
  sessionStore: session.Store;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  getFavorites(userId: number): Promise<Favorite[]>;
  removeFavorite(userId: number, productId: number): Promise<void>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(page?: number, limit?: number): Promise<{ logs: AdminLog[], total: number }>;
  getAdminLogsByUser(userId: number, page?: number, limit?: number): Promise<{ logs: AdminLog[], total: number }>;
  updateUserAsAdmin(userId: number, data: { 
    username?: string;
    businessName?: string;
    phone?: string;
  }): Promise<User>;
  createSiteVisit(visit: InsertSiteVisit): Promise<SiteVisit>;
  getSiteVisitsCount(): Promise<number>;
  getSiteVisitsByPage(path: string): Promise<number>;
  getAnalyticsSummary(days: number): Promise<AnalyticsSummary>;
  getPopularPages(): Promise<{ path: string; visits: number; }[]>;
  getVisitsByTimeRange(startDate: Date, endDate: Date): Promise<{ date: string; visits: number; }[]>;
  getPaymentSettings(userId: number): Promise<PaymentSettings | undefined>;
  savePaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings>;
  updatePaymentSettings(userId: number, settings: Partial<InsertPaymentSettings>): Promise<PaymentSettings>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async getFavorites(userId: number): Promise<Favorite[]> {
    return db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));
  }

  async removeFavorite(userId: number, productId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.productId, productId)
        )
      );
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createProduct(product: InsertProduct & { userId: number }): Promise<Product> {
    const [newProduct] = await db.insert(products).values({
      name: product.name,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      userId: product.userId,
      description: product.description,
      suggestions: product.suggestions
    }).returning();
    return newProduct;
  }

  async getProducts(userId: number): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(products.id);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...(product.name && { name: product.name }),
        ...(product.price && { price: product.price.toString() }),
        ...(product.imageUrl && { imageUrl: product.imageUrl }),
        ...(product.categoryId && { categoryId: product.categoryId }),
        ...(product.suggestions !== undefined && { suggestions: product.suggestions }),
        ...(product.description !== undefined && { description: product.description })
      })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    // First delete all favorites that reference this product
    await db
      .delete(favorites)
      .where(eq(favorites.productId, id));

    // Then delete the product itself
    await db
      .delete(products)
      .where(
        and(
          eq(products.id, id),
          eq(products.userId, userId)
        )
      );
  }

  async updateUserBanner(userId: number, bannerImageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ bannerImageUrl })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: number, data: { businessName?: string; phone?: string; themeColor?: string; logoUrl?: string; }): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getProductsCount(): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(products);
    return Number(result.value);
  }
  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const [newLog] = await db
      .insert(adminLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAdminLogs(page = 1, limit = 10): Promise<{ logs: AdminLog[], total: number }> {
    const offset = (page - 1) * limit;
    const logs = await db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [result] = await db
      .select({ value: count() })
      .from(adminLogs);

    return {
      logs,
      total: Number(result.value)
    };
  }

  async getAdminLogsByUser(userId: number, page = 1, limit = 10): Promise<{ logs: AdminLog[], total: number }> {
    const offset = (page - 1) * limit;
    const logs = await db
      .select()
      .from(adminLogs)
      .where(eq(adminLogs.userId, userId))
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [result] = await db
      .select({ value: count() })
      .from(adminLogs)
      .where(eq(adminLogs.userId, userId));

    return {
      logs,
      total: Number(result.value)
    };
  }
  async updateUserAsAdmin(userId: number, data: { username?: string; businessName?: string; phone?: string; }): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  async createSiteVisit(visit: InsertSiteVisit): Promise<SiteVisit> {
    const [newVisit] = await db
      .insert(siteVisits)
      .values(visit)
      .returning();
    return newVisit;
  }

  async getSiteVisitsCount(): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(siteVisits)
      .where(sql`path LIKE '/menu%'`);  // Contar apenas visitas ao cardápio
    return Number(result.value);
  }

  async getSiteVisitsByPage(path: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(siteVisits)
      .where(eq(siteVisits.path, path));
    return Number(result.value);
  }
  async getAnalyticsSummary(days: number = 30): Promise<AnalyticsSummary> {
    // Total de visitas
    const [totalVisits] = await db
      .select({ 
        count: sql`count(*)::integer`
      })
      .from(siteVisits)
      .where(
        and(
          sql`path LIKE '/menu%'`,  // Contar apenas visitas ao cardápio
          sql`timestamp >= CURRENT_DATE - make_interval(days => ${days})`
        )
      );

    // Duração média da sessão
    const [avgDuration] = await db
      .select({ 
        avg: sql`COALESCE(AVG(session_duration)::integer, 0)`
      })
      .from(siteVisits)
      .where(
        and(
          sql`path LIKE '/menu%'`,  // Filtrar apenas visitas ao cardápio
          sql`timestamp >= CURRENT_DATE - make_interval(days => ${days})`
        )
      );

    // Estatísticas por dispositivo
    const deviceStats = await db
      .select({
        device_type: siteVisits.deviceType,
        count: sql<number>`count(*)::integer`
      })
      .from(siteVisits)
      .where(
        and(
          sql`path LIKE '/menu%'`,  // Filtrar apenas visitas ao cardápio
          sql`timestamp >= CURRENT_DATE - make_interval(days => ${days})`
        )
      )
      .groupBy(siteVisits.deviceType);

    // Páginas populares (apenas do cardápio)
    const popularPages = await db
      .select({
        path: siteVisits.path,
        visits: sql<number>`count(*)::integer`
      })
      .from(siteVisits)
      .where(
        and(
          sql`path LIKE '/menu%'`,  // Filtrar apenas visitas ao cardápio
          sql`timestamp >= CURRENT_DATE - make_interval(days => ${days})`
        )
      )
      .groupBy(siteVisits.path)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    // Visitas por dia
    const visitsByDay = await db
      .select({
        date: sql<string>`to_char(DATE(timestamp), 'YYYY-MM-DD')`,
        visits: sql<number>`count(*)::integer`
      })
      .from(siteVisits)
      .where(
        and(
          sql`path LIKE '/menu%'`,  // Filtrar apenas visitas ao cardápio
          sql`timestamp >= CURRENT_DATE - make_interval(days => ${days})`
        )
      )
      .groupBy(sql`DATE(timestamp)`)
      .orderBy(sql`DATE(timestamp)`);

    // Preparar a distribuição por dispositivo
    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };

    deviceStats.forEach(stat => {
      if (stat.device_type && stat.device_type in deviceBreakdown) {
        deviceBreakdown[stat.device_type as keyof typeof deviceBreakdown] = stat.count;
      }
    });

    return {
      totalVisits: totalVisits?.count || 0,
      averageSessionDuration: avgDuration?.avg || 0,
      deviceBreakdown,
      popularPages,
      visitsByDay,
    };
  }

  async getPopularPages(): Promise<{ path: string; visits: number; }[]> {
    const result = await db
      .select({
        path: siteVisits.path,
        visits: sql<number>`cast(count(*) as integer)`
      })
      .from(siteVisits)
      .groupBy(siteVisits.path)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    return result;
  }

  async getVisitsByTimeRange(
    startDate: Date,
    endDate: Date
  ): Promise<{ date: string; visits: number; }[]> {
    const result = await db
      .select({
        date: sql<string>`cast(date_trunc('day', ${siteVisits.timestamp}) as text)`,
        visits: sql<number>`cast(count(*) as integer)`
      })
      .from(siteVisits)
      .where(
        and(
          sql`${siteVisits.timestamp} >= ${startDate}`,
          sql`${siteVisits.timestamp} <= ${endDate}`
        )
      )
      .groupBy(sql`date_trunc('day', ${siteVisits.timestamp})`)
      .orderBy(sql`date_trunc('day', ${siteVisits.timestamp})`);

    return result;
  }

  async getPaymentSettings(userId: number): Promise<PaymentSettings | undefined> {
    const [settings] = await db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.userId, userId));
    return settings;
  }

  async savePaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings> {
    const [savedSettings] = await db
      .insert(paymentSettings)
      .values(settings)
      .returning();
    return savedSettings;
  }

  async updatePaymentSettings(userId: number, settings: Partial<InsertPaymentSettings>): Promise<PaymentSettings> {
    const [updatedSettings] = await db
      .update(paymentSettings)
      .set({
        ...(settings.clientSecret && { clientSecret: settings.clientSecret }),
        ...(settings.accessToken && { accessToken: settings.accessToken }),
        updatedAt: new Date(),
      })
      .where(eq(paymentSettings.userId, userId))
      .returning();
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();