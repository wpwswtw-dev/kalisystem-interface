import { nanoid } from 'nanoid';
import { createClient } from '@supabase/supabase-js';

const STORE_TAGS = ["cv2", "o2", "wb", "sti", "myym", "leo"];

function parseDefaultData(data) {
  if (!Array.isArray(data) && data.exportInfo?.version) {
    return {
      items: data.items || [],
      categories: Object.values(data.categories || {}),
      suppliers: Object.values(data.suppliers || {}),
      stores: Object.values(data.stores || {}),
      settings: data.settings || { posMode: true, autosave: true }
    };
  }
  if (Array.isArray(data) && data.length === 2) {
    const [categoryMap, supplierMap] = data;
    const uniqueCategories = /* @__PURE__ */ new Set();
    const uniqueSuppliers = /* @__PURE__ */ new Set();
    const items = [];
    Object.entries(categoryMap).filter(([key]) => key !== "item").forEach(([itemName, categoryInfo]) => {
      const supplier = supplierMap[itemName];
      if (typeof categoryInfo === "string") {
        const [emoji, category] = categoryInfo.split(/(?=[A-Z])/);
        uniqueCategories.add(category);
        uniqueSuppliers.add(supplier);
        items.push({
          id: nanoid(),
          name: itemName,
          category,
          supplier,
          tags: []
        });
      }
    });
    const categories = Array.from(uniqueCategories).map((name) => ({
      id: nanoid(),
      name,
      emoji: "📦"
      // Default emoji
    }));
    const suppliers = Array.from(uniqueSuppliers).map((name) => ({
      id: nanoid(),
      name,
      paymentMethod: "COD",
      orderType: "Delivery",
      defaultPaymentMethod: "COD",
      defaultOrderType: "Delivery"
    }));
    const stores = STORE_TAGS.map((tag) => ({
      id: tag,
      name: tag.toUpperCase(),
      tag,
      isActive: true
    }));
    return {
      items,
      categories,
      suppliers,
      stores,
      settings: { posMode: true, autosave: true }
    };
  }
  throw new Error("Invalid data format");
}

const supabaseUrl = "https://ecomgvchuffuioxvkyqv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjb21ndmNodWZmdWlveHZreXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjM1OTAsImV4cCI6MjA3NjI5OTU5MH0.9VYmkujOK73PBR0WkZXBx_07oHUhtRTcoInKmuoiEkU";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseSync {
  static syncInProgress = false;
  static async syncItems(items) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      for (const item of items) {
        const { error } = await supabase.from("items").upsert({
          id: item.id,
          name: item.name,
          khmer_name: item.khmerName,
          category: item.category,
          supplier: item.supplier,
          tags: item.tags,
          unit_tag: item.unitTag,
          unit_price: item.unitPrice,
          variant_tags: item.variantTags,
          last_ordered: item.lastOrdered,
          order_count: item.orderCount,
          last_held: item.lastHeld,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "id" });
        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  static async getItems() {
    const { data, error } = await supabase.from("items").select("*").order("name");
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      khmerName: row.khmer_name,
      category: row.category,
      supplier: row.supplier,
      tags: row.tags || [],
      unitTag: row.unit_tag,
      unitPrice: row.unit_price,
      variantTags: row.variant_tags,
      lastOrdered: row.last_ordered,
      orderCount: row.order_count,
      lastHeld: row.last_held
    }));
  }
  static async syncCategories(categories) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      for (const category of categories) {
        const { error } = await supabase.from("categories").upsert({
          id: category.id,
          name: category.name,
          emoji: category.emoji,
          store_tag: category.storeTag,
          main_category: category.mainCategory,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "id" });
        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  static async getCategories() {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      storeTag: row.store_tag,
      mainCategory: row.main_category
    }));
  }
  static async syncSuppliers(suppliers) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      for (const supplier of suppliers) {
        const { error } = await supabase.from("suppliers").upsert({
          id: supplier.id,
          name: supplier.name,
          contact: supplier.contact,
          telegram_id: supplier.telegramId,
          payment_method: supplier.paymentMethod,
          order_type: supplier.orderType,
          categories: supplier.categories,
          default_payment_method: supplier.defaultPaymentMethod,
          default_order_type: supplier.defaultOrderType,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "id" });
        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  static async getSuppliers() {
    const { data, error } = await supabase.from("suppliers").select("*").order("name");
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      contact: row.contact,
      telegramId: row.telegram_id,
      paymentMethod: row.payment_method,
      orderType: row.order_type,
      categories: row.categories || [],
      defaultPaymentMethod: row.default_payment_method,
      defaultOrderType: row.default_order_type
    }));
  }
  static async syncTags(tags) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      for (const tag of tags) {
        const { error } = await supabase.from("tags").upsert({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          category: tag.category,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "id" });
        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  static async getTags() {
    const { data, error } = await supabase.from("tags").select("*").order("name");
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      category: row.category
    }));
  }
  static async syncPendingOrders(orders) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      for (const order of orders) {
        const { error } = await supabase.from("pending_orders").upsert({
          id: order.id,
          supplier: order.supplier,
          items: order.items,
          status: order.status,
          store_tag: order.storeTag,
          order_type: order.orderType,
          payment_method: order.paymentMethod,
          contact_person: order.contactPerson,
          notes: order.notes,
          invoice_url: order.invoiceUrl,
          amount: order.amount,
          is_received: order.isReceived,
          is_paid: order.isPaid,
          completed_at: order.completedAt?.toISOString(),
          created_at: order.createdAt.toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, { onConflict: "id" });
        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  static async getPendingOrders() {
    const { data, error } = await supabase.from("pending_orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      supplier: row.supplier,
      items: row.items || [],
      status: row.status,
      storeTag: row.store_tag,
      orderType: row.order_type,
      paymentMethod: row.payment_method,
      contactPerson: row.contact_person,
      notes: row.notes,
      invoiceUrl: row.invoice_url,
      amount: row.amount,
      isReceived: row.is_received,
      isPaid: row.is_paid,
      completedAt: row.completed_at ? new Date(row.completed_at) : void 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }
  static async syncCurrentOrder(items, metadata) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      const { data: existing } = await supabase.from("current_order").select("id").limit(1).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("current_order").update({
          items,
          order_type: metadata.orderType,
          payment_method: metadata.paymentMethod,
          manager: metadata.manager,
          store: metadata.store,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("current_order").insert({
          items,
          order_type: metadata.orderType,
          payment_method: metadata.paymentMethod,
          manager: metadata.manager,
          store: metadata.store
        });
        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  static async getCurrentOrder() {
    const { data, error } = await supabase.from("current_order").select("*").limit(1).maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        items: [],
        metadata: {
          id: crypto.randomUUID(),
          status: "draft",
          orderType: "Delivery",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    }
    return {
      items: data.items || [],
      metadata: {
        id: data.id || crypto.randomUUID(),
        status: data.status || "draft",
        orderType: data.order_type || "Delivery",
        paymentMethod: data.payment_method,
        manager: data.manager,
        store: data.store,
        createdAt: data.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: data.updated_at || (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
  static async syncSettings(settings) {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    try {
      const { data: existing } = await supabase.from("settings").select("id").limit(1).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("settings").update({
          default_supplier: settings.defaultSupplier,
          order_template: settings.orderTemplate,
          pos_mode: settings.posMode,
          autosave: settings.autosave,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("settings").insert({
          default_supplier: settings.defaultSupplier,
          order_template: settings.orderTemplate,
          pos_mode: settings.posMode,
          autosave: settings.autosave
        });
        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  static async getSettings() {
    const { data, error } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    if (error) throw error;
    if (!data) {
      return { posMode: true, autosave: true };
    }
    return {
      defaultSupplier: data.default_supplier,
      orderTemplate: data.order_template,
      posMode: data.pos_mode,
      autosave: data.autosave
    };
  }
  static async deletePendingOrder(orderId) {
    const { error } = await supabase.from("pending_orders").delete().eq("id", orderId);
    if (error) throw error;
  }
  static async deleteItem(itemId) {
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) throw error;
  }
  static async deleteCategory(categoryId) {
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) throw error;
  }
  static async deleteSupplier(supplierId) {
    const { error } = await supabase.from("suppliers").delete().eq("id", supplierId);
    if (error) throw error;
  }
  static async deleteTag(tagId) {
    const { error } = await supabase.from("tags").delete().eq("id", tagId);
    if (error) throw error;
  }
}

const syncItems = async (items) => {
  await SupabaseSync.syncItems(items);
};
const syncCategories = async (categories) => {
  await SupabaseSync.syncCategories(categories);
};
const syncSuppliers = async (suppliers) => {
  await SupabaseSync.syncSuppliers(suppliers);
};
const syncTags = async (tags) => {
  await SupabaseSync.syncTags(tags);
};
const syncSettings = async (settings) => {
  await SupabaseSync.syncSettings(settings);
};
const syncCurrentOrder = async (items, metadata) => {
  await SupabaseSync.syncCurrentOrder(items, metadata);
};
const syncPendingOrders = async (orders) => {
  await SupabaseSync.syncPendingOrders(orders);
};
const loadFromDatabase = async () => {
  const [items, categories, suppliers, tags, settings, pendingOrders] = await Promise.all([
    SupabaseSync.getItems(),
    SupabaseSync.getCategories(),
    SupabaseSync.getSuppliers(),
    SupabaseSync.getTags(),
    SupabaseSync.getSettings(),
    SupabaseSync.getPendingOrders()
  ]);
  return { items, categories, suppliers, tags, settings, pendingOrders };
};
const getCurrentOrder = async () => {
  return await SupabaseSync.getCurrentOrder();
};
const deleteItem = async (id) => {
  await SupabaseSync.deleteItem(id);
};
const deleteCategory = async (id) => {
  await SupabaseSync.deleteCategory(id);
};
const deleteSupplier = async (id) => {
  await SupabaseSync.deleteSupplier(id);
};
const deleteTag = async (id) => {
  await SupabaseSync.deleteTag(id);
};
const deletePendingOrder = async (id) => {
  await SupabaseSync.deletePendingOrder(id);
};
const saveDraft = async () => {
};
const discardDraft = async () => {
  await SupabaseSync.syncCurrentOrder([], {
    id: crypto.randomUUID(),
    status: "draft",
    orderType: "Delivery",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
};
const clearPendingOrders = async () => {
  await SupabaseSync.syncPendingOrders([]);
};
const archiveOrder = async (orderId) => {
  await SupabaseSync.deletePendingOrder(orderId);
};
const databaseSync = {
  // Core sync operations
  syncItems,
  syncCategories,
  syncSuppliers,
  syncTags,
  syncSettings,
  syncCurrentOrder,
  syncPendingOrders,
  // Data loading
  loadFromDatabase,
  getCurrentOrder,
  // Delete operations
  deleteItem,
  deleteCategory,
  deleteSupplier,
  deleteTag,
  deletePendingOrder,
  // Helper operations
  saveDraft,
  discardDraft,
  clearPendingOrders,
  archiveOrder
};

const stores = {
	cv2: {
		id: "cv2",
		name: "CV2",
		tag: "cv2",
		isActive: true
	},
	o2: {
		id: "o2",
		name: "O2",
		tag: "o2",
		isActive: true
	},
	wb: {
		id: "wb",
		name: "WB",
		tag: "wb",
		isActive: true
	},
	sti: {
		id: "sti",
		name: "STI",
		tag: "sti",
		isActive: true
	},
	myym: {
		id: "myym",
		name: "MYYM",
		tag: "myym",
		isActive: false
	},
	leo: {
		id: "leo",
		name: "LEO",
		tag: "leo",
		isActive: true
	}
};
const categories = {
	category: {
		id: "category",
		name: "category",
		emoji: "📦"
	},
	notset: {
		id: "notset",
		name: "Notset",
		emoji: "❓"
	},
	"cleaning-for-kitchen": {
		id: "cleaning-for-kitchen",
		name: "Cleaning for kitchen",
		emoji: "🧼"
	},
	box: {
		id: "box",
		name: "Box",
		emoji: "📦"
	},
	"️ustensil": {
		id: "️ustensil",
		name: "️Ustensil",
		emoji: "🛍"
	},
	"️plastic-bag": {
		id: "️plastic-bag",
		name: "️Plastic bag",
		emoji: "🛍"
	},
	"kitchen-roll": {
		id: "kitchen-roll",
		name: "kitchen roll",
		emoji: "🎁"
	},
	cheese: {
		id: "cheese",
		name: "Cheese",
		emoji: "🧀"
	},
	cream: {
		id: "cream",
		name: "Cream",
		emoji: "🥣"
	},
	eggs: {
		id: "eggs",
		name: "Eggs",
		emoji: "🥚"
	},
	butter: {
		id: "butter",
		name: "Butter",
		emoji: "🧈"
	},
	"french-fries": {
		id: "french-fries",
		name: "French fries",
		emoji: "🍟"
	},
	pork: {
		id: "pork",
		name: "Pork",
		emoji: "🐷"
	},
	beef: {
		id: "beef",
		name: "Beef",
		emoji: "🐮"
	},
	chicken: {
		id: "chicken",
		name: "Chicken",
		emoji: "🐔"
	},
	fish: {
		id: "fish",
		name: "Fish",
		emoji: "🐟"
	},
	seafood: {
		id: "seafood",
		name: "Seafood",
		emoji: "🦞"
	},
	picked: {
		id: "picked",
		name: "Picked",
		emoji: "🥒"
	},
	rice: {
		id: "rice",
		name: "Rice",
		emoji: "🍚"
	},
	noodle: {
		id: "noodle",
		name: "Noodle",
		emoji: "🍜"
	},
	baking: {
		id: "baking",
		name: "Baking",
		emoji: "🍞"
	},
	can: {
		id: "can",
		name: "Can",
		emoji: "🥫"
	},
	"herbs-&-spices": {
		id: "herbs-&-spices",
		name: "Herbs & spices",
		emoji: "🌿"
	},
	seasoning: {
		id: "seasoning",
		name: "Seasoning",
		emoji: "🧂"
	},
	sauce: {
		id: "sauce",
		name: "Sauce",
		emoji: "🫙"
	},
	veg: {
		id: "veg",
		name: "Veg",
		emoji: "🥦"
	},
	"herbs-(fresh)": {
		id: "herbs-(fresh)",
		name: "Herbs (fresh)",
		emoji: "🌿"
	},
	sodas: {
		id: "sodas",
		name: "Sodas",
		emoji: "🥤"
	},
	water: {
		id: "water",
		name: "Water",
		emoji: "💧"
	},
	"fruit-juices": {
		id: "fruit-juices",
		name: "Fruit juices",
		emoji: "🧃"
	},
	syrup: {
		id: "syrup",
		name: "Syrup",
		emoji: "🧋"
	},
	coffee: {
		id: "coffee",
		name: "Coffee",
		emoji: "☕"
	},
	milk: {
		id: "milk",
		name: "Milk",
		emoji: "🥛"
	},
	tea: {
		id: "tea",
		name: "Tea",
		emoji: "🫖"
	},
	beers: {
		id: "beers",
		name: "Beers",
		emoji: "🍺"
	},
	wines: {
		id: "wines",
		name: "Wines",
		emoji: "🍷"
	},
	cigs: {
		id: "cigs",
		name: "Cigs",
		emoji: "🚬"
	},
	spirits: {
		id: "spirits",
		name: "Spirits",
		emoji: "🥃"
	},
	fruits: {
		id: "fruits",
		name: "Fruits",
		emoji: "🍑"
	},
	desserts: {
		id: "desserts",
		name: "Desserts",
		emoji: "🍨"
	},
	"️cup": {
		id: "️cup",
		name: "️Cup",
		emoji: "🛍"
	},
	"️ustensils": {
		id: "️ustensils",
		name: "️Ustensils",
		emoji: "🛍"
	},
	"️office": {
		id: "️office",
		name: "️Office",
		emoji: "🖨"
	},
	cleaning: {
		id: "cleaning",
		name: "Cleaning",
		emoji: "🧼"
	}
};
const suppliers = {
	default_supplier: {
		id: "default_supplier",
		name: "default_supplier",
		defaultPaymentMethod: "cash",
		defaultOrderType: "pickup"
	},
	pisey: {
		id: "pisey",
		name: "pisey",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	"pp-distributor": {
		id: "pp-distributor",
		name: "pp distributor",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	"takaway-shop": {
		id: "takaway-shop",
		name: "Takaway shop",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	"pizza+": {
		id: "pizza+",
		name: "pizza+",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	lees: {
		id: "lees",
		name: "lees",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	"baker-supplies": {
		id: "baker-supplies",
		name: "baker supplies",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	samu: {
		id: "samu",
		name: "samu",
		defaultPaymentMethod: "cash",
		defaultOrderType: "pickup"
	},
	rodina: {
		id: "rodina",
		name: "rodina",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	market: {
		id: "market",
		name: "market",
		defaultPaymentMethod: "cash",
		defaultOrderType: "pickup"
	},
	chanorai: {
		id: "chanorai",
		name: "chanorai",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	"coca-company": {
		id: "coca-company",
		name: "coca company",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	"drink-shop": {
		id: "drink-shop",
		name: "drink shop",
		defaultPaymentMethod: "cash",
		defaultOrderType: "pickup"
	},
	"angkor-company": {
		id: "angkor-company",
		name: "angkor company",
		defaultPaymentMethod: "cash",
		defaultOrderType: "pickup"
	},
	kofi: {
		id: "kofi",
		name: "kofi",
		defaultPaymentMethod: "cash",
		defaultOrderType: "delivery"
	},
	savuth: {
		id: "savuth",
		name: "savuth",
		defaultPaymentMethod: "cash",
		defaultOrderType: "pickup"
	}
};
const items = [
	{
		id: "notset",
		name: "Notset",
		category: "notset",
		supplier: "unknown",
		tags: [
		]
	},
	{
		id: "dishsoap",
		name: "Dishsoap",
		category: "cleaning-for-kitchen",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "sponges",
		name: "Sponges",
		category: "cleaning-for-kitchen",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "clothes",
		name: "Clothes",
		category: "cleaning-for-kitchen",
		supplier: "hong-kong-shop",
		tags: [
		]
	},
	{
		id: "pasta-box",
		name: "Pasta box",
		category: "box",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "pizza-box",
		name: "Pizza box",
		category: "box",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "bread-box",
		name: "Bread box",
		category: "box",
		supplier: "takaway-shop",
		tags: [
		]
	},
	{
		id: "soup-box",
		name: "Soup box",
		category: "box",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "cake-box",
		name: "Cake box",
		category: "box",
		supplier: "takaway-shop",
		tags: [
		]
	},
	{
		id: "sauce-box",
		name: "Sauce box",
		category: "box",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "sushi-box",
		name: "Sushi box",
		category: "box",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "burger-box",
		name: "Burger box",
		category: "box",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "plastic-fork",
		name: "Plastic fork",
		category: "️ustensil",
		supplier: "takaway-shop",
		tags: [
		]
	},
	{
		id: "chopstick",
		name: "Chopstick",
		category: "️ustensil",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "plastic-12x20",
		name: "Plastic 12x20",
		category: "️plastic-bag",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "plastic-8x16",
		name: "Plastic 8x16",
		category: "️plastic-bag",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "wrapping-film",
		name: "Wrapping film",
		category: "kitchen-roll",
		supplier: "pizza+",
		tags: [
		]
	},
	{
		id: "baking-paper",
		name: "Baking paper",
		category: "kitchen-roll",
		supplier: "pizza+",
		tags: [
		]
	},
	{
		id: "aluminium",
		name: "Aluminium",
		category: "kitchen-roll",
		supplier: "pizza+",
		tags: [
		]
	},
	{
		id: "mozzarella",
		name: "Mozzarella",
		category: "cheese",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "cheddar-slice",
		name: "Cheddar slice",
		category: "cheese",
		supplier: "baker-supplies",
		tags: [
		]
	},
	{
		id: "cream-cheese",
		name: "Cream cheese",
		category: "cheese",
		supplier: "baker-supplies",
		tags: [
		]
	},
	{
		id: "cottage-cheese",
		name: "Cottage cheese",
		category: "cheese",
		supplier: "granny",
		tags: [
		]
	},
	{
		id: "parmesan",
		name: "Parmesan",
		category: "cheese",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "cooking-cream",
		name: "Cooking cream",
		category: "cream",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "sour-cream",
		name: "Sour cream",
		category: "cream",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "eggs",
		name: "Eggs",
		category: "eggs",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "butter",
		name: "Butter",
		category: "butter",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "french-fries",
		name: "French fries",
		category: "french-fries",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "ham",
		name: "Ham",
		category: "pork",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "bacon",
		name: "Bacon",
		category: "pork",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "pepperoni",
		name: "Pepperoni",
		category: "pork",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "pork-sausage-bbq",
		name: "Pork sausage bbq",
		category: "pork",
		supplier: "rodina",
		tags: [
		]
	},
	{
		id: "pork-shoulder-bbq",
		name: "Pork shoulder bbq",
		category: "pork",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "beef-(burger)",
		name: "Beef (burger)",
		category: "beef",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "beef-(steak)",
		name: "Beef (steak)",
		category: "beef",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "chicken-breast",
		name: "Chicken breast",
		category: "chicken",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "chicken-wing",
		name: "Chicken wing",
		category: "chicken",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "chicken-sausage-bbq",
		name: "Chicken sausage bbq",
		category: "chicken",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "smoked-chicken-sausage",
		name: "Smoked chicken sausage",
		category: "chicken",
		supplier: "rodina",
		tags: [
		]
	},
	{
		id: "smoked-duck-breast",
		name: "Smoked duck breast",
		category: "chicken",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "white-fish",
		name: "White fish",
		category: "fish",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "bar-fish",
		name: "Bar fish",
		category: "fish",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "red-fish",
		name: "Red fish",
		category: "fish",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "salmon-fish",
		name: "Salmon fish",
		category: "fish",
		supplier: "chanorai",
		tags: [
		]
	},
	{
		id: "squid",
		name: "Squid",
		category: "seafood",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "shrimp",
		name: "Shrimp",
		category: "seafood",
		supplier: "market",
		tags: [
		]
	},
	{
		id: "fish-roe",
		name: "Fish roe",
		category: "seafood",
		supplier: "pizza+",
		tags: [
		]
	},
	{
		id: "crab-stick",
		name: "Crab stick",
		category: "seafood",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "onion-pickles",
		name: "Onion pickles",
		category: "picked",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "capers",
		name: "Capers",
		category: "picked",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "black-&-green-olives",
		name: "Black & green olives",
		category: "picked",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "gherkins",
		name: "Gherkins",
		category: "picked",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "pink-ginger",
		name: "Pink ginger",
		category: "picked",
		supplier: "chanorai",
		tags: [
		]
	},
	{
		id: "wasabi",
		name: "Wasabi",
		category: "picked",
		supplier: "pizza+",
		tags: [
		]
	},
	{
		id: "rice",
		name: "Rice",
		category: "rice",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "japanese-rice",
		name: "Japanese rice",
		category: "rice",
		supplier: "pizza+",
		tags: [
		]
	},
	{
		id: "buckwheat",
		name: "Buckwheat",
		category: "rice",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "yellow-noodles",
		name: "Yellow noodles",
		category: "noodle",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "spaghetti",
		name: "Spaghetti",
		category: "noodle",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🥟-dumpling-dough",
		name: "🥟 dumpling dough",
		category: "baking",
		supplier: "chinese-mart",
		tags: [
		]
	},
	{
		id: "🍕-pizza-dough/flour",
		name: "🍕 pizza dough/flour",
		category: "baking",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍤-tempura-flour",
		name: "🍤 tempura flour",
		category: "baking",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍞-yeast",
		name: "🍞 yeast",
		category: "baking",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍤-breadcrumbs",
		name: "🍤 breadcrumbs",
		category: "baking",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍔-bun's-(burger-bread)",
		name: "🍔 bun's (burger bread)",
		category: "baking",
		supplier: "mummy-yummy",
		tags: [
		]
	},
	{
		id: "🫓-lavash",
		name: "🫓 lavash",
		category: "baking",
		supplier: "mummy-yummy",
		tags: [
		]
	},
	{
		id: "green-peas",
		name: "Green peas",
		category: "can",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "mushroom-can",
		name: "Mushroom can",
		category: "can",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "peeled-tomato",
		name: "Peeled tomato",
		category: "can",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "tomato-paste",
		name: "Tomato paste",
		category: "can",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "black-&-white-sesame",
		name: "Black & white sesame",
		category: "herbs-&-spices",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "rosemary",
		name: "Rosemary",
		category: "herbs-&-spices",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "bay-leaf",
		name: "Bay leaf",
		category: "herbs-&-spices",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "seaweed",
		name: "Seaweed",
		category: "herbs-&-spices",
		supplier: "chanorai",
		tags: [
		]
	},
	{
		id: "salt",
		name: "Salt",
		category: "seasoning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "sugar",
		name: "Sugar",
		category: "seasoning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "knorr-cubes",
		name: "Knorr cubes",
		category: "seasoning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "knorr-powder",
		name: "Knorr powder",
		category: "seasoning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "black-pepper",
		name: "Black pepper",
		category: "seasoning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "cooking-oil",
		name: "Cooking oil",
		category: "seasoning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "olive-oil",
		name: "Olive oil",
		category: "seasoning",
		supplier: "sara",
		tags: [
		]
	},
	{
		id: "oyster-sauce",
		name: "Oyster sauce",
		category: "sauce",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "sweet-chili-sauce",
		name: "Sweet chili sauce",
		category: "sauce",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "ketchup-big",
		name: "Ketchup big",
		category: "sauce",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "white-vinegar-(chinese)",
		name: "White vinegar (chinese)",
		category: "sauce",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "vinegar-(thai)",
		name: "Vinegar (thai)",
		category: "sauce",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "fish-sauce",
		name: "Fish sauce",
		category: "sauce",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "khmer-soy-sauce",
		name: "Khmer soy sauce",
		category: "sauce",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "teryaki-sauce",
		name: "Teryaki sauce",
		category: "sauce",
		supplier: "chanorai",
		tags: [
		]
	},
	{
		id: "kikkoman-big",
		name: "Kikkoman big",
		category: "sauce",
		supplier: "chanorai",
		tags: [
		]
	},
	{
		id: "mayonnaise",
		name: "Mayonnaise",
		category: "sauce",
		supplier: "sara",
		tags: [
		]
	},
	{
		id: "potato",
		name: "Potato",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "tomato",
		name: "Tomato",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "iceberg",
		name: "Iceberg",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "cucumber-long",
		name: "Cucumber long",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "onion",
		name: "Onion",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "yellow-bellpepper",
		name: "Yellow bellpepper",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "red-bellpepper",
		name: "Red bellpepper",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "carrot",
		name: "Carrot",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "cabbage",
		name: "Cabbage",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "broccoli",
		name: "Broccoli",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "avocado",
		name: "Avocado",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "mushroom",
		name: "Mushroom",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "aubergine",
		name: "Aubergine",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "zuchini",
		name: "Zuchini",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "garlic-white",
		name: "Garlic white",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "red-onion",
		name: "Red onion",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "shallots",
		name: "Shallots",
		category: "veg",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "basil",
		name: "Basil",
		category: "herbs-(fresh)",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "coriander",
		name: "Coriander",
		category: "herbs-(fresh)",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "parsley",
		name: "Parsley",
		category: "herbs-(fresh)",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "coca",
		name: "Coca",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "coca-zero",
		name: "Coca zero",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "soda",
		name: "Soda",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "sprite",
		name: "Sprite",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "fanta",
		name: "Fanta",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "tonic",
		name: "Tonic",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "aquarius",
		name: "Aquarius",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "ginger-ale",
		name: "Ginger ale",
		category: "sodas",
		supplier: "coca-company",
		tags: [
		]
	},
	{
		id: "pepsi",
		name: "Pepsi",
		category: "sodas",
		supplier: "drink-shop",
		tags: [
		]
	},
	{
		id: "puro-big",
		name: "Puro big",
		category: "water",
		supplier: "angkor-company",
		tags: [
		]
	},
	{
		id: "puro-small",
		name: "Puro small",
		category: "water",
		supplier: "angkor-company",
		tags: [
		]
	},
	{
		id: "blue-sea-big",
		name: "Blue sea big",
		category: "water",
		supplier: "stock",
		tags: [
		]
	},
	{
		id: "blue-sea-small",
		name: "Blue sea small",
		category: "water",
		supplier: "stock",
		tags: [
		]
	},
	{
		id: "mango-juice",
		name: "Mango juice",
		category: "fruit-juices",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "orange-juice",
		name: "Orange juice",
		category: "fruit-juices",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "cranberry-juice",
		name: "Cranberry juice",
		category: "fruit-juices",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "apple-juice",
		name: "Apple juice",
		category: "fruit-juices",
		supplier: "lees",
		tags: [
		]
	},
	{
		id: "caramel",
		name: "Caramel",
		category: "syrup",
		supplier: "kofi",
		tags: [
		]
	},
	{
		id: "vanilla",
		name: "Vanilla",
		category: "syrup",
		supplier: "kofi",
		tags: [
		]
	},
	{
		id: "grenadine",
		name: "Grenadine",
		category: "syrup",
		supplier: "kofi",
		tags: [
		]
	},
	{
		id: "strawberry",
		name: "Strawberry",
		category: "syrup",
		supplier: "kofi",
		tags: [
		]
	},
	{
		id: "lemon",
		name: "Lemon",
		category: "syrup",
		supplier: "kofi",
		tags: [
		]
	},
	{
		id: "mint",
		name: "Mint",
		category: "syrup",
		supplier: "kofi",
		tags: [
		]
	},
	{
		id: "coffee-oro",
		name: "Coffee oro",
		category: "coffee",
		supplier: "kofi",
		tags: [
		]
	},
	{
		id: "fresh-milk",
		name: "Fresh milk",
		category: "milk",
		supplier: "baker-supplies",
		tags: [
		]
	},
	{
		id: "sweet-milk",
		name: "Sweet milk",
		category: "milk",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "almond-milk",
		name: "Almond milk",
		category: "milk",
		supplier: "7-eleven",
		tags: [
		]
	},
	{
		id: "black-tea",
		name: "Black tea",
		category: "tea",
		supplier: "chinese-mart",
		tags: [
		]
	},
	{
		id: "green-tea",
		name: "Green tea",
		category: "tea",
		supplier: "chinese-mart",
		tags: [
		]
	},
	{
		id: "jasmine-tea",
		name: "Jasmine tea",
		category: "tea",
		supplier: "chinese-mart",
		tags: [
		]
	},
	{
		id: "draft-keg",
		name: "Draft keg",
		category: "beers",
		supplier: "angkor-company",
		tags: [
		]
	},
	{
		id: "angkor",
		name: "Angkor",
		category: "beers",
		supplier: "angkor-company",
		tags: [
		]
	},
	{
		id: "cambodia",
		name: "Cambodia",
		category: "beers",
		supplier: "drink-shop",
		tags: [
		]
	},
	{
		id: "ganzberg",
		name: "Ganzberg",
		category: "beers",
		supplier: "drink-shop",
		tags: [
		]
	},
	{
		id: "somersby-cider",
		name: "Somersby cider",
		category: "beers",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "ipa",
		name: "Ipa",
		category: "beers",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "blanc-1664",
		name: "Blanc 1664",
		category: "beers",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "corona",
		name: "Corona",
		category: "beers",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "red-wine",
		name: "Red wine",
		category: "wines",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "white-wine",
		name: "White wine",
		category: "wines",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "jinro",
		name: "Jinro",
		category: "wines",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "winston",
		name: "Winston",
		category: "cigs",
		supplier: "drink-shop",
		tags: [
		]
	},
	{
		id: "esse",
		name: "Esse",
		category: "cigs",
		supplier: "drink-shop",
		tags: [
		]
	},
	{
		id: "mevius",
		name: "Mevius",
		category: "cigs",
		supplier: "drink-shop",
		tags: [
		]
	},
	{
		id: "jack",
		name: "Jack",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "jagermeister",
		name: "Jagermeister",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "tequila",
		name: "Tequila",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "absolut",
		name: "Absolut",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "bacardi",
		name: "Bacardi",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "bailey",
		name: "Bailey",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "beefeater",
		name: "Beefeater",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "campari",
		name: "Campari",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "captain-morgan",
		name: "Captain morgan",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "cointreau",
		name: "Cointreau",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "jameson",
		name: "Jameson",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "jim-beam",
		name: "Jim beam",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "malibu",
		name: "Malibu",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "bardinet",
		name: "Bardinet",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "blue-curacao",
		name: "Blue curacao",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "peach",
		name: "Peach",
		category: "spirits",
		supplier: "samu",
		tags: [
		]
	},
	{
		id: "🍋‍🟩-lime",
		name: "🍋‍🟩 lime",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🥭-mango",
		name: "🥭 mango",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🐉-dragon",
		name: "🐉 dragon",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍊-orange",
		name: "🍊 orange",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍌-banana",
		name: "🍌 banana",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍊-mandarin",
		name: "🍊 mandarin",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🌿-mint",
		name: "🌿 mint",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍋-lemon",
		name: "🍋 lemon",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍉-watermelon",
		name: "🍉 watermelon",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "🍏-apple",
		name: "🍏 apple",
		category: "fruits",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "sweet-milk__1",
		name: "Sweet milk__1",
		category: "desserts",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "chocolate-topping",
		name: "Chocolate topping",
		category: "desserts",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "sugar-sachet",
		name: "Sugar sachet",
		category: "desserts",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "honey",
		name: "Honey",
		category: "desserts",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "whipping-cream",
		name: "Whipping cream",
		category: "desserts",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "vanilla-ice-cream",
		name: "Vanilla ice cream",
		category: "desserts",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "strawberry-ice-cream",
		name: "Strawberry ice cream",
		category: "desserts",
		supplier: "foody",
		tags: [
		]
	},
	{
		id: "frozen-strawberries",
		name: "Frozen strawberries",
		category: "desserts",
		supplier: "chanorai",
		tags: [
		]
	},
	{
		id: "4*14",
		name: "4*14",
		category: "️plastic-bag",
		supplier: "takaway-shop",
		tags: [
		]
	},
	{
		id: "trash-bag",
		name: "Trash bag",
		category: "️plastic-bag",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "cup-small-16",
		name: "Cup small 16",
		category: "️cup",
		supplier: "takaway-shop",
		tags: [
		]
	},
	{
		id: "cup-big-22",
		name: "Cup big 22",
		category: "️cup",
		supplier: "takaway-shop",
		tags: [
		]
	},
	{
		id: "cup-coffee",
		name: "Cup coffee",
		category: "️cup",
		supplier: "pp-distributor",
		tags: [
		]
	},
	{
		id: "straw-big",
		name: "Straw big",
		category: "️ustensils",
		supplier: "baker-supplies",
		tags: [
		]
	},
	{
		id: "straw-small",
		name: "Straw small",
		category: "️ustensils",
		supplier: "baker-supplies",
		tags: [
		]
	},
	{
		id: "napkin-small",
		name: "Napkin small",
		category: "️ustensils",
		supplier: "savuth",
		tags: [
		]
	},
	{
		id: "napkin-big",
		name: "Napkin big",
		category: "️ustensils",
		supplier: "savuth",
		tags: [
		]
	},
	{
		id: "toothpick",
		name: "Toothpick",
		category: "️ustensils",
		supplier: "takaway-shop",
		tags: [
		]
	},
	{
		id: "printer-paper",
		name: "Printer paper",
		category: "️office",
		supplier: "stock",
		tags: [
		]
	},
	{
		id: "strapples",
		name: "Strapples",
		category: "️office",
		supplier: "ebc",
		tags: [
		]
	},
	{
		id: "pens",
		name: "Pens",
		category: "️office",
		supplier: "ebc",
		tags: [
		]
	},
	{
		id: "glass-cleaner",
		name: "Glass cleaner",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "floor-cleaner",
		name: "Floor cleaner",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "duck-toilet",
		name: "Duck toilet",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "peepee-pads",
		name: "Peepee pads",
		category: "cleaning",
		supplier: "kitchen-equipment",
		tags: [
		]
	},
	{
		id: "toilet-paper-roll",
		name: "Toilet paper roll",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "hand-towel-napkin",
		name: "Hand towel napkin",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "hand-soap",
		name: "Hand soap",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "perfume-atomizer",
		name: "Perfume atomizer",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	},
	{
		id: "hand-sanitizer",
		name: "Hand sanitizer",
		category: "cleaning",
		supplier: "pisey",
		tags: [
		]
	}
];
const settings = {
	posMode: true,
	autosave: true,
	defaultSupplier: "pisey"
};
const exportInfo = {
	version: "1.0.0",
	exportedAt: "2025-10-15T16:57:51.310Z",
	lastModified: "2025-10-15T16:57:51.315Z"
};
const defaultDataJson = {
	stores: stores,
	categories: categories,
	suppliers: suppliers,
	items: items,
	settings: settings,
	exportInfo: exportInfo
};

async function loadDefaultData() {
  try {
    console.log("Parsing default data...");
    const defaultData = parseDefaultData(defaultDataJson);
    console.log("Syncing with database...");
    await Promise.all([
      databaseSync.syncItems(defaultData.items),
      databaseSync.syncCategories(defaultData.categories),
      databaseSync.syncSuppliers(defaultData.suppliers),
      databaseSync.syncSettings(defaultData.settings || { posMode: true, autosave: true })
    ]);
    console.log("Default data successfully loaded into database!");
  } catch (error) {
    console.error("Failed to load default data:", error);
    process.exit(1);
  }
}
loadDefaultData();
