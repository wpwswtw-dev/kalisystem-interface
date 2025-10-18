export type StoreTag = 'cv2' | 'o2' | 'wb' | 'sti' | 'myym' | 'leo';
export const STORE_TAGS: StoreTag[] = ['cv2', 'o2', 'wb', 'sti', 'myym', 'leo'];

export interface VariantTag {
  id: string;
  name: string;
  type: 'quantity' | 'supplier' | 'brand' | 'khmer_name';
  color: string;
}

export interface Item {
  id: string;
  name: string;
  khmerName?: string | null;
  category: string;
  supplier: string;
  tags: string[];
  unitTag?: string | null;
  unitPrice?: number | null;
  variantTags?: any; // keep flexible; cast when needed
  lastOrdered?: string | null;
  orderCount?: number;
  lastHeld?: string | null;
}

export interface Category {
  id: string;
  name: string;
  emoji?: string;
  supplier?: string | null; // ID of the supplier this category belongs to
  mainCategory?: string | null; // Parent category ID for hierarchical categories
  storeTag?: StoreTag | null; // Store this category belongs to
}

export const ORDER_TYPES = ['Delivery', 'Pickup'] as const;
export type OrderType = typeof ORDER_TYPES[number];

export const PAYMENT_METHODS = ['COD', 'Cash', 'Card', 'TrueMoney', 'CreditLine', 'Aba'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  telegramId?: string | null;
  paymentMethod?: PaymentMethod | null;
  orderType?: OrderType | null;
  categories?: string[]; // category ids or names
  defaultPaymentMethod?: PaymentMethod;
  defaultOrderType?: OrderType;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: string | null;
}

export interface OrderItem {
  item: Item;
  quantity: number;
  storeTag?: StoreTag | string | null;
  isNewItem?: boolean;
}

export interface PendingOrderItem {
  item: Item;
  quantity: number;
  isNewItem?: boolean;
}

export interface PendingOrder {
  id: string;
  supplier: string;
  items: PendingOrderItem[];
  status?: 'pending' | 'processing' | 'completed' | string;
  storeTag?: StoreTag | string | null;
  orderType?: OrderType | null;
  paymentMethod?: PaymentMethod | null;
  contactPerson?: string | null;
  notes?: string | null;
  invoiceUrl?: string | null;
  amount?: number | null;
  isReceived?: boolean;
  isPaid?: boolean;
  completedAt?: Date | undefined;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CompletedOrder {
  id: string;
  items: PendingOrderItem[];
  supplier: string; // Supplier ID
  amount?: number;
  invoiceUrl?: string | null; // URL to attached invoice
  paymentMethod?: PaymentMethod | null;
  orderType?: OrderType | null;
  contactPerson?: string | null;
  notes?: string | null;
  isReceived?: boolean;
  isPaid?: boolean;
  completedAt: Date; // Required - when the order was completed
  createdAt: Date; // Required - when the order was created
  updatedAt?: Date;
}

export interface CurrentOrderMetadata {
  id: string;
  status: 'draft' | 'completed';
  orderType?: OrderType;
  paymentMethod?: PaymentMethod | null;
  manager?: string | null;
  store?: StoreTag | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  defaultSupplier?: string | null;
  orderTemplate?: string | null;
  posMode?: boolean;
  autosave?: boolean;
  updatedAt?: string | null;
}

export type Store = {
  id: string;
  name: string;
  tag: StoreTag;
  isActive: boolean;
}

export const UNIT_TAGS = ['kg', 'pc', 'can', 'L', 'bt', 'pk', 'jar', 'bag', 'small', 'big'] as const;

export type UnitTag = typeof UNIT_TAGS[number];

export const VARIANT_TAG_TYPES = ['quantity', 'supplier', 'brand', 'khmer_name'] as const;
export type VariantTagType = typeof VARIANT_TAG_TYPES[number];

export const VARIANT_TYPE_COLORS: Record<VariantTagType, string> = {
  quantity: '#10b981',
  supplier: '#3b82f6',
  brand: '#f59e0b',
  khmer_name: '#8b5cf6',
};

export type PendingOrderStatus = 'pending' | 'processing' | 'completed';
