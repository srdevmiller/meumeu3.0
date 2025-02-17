import { pgTable, text, serial, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  phone: text("phone").notNull(),
  bannerImageUrl: text("banner_image_url"),
  themeColor: text("theme_color").default("#7c3aed"), // Cor padrão - roxo
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
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
});

// Novo modelo para favoritos
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    businessName: true,
    phone: true,
    bannerImageUrl: true,
    themeColor: true,
  })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Product schemas
export const insertProductSchema = createInsertSchema(products)
  .pick({
    name: true,
    imageUrl: true,
    categoryId: true,
  })
  .extend({
    price: z.number().min(0, "O preço deve ser maior que zero"),
  });

// Favorite schema
export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  productId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;