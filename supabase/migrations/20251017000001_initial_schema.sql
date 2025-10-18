-- Drop existing tables
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS pending_orders CASCADE;
DROP TABLE IF EXISTS current_order CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id text PRIMARY KEY,
  name text NOT NULL,
  khmer_name text,
  category text NOT NULL,
  supplier text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  unit_tag text,
  unit_price decimal(10,2),
  variant_tags jsonb DEFAULT '[]'::jsonb,
  last_ordered timestamptz,
  order_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on items" ON items FOR ALL USING (true);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL,
  main_category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on categories" ON categories FOR ALL USING (true);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id text PRIMARY KEY,
  name text NOT NULL,
  contact text,
  payment_method text,
  order_type text,
  categories text[] DEFAULT ARRAY[]::text[],
  default_payment_method text DEFAULT 'COD',
  default_order_type text DEFAULT 'Delivery',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on suppliers" ON suppliers FOR ALL USING (true);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on tags" ON tags FOR ALL USING (true);

-- Pending orders table
CREATE TABLE IF NOT EXISTS pending_orders (
  id text PRIMARY KEY,
  supplier text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  store_tag text,
  order_type text,
  payment_method text,
  contact_person text,
  notes text,
  invoice_url text,
  amount decimal(10,2),
  is_received boolean DEFAULT false,
  is_paid boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on pending_orders" ON pending_orders FOR ALL USING (true);

-- Current order table (single row for current order state)
CREATE TABLE IF NOT EXISTS current_order (
  id text PRIMARY KEY,
  items jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft',
  order_type text DEFAULT 'Delivery',
  payment_method text,
  manager text,
  store text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE current_order ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on current_order" ON current_order FOR ALL USING (true);

-- Settings table (single row for app settings)
CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY,
  default_supplier text,
  order_template text,
  autosave boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on settings" ON settings FOR ALL USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(supplier);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_pending_orders_status ON pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_orders_store_tag ON pending_orders(store_tag);
CREATE INDEX IF NOT EXISTS idx_pending_orders_supplier ON pending_orders(supplier);

-- Create updated_at trigger function with explicit search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_timestamp_items
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_suppliers
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_tags
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_pending_orders
    BEFORE UPDATE ON pending_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_current_order
    BEFORE UPDATE ON current_order
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_settings
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();