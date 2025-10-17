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
  khmerName?: string;
  category: string;
  supplier: string;
  tags: string[];
  unitTag?: string;
  unitPrice?: number;
  variantTags?: VariantTag[];
  lastOrdered?: string;
  orderCount?: number;
  lastHeld?: string;
}

export const MAIN_CATEGORIES = ['Food', 'Beverage', 'Household'] as const;
export type MainCategory = typeof MAIN_CATEGORIES[number];

export interface Category {
  id: string;
  name: string;
  emoji: string;
  storeTag?: StoreTag;
  mainCategory?: MainCategory;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  telegramId?: string;
  paymentMethod?: PaymentMethod;
  orderType?: OrderType;
  categories?: string[];
  defaultPaymentMethod: PaymentMethod;
  defaultOrderType: OrderType;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: string;
}

export interface OrderItem {
  item: Item;
  quantity: number;
  storeTag?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  createdAt: Date;
  supplier?: string;
}

export interface CompletedOrder {
  id: string;
  items: OrderItem[];
  completedAt: Date;
  storeTags: string[];
}

export interface CurrentOrderMetadata {
  orderType: OrderType;
  paymentMethod?: PaymentMethod;
  manager?: string;
  store?: StoreTag;
}

export interface AppSettings {
  defaultSupplier?: string;
  orderTemplate?: string;
  posMode?: boolean;
  autosave?: boolean;
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

export interface PendingOrderItem {
  item: Item;
  quantity: number;
  isNewItem?: boolean;
}

export type PendingOrderStatus = 'pending' | 'processing' | 'completed';

export const ORDER_TYPES = ['Delivery', 'Pickup'] as const;
export type OrderType = typeof ORDER_TYPES[number];

export const PAYMENT_METHODS = ['Aba', 'COD', 'TrueMoney', 'CreditLine'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface PendingOrder {
  id: string;
  supplier: string;
  items: PendingOrderItem[];
  status: PendingOrderStatus;
  storeTag?: StoreTag;
  orderType?: OrderType;
  paymentMethod?: PaymentMethod;
  contactPerson?: string;
  notes?: string;
  invoiceUrl?: string;
  amount?: number;
  isReceived?: boolean;
  isPaid?: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
