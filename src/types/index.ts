// ============================================
// INDOCASSAVA - Core Types
// ============================================

// ============================================
// Enums
// ============================================

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  FINANCE = "FINANCE",
  PROCUREMENT = "PROCUREMENT",
  WAREHOUSE = "WAREHOUSE",
  SALES = "SALES",
  LOGISTICS = "LOGISTICS",
  QUALITY_CONTROL = "QUALITY_CONTROL",
  VIEWER = "VIEWER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum ProductCategory {
  FRESH = "FRESH",
  DRIED = "DRIED",
  CHIPS = "CHIPS",
  FLOUR = "FLOUR",
  TAPIOCA_STARCH = "TAPIOCA_STARCH",
  PELLETS = "PELLETS",
  FROZEN = "FROZEN",
  OTHER = "OTHER",
}

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DISCONTINUED = "DISCONTINUED",
}

export enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  SUPPLIER_CONFIRMED = "SUPPLIER_CONFIRMED",
  IN_TRANSIT = "IN_TRANSIT",
  RECEIVED = "RECEIVED",
  QUALITY_CONTROL = "QUALITY_CONTROL",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum SalesOrderStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  READY = "READY",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum QualityResult {
  APPROVED = "APPROVED",
  CONDITIONAL = "CONDITIONAL",
  REJECTED = "REJECTED",
}

export enum InventoryStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  IN_TRANSIT = "IN_TRANSIT",
  LOW_STOCK = "LOW_STOCK",
  DAMAGED = "DAMAGED",
  REJECTED = "REJECTED",
}

export enum ExportOrderStatus {
  PREPARING = "PREPARING",
  DOCUMENTATION = "DOCUMENTATION",
  CUSTOMS = "CUSTOMS",
  LOADED = "LOADED",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED = "ARRIVED",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
}

export enum ShipmentStatus {
  PREPARING = "PREPARING",
  LOADED = "LOADED",
  DEPARTED = "DEPARTED",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED = "ARRIVED",
  DELIVERED = "DELIVERED",
}

export enum DocumentType {
  COMMERCIAL_INVOICE = "COMMERCIAL_INVOICE",
  PACKING_LIST = "PACKING_LIST",
  BILL_OF_LADING = "BILL_OF_LADING",
  CERTIFICATE_OF_ORIGIN = "CERTIFICATE_OF_ORIGIN",
  CERTIFICATE_OF_ANALYSIS = "CERTIFICATE_OF_ANALYSIS",
  INSURANCE = "INSURANCE",
  INSPECTION_CERTIFICATE = "INSPECTION_CERTIFICATE",
  CUSTOMS_DOCUMENTS = "CUSTOMS_DOCUMENTS",
}

export enum DocumentStatus {
  COMPLETE = "COMPLETE",
  PENDING = "PENDING",
  MISSING = "MISSING",
  EXPIRED = "EXPIRED",
}

// ============================================
// Base Types
// ============================================

export interface BaseEntity extends Record<string, unknown> {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// User Types
// ============================================

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
}

// ============================================
// Company Types
// ============================================

export interface Company extends BaseEntity {
  name: string;
  description?: string;
  industry?: string;
  status: string;
  address?: string;
  country?: string;
  province?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  userCount?: number;
}

// ============================================
// Product Types
// ============================================

export interface Product extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  grade: string;
  unit: string;
  origin: string;
  purchaseCost: number;
  processingCost: number;
  sellingPrice: number;
  margin: number;
  stock: number;
  status: ProductStatus;
  imageUrl?: string;
  imagePublicId?: string;
}

// ============================================
// Supplier Types
// ============================================

export interface Supplier extends BaseEntity {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  province?: string;
  city?: string;
  address?: string;
  products: string[];
  qualityScore: number;
  reliabilityScore: number;
  paymentTerms: string;
  status: UserStatus;
}

export interface SupplierPerformance {
  quality: number;
  price: number;
  delivery: number;
  reliability: number;
  consistency: number;
  overall: number;
}

// ============================================
// Customer Types
// ============================================

export interface Customer extends BaseEntity {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  address?: string;
  products: string[];
  totalPurchase: number;
  creditLimit: number;
  paymentTerms: string;
  outstanding: number;
  profitability: number;
  status: UserStatus;
}

// ============================================
// Purchase Order Types
// ============================================

export interface PurchaseOrder extends BaseEntity {
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  expectedDelivery: string;
  paymentTerms: string;
  status: PurchaseOrderStatus;
  notes?: string;
}

// ============================================
// Sales Order Types
// ============================================

export interface SalesOrder extends BaseEntity {
  soNumber: string;
  customerId: string;
  customerName?: string;
  productId: string;
  productName?: string;
  batchId?: string;
  quantity: number;
  price: number;
  currency: string;
  incoterm: string;
  paymentTerms: string;
  total: number;
  status: SalesOrderStatus;
  notes?: string;
}

// ============================================
// Batch Types
// ============================================

export interface Batch extends BaseEntity {
  batchNumber: string;
  productId: string;
  productName?: string;
  supplierId: string;
  supplierName?: string;
  origin: string;
  purchaseDate: string;
  quantity: number;
  grade: string;
  qualityResult?: QualityResult;
  warehouseId?: string;
  warehouseName?: string;
  processingStatus?: string;
  shipmentId?: string;
  destination?: string;
}

// ============================================
// Quality Inspection Types
// ============================================

export interface QualityInspection extends BaseEntity {
  batchId: string;
  batchNumber?: string;
  supplierId: string;
  supplierName?: string;
  purchaseOrderId?: string;
  productId: string;
  productName?: string;
  warehouseId?: string;
  moisture: number;
  starchContent: number;
  impurity: number;
  damage: number;
  color: string;
  size: string;
  freshness: number;
  grade: string;
  result: QualityResult;
  qualityScore: number;
  inspector: string;
  notes?: string;
}

// ============================================
// Inventory Types
// ============================================

export interface Inventory extends BaseEntity {
  productId: string;
  productName?: string;
  batchId: string;
  batchNumber?: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unit: string;
  grade: string;
  stockValue: number;
  status: InventoryStatus;
}

// ============================================
// Warehouse Types
// ============================================

export interface Warehouse extends BaseEntity {
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  available: number;
  manager: string;
  status: UserStatus;
}

// ============================================
// Processing Order Types
// ============================================

export interface ProcessingOrder extends BaseEntity {
  rawMaterialId: string;
  rawMaterialName?: string;
  inputQuantity: number;
  outputQuantity: number;
  loss: number;
  yield: number;
  processingCost: number;
  labor: number;
  energy: number;
  packaging: number;
  status: string;
}

// ============================================
// Export Order Types
// ============================================

export interface ExportOrder extends BaseEntity {
  salesOrderId: string;
  soNumber?: string;
  buyerId: string;
  buyerName?: string;
  country: string;
  productId: string;
  productName?: string;
  quantity: number;
  value: number;
  currency: string;
  incoterm: string;
  portOfLoading: string;
  portOfDestination: string;
  etd: string;
  eta: string;
  shipmentId?: string;
  documents: string[];
  status: ExportOrderStatus;
}

// ============================================
// Import Order Types
// ============================================

export interface ImportOrder extends BaseEntity {
  supplierId: string;
  supplierName?: string;
  country: string;
  productId: string;
  productName?: string;
  quantity: number;
  purchaseValue: number;
  currency: string;
  freight: number;
  insurance: number;
  customs: number;
  tax: number;
  handling: number;
  landedCost: number;
  eta: string;
  status: string;
}

// ============================================
// Shipment Types
// ============================================

export interface Shipment extends BaseEntity {
  container: string;
  carrier: string;
  origin: string;
  destination: string;
  port: string;
  etd: string;
  eta: string;
  actualArrival?: string;
  productId: string;
  productName?: string;
  quantity: number;
  status: ShipmentStatus;
}

// ============================================
// Document Types
// ============================================

export interface Document extends BaseEntity {
  relatedType: "EXPORT" | "IMPORT" | "SHIPMENT";
  relatedId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  status: DocumentStatus;
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction extends BaseEntity {
  type: "REVENUE" | "EXPENSE" | "PAYMENT";
  amount: number;
  currency: string;
  relatedType?: string;
  relatedId?: string;
  description: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardKPI {
  totalRevenue: number;
  totalProfit: number;
  availableStock: number;
  activeShipments: number;
  receivable: number;
  payable: number;
  businessHealth: number;
}

export interface RevenueByCountry {
  country: string;
  revenue: number;
  percentage: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
  margin: number;
}
