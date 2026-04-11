-- Samsul's Grocery - Database Schema Setup
-- Execute this SQL in your Supabase SQL Editor

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price float8 NOT NULL,
  unit text NOT NULL,
  category text NOT NULL,
  image text,
  description text,
  stock int4 DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create Slides Table
CREATE TABLE IF NOT EXISTS slides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image text NOT NULL,
  title text NOT NULL,
  subtitle text,
  buttonText text DEFAULT 'বাজার শুরু করুন',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customerName text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  items jsonb NOT NULL,
  total float8 NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Delivered', 'Cancelled')),
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Disable Row Level Security for all tables (public access)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 5. Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customerName);

-- 6. Enable Real-time for orders table (for admin notifications)
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE slides REPLICA IDENTITY FULL;

-- Initial seed data (optional - remove if you want to start fresh)
INSERT INTO products (name, price, unit, category, image, description, stock)
VALUES 
  ('মিনিকেট চাল (১ কেজি)', 68, 'কেজি', 'চাল', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', 'উন্নত মানের পরিষ্কার ও ঝকঝকে মিনিকেট চাল।', 100),
  ('রূপচাঁদা সয়াবিন তেল (২ লিটার)', 380, 'বোতল', 'তেল', 'https://images.unsplash.com/photo-1620706859477-e4abc8a7b2a7?auto=format&fit=crop&q=80&w=400', 'ভিটামিন এ সমৃদ্ধ খাঁটি সয়াবিন তেল।', 50),
  ('দেশি লাল আলু', 55, 'কেজি', 'শাক-সবজি', 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=400', 'ক্ষেত থেকে তোলা একদম তাজা ও পুষ্টিকর লাল আলু।', 200),
  ('সবরি কলা (১ ডজন)', 120, 'ডজন', 'ফল', 'https://images.unsplash.com/photo-1528825871115-3581a5387918?auto=format&fit=crop&q=80&w=400', 'মিষ্টি ও সুস্বাদু সবরি কলা।', 30),
  ('প্রাণ চানাচুর (১৫০ গ্রাম)', 45, 'প্যাকেট', 'নাস্তা', 'https://images.unsplash.com/photo-1601050690597-df056fb46b45?auto=format&fit=crop&q=80&w=400', 'মচমচে এবং ঝাল চানাচুর।', 100),
  ('কোকা-কোলা (৫০০ মিলি)', 40, 'বোতল', 'পানীয়', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400', 'ঠান্ডা রিফ্রেশিং পানীয়।', 80)
ON CONFLICT DO NOTHING;

INSERT INTO slides (image, title, subtitle, buttonText)
VALUES 
  ('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200', 'টাটকা ও সতেজ বাজার একদম ঘরের দরজায়!', 'বদলগাছীর সবচেয়ে বিশ্বস্ত অনলাইন গ্রোসরি শপ। ১ ঘণ্টার মধ্যে ডেলিভারি নিশ্চিত।', 'বাজার শুরু করুন'),
  ('https://images.unsplash.com/photo-1543083477-4f77cdaae6d2?auto=format&fit=crop&q=80&w=1200', 'সাপ্তাহিক ধামাকা অফার!', 'চাল, ডাল এবং তেলের ওপর পান বিশেষ মূল্যছাড়। অফার সীমিত সময়ের জন্য।', 'অফার দেখুন'),
  ('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200', 'সুস্থ থাকুন, নিরাপদ পণ্য কিনুন', 'আমরা দিচ্ছি ১০০% ভেজালমুক্ত পণ্যের নিশ্চয়তা। আপনার পরিবারের স্বাস্থ্য আমাদের অগ্রাধিকার।', 'আমাদের সম্পর্কে')
ON CONFLICT DO NOTHING;
