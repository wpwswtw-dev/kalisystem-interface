-- Populate categories from default-data-new.json
INSERT INTO categories (id, name, emoji) VALUES
('category', 'category', '📦'),
('notset', 'Notset', '❓'),
('cleaning-for-kitchen', 'Cleaning for kitchen', '🧼'),
('box', 'Box', '📦'),
('️ustensil', '️Ustensil', '🛍'),
('️plastic-bag', '️Plastic bag', '🛍'),
('kitchen-roll', 'kitchen roll', '🎁'),
('cheese', 'Cheese', '🧀'),
('cream', 'Cream', '🥣'),
('eggs', 'Eggs', '🥚'),
('butter', 'Butter', '🧈'),
('french-fries', 'French fries', '🍟'),
('pork', 'Pork', '🐷'),
('beef', 'Beef', '🐮'),
('chicken', 'Chicken', '🐔'),
('fish', 'Fish', '🐟'),
('seafood', 'Seafood', '🦞'),
('picked', 'Picked', '🥒'),
('rice', 'Rice', '🍚'),
('noodle', 'Noodle', '🍜'),
('baking', 'Baking', '🍞'),
('can', 'Can', '🥫'),
('herbs-&-spices', 'Herbs & spices', '🌿'),
('seasoning', 'Seasoning', '🧂'),
('sauce', 'Sauce', '🫙'),
('veg', 'Veg', '🥦'),
('herbs-(fresh)', 'Herbs (fresh)', '🌿'),
('sodas', 'Sodas', '🥤'),
('water', 'Water', '💧'),
('fruit-juices', 'Fruit juices', '🧃'),
('syrup', 'Syrup', '🧋'),
('coffee', 'Coffee', '☕'),
('milk', 'Milk', '🥛'),
('tea', 'Tea', '🫖'),
('beers', 'Beers', '🍺'),
('wines', 'Wines', '🍷'),
('cigs', 'Cigs', '🚬'),
('spirits', 'Spirits', '🥃'),
('fruits', 'Fruits', '🍑'),
('desserts', 'Desserts', '🍨'),
('️cup', '️Cup', '🛍'),
('️ustensils', '️Ustensils', '🛍'),
('️office', '️Office', '🖨'),
('cleaning', 'Cleaning', '🧼')
ON CONFLICT (id) DO NOTHING;

-- Populate suppliers
INSERT INTO suppliers (id, name, default_payment_method, default_order_type) VALUES
('default_supplier', 'default_supplier', 'cash', 'pickup'),
('pisey', 'pisey', 'cash', 'delivery'),
('pp-distributor', 'pp distributor', 'cash', 'delivery'),
('takaway-shop', 'Takaway shop', 'cash', 'delivery'),
('pizza+', 'pizza+', 'cash', 'delivery'),
('lees', 'lees', 'cash', 'delivery'),
('baker-supplies', 'baker supplies', 'cash', 'delivery'),
('samu', 'samu', 'cash', 'pickup'),
('rodina', 'rodina', 'cash', 'delivery'),
('market', 'market', 'cash', 'pickup'),
('chanorai', 'chanorai', 'cash', 'delivery'),
('coca-company', 'coca company', 'cash', 'delivery'),
('drink-shop', 'drink shop', 'cash', 'pickup'),
('angkor-company', 'angkor company', 'cash', 'pickup'),
('kofi', 'kofi', 'cash', 'delivery'),
('savuth', 'savuth', 'cash', 'pickup')
ON CONFLICT (id) DO NOTHING;

-- Populate settings
INSERT INTO settings (id, default_supplier, autosave) VALUES
('default', 'pisey', true)
ON CONFLICT (id) DO UPDATE SET
  default_supplier = EXCLUDED.default_supplier,
  autosave = EXCLUDED.autosave;
