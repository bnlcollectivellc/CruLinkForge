-- CruLink: Forge Seed Data
-- Demo organization and admin account

-- Insert demo organization (Browning's Welding)
INSERT INTO organizations (id, name, slug, email, phone, address, city, state, zip, primary_color, settings)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Browning''s Welding & Fabrication',
  'brownings-welding',
  'orders@browningswelding.com',
  '(501) 555-0123',
  '123 Industrial Blvd',
  'Conway',
  'AR',
  '72032',
  '#dc2626',
  '{"lead_times": {"standard": 10, "rush": 5, "super_rush": 3}}'
);

-- Insert demo admin user
-- Password: demo123! (hashed with bcrypt)
INSERT INTO users (id, email, password_hash, name, role, organization_id, email_verified)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'admin@browningswelding.com',
  '$2a$10$rQnM1Y6VhvVdh.y7hZqQXuHlPZCrL8Qv9vKzE5YzHnE5YqxVmE5YW', -- demo123!
  'John Browning',
  'admin',
  'a0000000-0000-0000-0000-000000000001',
  true
);

-- Insert demo customer user
INSERT INTO users (id, email, password_hash, name, role, email_verified)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'customer@example.com',
  '$2a$10$rQnM1Y6VhvVdh.y7hZqQXuHlPZCrL8Qv9vKzE5YzHnE5YqxVmE5YW', -- demo123!
  'Jane Smith',
  'customer',
  true
);

-- Insert materials
INSERT INTO materials (id, organization_id, name, category, price_per_sq_in) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Mild Steel (A36)', 'mild_steel', 0.12),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Stainless Steel (304)', 'stainless', 0.28),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Aluminum (6061)', 'aluminum', 0.18);

-- Insert thicknesses for Mild Steel
INSERT INTO material_thicknesses (material_id, gauge, thickness_inches, price_multiplier) VALUES
  ('c0000000-0000-0000-0000-000000000001', '18ga', 0.048, 0.8),
  ('c0000000-0000-0000-0000-000000000001', '16ga', 0.060, 0.9),
  ('c0000000-0000-0000-0000-000000000001', '14ga', 0.075, 1.0),
  ('c0000000-0000-0000-0000-000000000001', '12ga', 0.105, 1.2),
  ('c0000000-0000-0000-0000-000000000001', '10ga', 0.135, 1.5),
  ('c0000000-0000-0000-0000-000000000001', '1/8"', 0.125, 1.4),
  ('c0000000-0000-0000-0000-000000000001', '3/16"', 0.188, 1.8),
  ('c0000000-0000-0000-0000-000000000001', '1/4"', 0.250, 2.2);

-- Insert thicknesses for Stainless Steel
INSERT INTO material_thicknesses (material_id, gauge, thickness_inches, price_multiplier) VALUES
  ('c0000000-0000-0000-0000-000000000002', '18ga', 0.048, 0.8),
  ('c0000000-0000-0000-0000-000000000002', '16ga', 0.060, 0.9),
  ('c0000000-0000-0000-0000-000000000002', '14ga', 0.075, 1.0),
  ('c0000000-0000-0000-0000-000000000002', '12ga', 0.105, 1.2),
  ('c0000000-0000-0000-0000-000000000002', '10ga', 0.135, 1.5);

-- Insert thicknesses for Aluminum
INSERT INTO material_thicknesses (material_id, gauge, thickness_inches, price_multiplier) VALUES
  ('c0000000-0000-0000-0000-000000000003', '0.063"', 0.063, 0.9),
  ('c0000000-0000-0000-0000-000000000003', '0.080"', 0.080, 1.0),
  ('c0000000-0000-0000-0000-000000000003', '0.090"', 0.090, 1.1),
  ('c0000000-0000-0000-0000-000000000003', '1/8"', 0.125, 1.3),
  ('c0000000-0000-0000-0000-000000000003', '3/16"', 0.188, 1.6),
  ('c0000000-0000-0000-0000-000000000003', '1/4"', 0.250, 2.0);

-- Insert finishes
INSERT INTO finishes (id, organization_id, name, type, base_price, price_per_sq_in, compatible_materials) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Powder Coating', 'powder_coat', 25.00, 0.08, ARRAY['mild_steel', 'aluminum']),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Zinc Plating', 'plating', 35.00, 0.06, ARRAY['mild_steel']),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Anodizing', 'anodize', 40.00, 0.10, ARRAY['aluminum']),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Brushed Finish', 'mechanical', 15.00, 0.04, ARRAY['stainless', 'aluminum']);

-- Insert finish colors for Powder Coating
INSERT INTO finish_colors (finish_id, name, hex_color, texture, upcharge) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Black', '#1a1a1a', 'matte', 0),
  ('d0000000-0000-0000-0000-000000000001', 'White', '#ffffff', 'gloss', 0),
  ('d0000000-0000-0000-0000-000000000001', 'Safety Red', '#dc2626', 'gloss', 5),
  ('d0000000-0000-0000-0000-000000000001', 'Safety Yellow', '#eab308', 'gloss', 5),
  ('d0000000-0000-0000-0000-000000000001', 'John Deere Green', '#22c55e', 'gloss', 5),
  ('d0000000-0000-0000-0000-000000000001', 'Caterpillar Yellow', '#f59e0b', 'gloss', 5),
  ('d0000000-0000-0000-0000-000000000001', 'Custom RAL Color', NULL, 'varies', 25);

-- Insert services
INSERT INTO services (id, organization_id, name, description, pricing_type, base_price, unit_price, options) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Welding', 'Professional welding services', 'per_inch', 0, 2.50, '[{"id": "mig", "name": "MIG Welding", "price": 2.50}, {"id": "tig", "name": "TIG Welding", "price": 4.00}, {"id": "spot", "name": "Spot Welding", "price": 1.50}]'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Bending', 'CNC press brake bending', 'per_unit', 5.00, 3.00, '[{"id": "90deg", "name": "90° Bend", "price": 3.00}, {"id": "custom", "name": "Custom Angle", "price": 5.00}, {"id": "hem", "name": "Hem/Fold", "price": 4.00}]'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Tapping', 'Thread tapping', 'per_hole', 0, 1.50, '[]'),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Countersinking', 'Countersink holes', 'per_hole', 0, 1.00, '[]'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Deburring', 'Remove sharp edges', 'flat', 10.00, 0, '[]'),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Hardware Insertion', 'PEM nuts, studs, standoffs', 'per_unit', 0, 2.00, '[]');

-- Insert storefront settings
INSERT INTO storefront_settings (organization_id, hero_heading, hero_accent, hero_description)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Custom Metal Parts,',
  'Instant Quotes',
  'Get precision-cut metal parts fabricated to your exact specifications. Use our template builder or upload your CAD files for an instant quote.'
);

-- Insert sample orders
INSERT INTO orders (id, order_number, organization_id, customer_id, status, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_method, shipping_cost, subtotal, tax, total, platform_fee, payout_amount, placed_at)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'FOR-0045', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'new', 'John Smith', 'jsmith@email.com', '(555) 123-4567', '123 Main St', 'Conway', 'AR', '72032', 'UPS Ground', 45.00, 1698.00, 165.61, 1908.61, 95.43, 1813.18, NOW() - INTERVAL '2 hours'),
  ('f0000000-0000-0000-0000-000000000002', 'FOR-0044', 'a0000000-0000-0000-0000-000000000001', NULL, 'production', 'Acme Corp', 'orders@acme.com', '(555) 234-5678', '456 Industrial Ave', 'Little Rock', 'AR', '72201', 'UPS Ground', 65.00, 3200.00, 220.00, 3420.00, 171.00, 3249.00, NOW() - INTERVAL '1 day'),
  ('f0000000-0000-0000-0000-000000000003', 'FOR-0043', 'a0000000-0000-0000-0000-000000000001', NULL, 'shipped', 'Jane Doe', 'jane@company.com', '(555) 345-6789', '789 Oak Lane', 'Fayetteville', 'AR', '72701', 'UPS Ground', 35.00, 1150.00, 100.00, 1250.00, 62.50, 1187.50, NOW() - INTERVAL '2 days'),
  ('f0000000-0000-0000-0000-000000000004', 'FOR-0042', 'a0000000-0000-0000-0000-000000000001', NULL, 'delivered', 'Bob Wilson', 'bob@wilson.com', '(555) 456-7890', '321 Pine St', 'Springdale', 'AR', '72762', 'Will Call', 0, 4500.00, 300.00, 4800.00, 240.00, 4560.00, NOW() - INTERVAL '5 days');

-- Insert order items for sample orders
INSERT INTO order_items (order_id, template_name, material_name, thickness, quantity, unit_price, line_total, width, height)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Mounting Plate', 'Mild Steel (A36)', '14ga (0.075")', 50, 33.96, 1698.00, 6.0, 4.0),
  ('f0000000-0000-0000-0000-000000000002', 'L-Bracket', 'Mild Steel (A36)', '12ga (0.105")', 100, 32.00, 3200.00, 4.0, 3.0),
  ('f0000000-0000-0000-0000-000000000003', 'U-Channel', 'Aluminum (6061)', '1/8"', 25, 46.00, 1150.00, 8.0, 2.0),
  ('f0000000-0000-0000-0000-000000000004', 'Gusset Plate', 'Mild Steel (A36)', '1/4"', 200, 22.50, 4500.00, 4.0, 4.0);
