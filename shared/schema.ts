import { pgTable, text, serial, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  phone: text("phone").notNull(),
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

// User schemas
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    businessName: true,
    phone: true,
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
    price: true,
    imageUrl: true,
    categoryId: true,
  })
  .extend({
    price: z.string().transform((val) => parseFloat(val)),
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;