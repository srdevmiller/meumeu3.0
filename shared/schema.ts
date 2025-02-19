declare module 'express-session' {
  interface SessionData {
    visitedPaths?: string[];
    visitTimes?: { [key: string]: number };
  }
}

import { pgTable, text, serial, decimal, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  phone: text("phone").notNull(),
  bannerImageUrl: text("banner_image_url"),
  themeColor: text("theme_color").default("#7c3aed"),
  logoUrl: text("logo_url"),
  planType: text("plan_type").default("basic"), // Campo adicionado para tipo do plano
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  suggestions: text("suggestions").array(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: text("details").notNull(),
  ipAddress: text("ip_address").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteVisits = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  referrer: text("referrer"),
  deviceType: text("device_type"),
  sessionDuration: integer("session_duration"),
  pageInteractions: jsonb("page_interactions"),
});

export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientSecret: text("client_secret").notNull(),
  accessToken: text("access_token").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    businessName: true,
    phone: true,
    bannerImageUrl: true,
    themeColor: true,
    logoUrl: true,
    planType: true, // Campo adicionado ao schema de inserção
  })
  .extend({
    confirmPassword: z.string(),
    planType: z.enum(["basic", "professional", "enterprise"]).default("basic"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const insertProductSchema = createInsertSchema(products)
  .pick({
    name: true,
    imageUrl: true,
    categoryId: true,
    suggestions: true,
    description: true,
  })
  .extend({
    price: z.number().min(0, "O preço deve ser maior que zero"),
    suggestions: z.array(z.enum(['new', 'premium', 'popular', 'out-of-stock', 'promotion'])).optional(),
    description: z.string().optional(),
  });

export const updateProductSchema = createInsertSchema(products)
  .pick({
    name: true,
    imageUrl: true,
    categoryId: true,
    suggestions: true,
    description: true,
  })
  .extend({
    price: z.number().min(0, "O preço deve ser maior que zero"),
    suggestions: z.array(z.enum(['new', 'premium', 'popular', 'out-of-stock', 'promotion'])).optional(),
    description: z.string().optional(),
  })
  .partial();

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  productId: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).pick({
  userId: true,
  action: true,
  details: true,
  ipAddress: true,
});

export const insertSiteVisitSchema = createInsertSchema(siteVisits).pick({
  path: true,
  ipAddress: true,
  userAgent: true,
  referrer: true,
  deviceType: true,
  sessionDuration: true,
  pageInteractions: true,
});

export const insertPaymentSettingsSchema = createInsertSchema(paymentSettings)
  .pick({
    userId: true,
    clientSecret: true,
    accessToken: true,
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type SiteVisit = typeof siteVisits.$inferSelect;
export type InsertSiteVisit = z.infer<typeof insertSiteVisitSchema>;
export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type InsertPaymentSettings = z.infer<typeof insertPaymentSettingsSchema>;

export type AnalyticsSummary = {
  totalVisits: number;
  averageSessionDuration: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  popularPages: {
    path: string;
    visits: number;
  }[];
  visitsByDay: {
    date: string;
    visits: number;
  }[];
};