import { z } from "zod";

// ============================================
// Auth Validation Schemas
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase, one lowercase, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============================================
// Product Validation Schemas
// ============================================

export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  grade: z.string().min(1, "Grade is required"),
  unit: z.string().min(1, "Unit is required"),
  origin: z.string().optional(),
  purchaseCost: z.number().min(0).optional(),
  processingCost: z.number().min(0).optional(),
  sellingPrice: z.number().min(0, "Selling price is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePublicId: z.string().optional(),
});

// ============================================
// Supplier Validation Schemas
// ============================================

export const supplierSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  country: z.string().min(1, "Country is required"),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  products: z.array(z.string()).optional(),
  paymentTerms: z.string().optional(),
});

// ============================================
// Customer Validation Schemas
// ============================================

export const customerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().optional(),
  products: z.array(z.string()).optional(),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.string().optional(),
});

// ============================================
// Purchase Order Validation Schemas
// ============================================

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price is required"),
  expectedDelivery: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// Sales Order Validation Schemas
// ============================================

export const salesOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price is required"),
  currency: z.string().default("USD"),
  incoterm: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// Types
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type SalesOrderInput = z.infer<typeof salesOrderSchema>;
