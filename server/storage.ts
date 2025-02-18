import { users, products, favorites, adminLogs, type User, type InsertUser, type Product, type InsertProduct, type Favorite, type InsertFavorite, type AdminLog, type InsertAdminLog } from "@shared/schema";
import { db } from "./db";
import { eq, and, count, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { siteVisits, type SiteVisit, type InsertSiteVisit } from "@shared/schema";

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
  // Novos métodos para gerenciamento de logs
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(page?: number, limit?: number): Promise<{ logs: AdminLog[], total: number }>;
  getAdminLogsByUser(userId: number, page?: number, limit?: number): Promise<{ logs: AdminLog[], total: number }>;
  updateUserAsAdmin(userId: number, data: { 
    username?: string;
    businessName?: string;
    phone?: string;
  }): Promise<User>;
  // Novos métodos para visitas ao site
  createSiteVisit(visit: InsertSiteVisit): Promise<SiteVisit>;
  getSiteVisitsCount(): Promise<number>;
  getSiteVisitsByPage(path: string): Promise<number>;
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
        ...(product.categoryId && { categoryId: product.categoryId })
      })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
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
      .from(siteVisits);
    return Number(result.value);
  }

  async getSiteVisitsByPage(path: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(siteVisits)
      .where(eq(siteVisits.path, path));
    return Number(result.value);
  }
}

export const storage = new DatabaseStorage();