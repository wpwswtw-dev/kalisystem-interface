import { supabase } from './supabase';
import {
  Item,
  Category,
  Supplier,
  Tag,
  PendingOrder,
  CurrentOrderMetadata,
  OrderItem,
  AppSettings
} from '@/types';

export class SupabaseSync {
  private static itemsSyncInProgress = false;
  private static categoriesSyncInProgress = false;
  private static suppliersSyncInProgress = false;
  private static tagsSyncInProgress = false;

  static async syncItems(items: Item[]): Promise<void> {
    if (this.itemsSyncInProgress) return;
    this.itemsSyncInProgress = true;

    try {
      if (items.length === 0) return;

      const itemsData = items.map(item => ({
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
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('items')
        .upsert(itemsData, { onConflict: 'id' });

      if (error) throw error;
    } finally {
      this.itemsSyncInProgress = false;
    }
  }

  static async getItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
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

  static async syncCategories(categories: Category[]): Promise<void> {
    if (this.categoriesSyncInProgress) return;
    this.categoriesSyncInProgress = true;

    try {
      if (categories.length === 0) return;

      const categoriesData = categories.map(category => ({
        id: category.id,
        name: category.name,
        emoji: category.emoji,
        store_tag: category.storeTag,
        main_category: category.mainCategory,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('categories')
        .upsert(categoriesData, { onConflict: 'id' });

      if (error) throw error;
    } finally {
      this.categoriesSyncInProgress = false;
    }
  }

  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      storeTag: row.store_tag,
      mainCategory: row.main_category
    }));
  }

  static async syncSuppliers(suppliers: Supplier[]): Promise<void> {
    if (this.suppliersSyncInProgress) return;
    this.suppliersSyncInProgress = true;

    try {
      if (suppliers.length === 0) return;

      const suppliersData = suppliers.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        telegram_id: supplier.telegramId,
        payment_method: supplier.paymentMethod,
        order_type: supplier.orderType,
        categories: supplier.categories,
        default_payment_method: supplier.defaultPaymentMethod,
        default_order_type: supplier.defaultOrderType,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('suppliers')
        .upsert(suppliersData, { onConflict: 'id' });

      if (error) throw error;
    } finally {
      this.suppliersSyncInProgress = false;
    }
  }

  static async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
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

  static async syncTags(tags: Tag[]): Promise<void> {
    if (this.tagsSyncInProgress) return;
    this.tagsSyncInProgress = true;

    try {
      if (tags.length === 0) return;

      const tagsData = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        category: tag.category,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tags')
        .upsert(tagsData, { onConflict: 'id' });

      if (error) throw error;
    } finally {
      this.tagsSyncInProgress = false;
    }
  }

  static async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      category: row.category
    }));
  }


  static async syncPendingOrders(orders: PendingOrder[]): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      for (const order of orders) {
        const { error } = await supabase
          .from('pending_orders')
          .upsert({
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
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  static async getPendingOrders(): Promise<PendingOrder[]> {
    const { data, error } = await supabase
      .from('pending_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
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
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  static async syncCurrentOrder(items: OrderItem[], metadata: CurrentOrderMetadata): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const { data: existing } = await supabase
        .from('current_order')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('current_order')
          .update({
            items: items,
            order_type: metadata.orderType,
            payment_method: metadata.paymentMethod,
            manager: metadata.manager,
            store: metadata.store,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('current_order')
          .insert({
            items: items,
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

  static async getCurrentOrder(): Promise<{ items: OrderItem[]; metadata: CurrentOrderMetadata }> {
    const { data, error } = await supabase
      .from('current_order')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        items: [],
        metadata: {
          id: crypto.randomUUID(),
          status: 'draft',
          orderType: 'Delivery',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }

    return {
      items: data.items || [],
      metadata: {
        id: data.id || crypto.randomUUID(),
        status: data.status || 'draft',
        orderType: data.order_type || 'Delivery',
        paymentMethod: data.payment_method,
        manager: data.manager,
        store: data.store,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      }
    };
  }

  static async syncSettings(settings: AppSettings): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({
            default_supplier: settings.defaultSupplier,
            order_template: settings.orderTemplate,
            pos_mode: settings.posMode,
            autosave: settings.autosave,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({
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

  static async getSettings(): Promise<AppSettings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle();

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

  static async deletePendingOrder(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('pending_orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
  }

  static async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  }

  static async deleteSupplier(supplierId: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);

    if (error) throw error;
  }

  static async deleteTag(tagId: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) throw error;
  }

}
