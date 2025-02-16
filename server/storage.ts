import { users, products, type User, type InsertUser, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createProduct(product: InsertProduct & { userId: number }): Promise<Product>;
  getProducts(userId: number): Promise<Product[]>;
  updateProduct(id: number, userId: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number, userId: number): Promise<void>;
  updateUserBanner(userId: number, bannerImageUrl: string): Promise<User>;
  updateUserProfile(userId: number, data: { businessName?: string; phone?: string }): Promise<User>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
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
      .where(eq(products.userId, userId));
  }

  async updateProduct(id: number, userId: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...product,
        price: product.price?.toString(),
      })
      .where(eq(products.id, id))
      .where(eq(products.userId, userId))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    await db
      .delete(products)
      .where(eq(products.id, id))
      .where(eq(products.userId, userId));
  }

  async updateUserBanner(userId: number, bannerImageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ bannerImageUrl })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: number, data: { businessName?: string; phone?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();