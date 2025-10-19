import { createClient } from '@supabase/supabase-js';
import defaultData from '../src/default-data-new.json';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDatabase() {
  console.log('Starting database population...');

  // Populate stores (as tags or settings)
  console.log('\n1. Populating stores...');
  const stores = Object.values(defaultData.stores);
  console.log(`Found ${stores.length} stores`);

  // Populate categories
  console.log('\n2. Populating categories...');
  const categories = Object.values(defaultData.categories).map(cat => ({
    id: cat.id,
    name: cat.name,
    emoji: cat.emoji,
    main_category: null
  }));

  const { error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'id' });

  if (catError) {
    console.error('Error inserting categories:', catError);
  } else {
    console.log(`✓ Inserted ${categories.length} categories`);
  }

  // Populate suppliers
  console.log('\n3. Populating suppliers...');
  const suppliers = Object.values(defaultData.suppliers).map(sup => ({
    id: sup.id,
    name: sup.name,
    contact: null,
    payment_method: sup.defaultPaymentMethod,
    order_type: sup.defaultOrderType,
    categories: [],
    default_payment_method: sup.defaultPaymentMethod || 'cash',
    default_order_type: sup.defaultOrderType || 'delivery'
  }));

  const { error: supError } = await supabase
    .from('suppliers')
    .upsert(suppliers, { onConflict: 'id' });

  if (supError) {
    console.error('Error inserting suppliers:', supError);
  } else {
    console.log(`✓ Inserted ${suppliers.length} suppliers`);
  }

  // Populate items
  console.log('\n4. Populating items...');
  const items = defaultData.items.map(item => ({
    id: item.id,
    name: item.name,
    khmer_name: null,
    category: item.category,
    supplier: item.supplier,
    tags: JSON.stringify(item.tags || []),
    unit_tag: null,
    unit_price: null,
    variant_tags: JSON.stringify([]),
    last_ordered: null,
    order_count: 0
  }));

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const { error: itemError } = await supabase
      .from('items')
      .upsert(batch, { onConflict: 'id' });

    if (itemError) {
      console.error(`Error inserting items batch ${i / batchSize + 1}:`, itemError);
    } else {
      console.log(`✓ Inserted batch ${i / batchSize + 1} (${batch.length} items)`);
    }
  }

  console.log(`✓ Total items inserted: ${items.length}`);

  // Populate settings
  console.log('\n5. Populating settings...');
  const settings = {
    id: 'default',
    default_supplier: defaultData.settings.defaultSupplier || 'pisey',
    order_template: null,
    autosave: defaultData.settings.autosave !== false
  };

  const { error: settingsError } = await supabase
    .from('settings')
    .upsert(settings, { onConflict: 'id' });

  if (settingsError) {
    console.error('Error inserting settings:', settingsError);
  } else {
    console.log('✓ Inserted settings');
  }

  console.log('\n✅ Database population completed!');
  console.log('\nSummary:');
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Suppliers: ${suppliers.length}`);
  console.log(`- Items: ${items.length}`);
  console.log(`- Settings: 1`);
}

populateDatabase().catch(error => {
  console.error('Failed to populate database:', error);
  process.exit(1);
});
