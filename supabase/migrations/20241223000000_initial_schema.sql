-- CruLink: Forge Database Schema
-- Initial migration

-- Supabase uses gen_random_uuid() from pgcrypto (already enabled)

-- Organizations (Fabricator shops - multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#dc2626',
  stripe_account_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users with roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials available for fabrication
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'mild_steel', 'stainless', 'aluminum'
  description TEXT,
  price_per_sq_in DECIMAL(10,4) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  properties JSONB DEFAULT '{}', -- density, hardness, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material thicknesses
CREATE TABLE material_thicknesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  gauge TEXT NOT NULL,
  thickness_inches DECIMAL(6,4) NOT NULL,
  price_multiplier DECIMAL(4,2) DEFAULT 1.0,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finishes (powder coating, plating, etc.)
CREATE TABLE finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'powder_coat', 'plating', 'anodize', 'raw'
  description TEXT,
  base_price DECIMAL(10,2) DEFAULT 0,
  price_per_sq_in DECIMAL(10,4) DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  compatible_materials TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finish colors
CREATE TABLE finish_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finish_id UUID REFERENCES finishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex_color TEXT,
  texture TEXT, -- 'matte', 'gloss', 'satin', 'textured'
  upcharge DECIMAL(10,2) DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional services (welding, bending, tapping, etc.)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('flat', 'per_unit', 'per_inch', 'per_hole')),
  base_price DECIMAL(10,2) DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  options JSONB DEFAULT '[]', -- sub-options like weld types
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'production', 'shipped', 'delivered', 'cancelled')),

  -- Customer info (denormalized for order history)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Shipping
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_method TEXT,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tracking_number TEXT,

  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Platform fees
  platform_fee DECIMAL(10,2) DEFAULT 0,
  payout_amount DECIMAL(10,2) DEFAULT 0,

  -- Payment
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',

  -- Timestamps
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  production_started_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items (parts)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

  -- Part configuration
  template_id TEXT,
  template_name TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',

  -- Material
  material_id UUID REFERENCES materials(id),
  material_name TEXT NOT NULL,
  thickness_id UUID REFERENCES material_thicknesses(id),
  thickness TEXT NOT NULL,

  -- Finish
  finish_id UUID REFERENCES finishes(id),
  finish_name TEXT,
  finish_color TEXT,

  -- Services
  services JSONB DEFAULT '[]',

  -- Dimensions
  width DECIMAL(10,3),
  height DECIMAL(10,3),
  area_sq_in DECIMAL(10,2),
  perimeter_in DECIMAL(10,2),

  -- Quantity & Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,

  -- Files
  uploaded_file_url TEXT,
  generated_dxf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order messages (communication between customer and fabricator)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'fabricator', 'system')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded files
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL,

  -- Parsed data from CAD files
  detected_specs JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storefront settings (editable landing page content)
CREATE TABLE storefront_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  hero_heading TEXT DEFAULT 'Custom Metal Parts,',
  hero_accent TEXT DEFAULT 'Instant Quotes',
  hero_description TEXT DEFAULT 'Get precision-cut metal parts fabricated to your exact specifications.',
  hero_image_url TEXT,
  cta_primary_text TEXT DEFAULT 'Start with Template',
  cta_secondary_text TEXT DEFAULT 'Upload CAD File',

  -- Additional sections
  features JSONB DEFAULT '[]',
  templates_showcase JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_messages_order ON messages(order_id);
CREATE INDEX idx_materials_org ON materials(organization_id);
CREATE INDEX idx_finishes_org ON finishes(organization_id);
CREATE INDEX idx_services_org ON services(organization_id);

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_settings ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storefront_settings_updated_at BEFORE UPDATE ON storefront_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM orders;
  new_number := 'FOR-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$ language 'plpgsql';
