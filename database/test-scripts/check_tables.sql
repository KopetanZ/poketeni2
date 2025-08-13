SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('player_inventories', 'inventory_items', 'player_equipment', 'court_facilities');
