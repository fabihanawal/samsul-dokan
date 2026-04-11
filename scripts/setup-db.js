import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up Samsul\'s Grocery database...\n');

    // 1. Create products table
    console.log('📦 Creating products table...');
    const { error: productsError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });

    // 2. Insert sample products
    console.log('🥕 Inserting sample products...');
    const sampleProducts = [
      { name: 'মিনিকেট চাল (১ কেজি)', price: 68, unit: 'কেজি', category: 'চাল', description: 'উন্নত মানের পরিষ্কার ও ঝকঝকে মিনিকেট চাল।', stock: 100 },
      { name: 'রূপচাঁদা সয়াবিন তেল (২ লিটার)', price: 380, unit: 'বোতল', category: 'তেল', description: 'ভিটামিন এ সমৃদ্ধ খাঁটি সয়াবিন তেল।', stock: 50 },
      { name: 'দেশি লাল আলু', price: 55, unit: 'কেজি', category: 'শাক-সবজি', description: 'ক্ষেত থেকে তোলা একদম তাজা ও পুষ্টিকর লাল আলু।', stock: 200 },
      { name: 'সবরি কলা (১ ডজন)', price: 120, unit: 'ডজন', category: 'ফল', description: 'মিষ্টি ও সুস্বাদু সবরি কলা।', stock: 30 },
      { name: 'প্রাণ চানাচুর (১৫০ গ্রাম)', price: 45, unit: 'প্যাকেট', category: 'নাস্তা', description: 'মচমচে এবং ঝাল চানাচুর।', stock: 100 },
      { name: 'কোকা-কোলা (৫০০ মিলি)', price: 40, unit: 'বোতল', category: 'পানীয়', description: 'ঠান্ডা রিফ্রেশিং পানীয়।', stock: 80 }
    ];

    const { error: insertProductsError } = await supabase
      .from('products')
      .insert(sampleProducts);

    if (!insertProductsError) {
      console.log('✅ Products inserted successfully');
    }

    // 3. Create slides table
    console.log('🎬 Creating slides table...');
    const { error: slidesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS slides (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          image text NOT NULL,
          title text NOT NULL,
          subtitle text,
          buttonText text DEFAULT 'বাজার শুরু করুন',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    });

    // 4. Insert sample slides
    console.log('🖼️ Inserting sample slides...');
    const sampleSlides = [
      {
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
        title: 'টাটকা ও সতেজ বাজার একদম ঘরের দরজায়!',
        subtitle: 'বদলগাছীর সবচেয়ে বিশ্বস্ত অনলাইন গ্রোসরি শপ। ১ ঘণ্টার মধ্যে ডেলিভারি নিশ্চিত।',
        buttonText: 'বাজার শুরু করুন'
      },
      {
        image: 'https://images.unsplash.com/photo-1543083477-4f77cdaae6d2?auto=format&fit=crop&q=80&w=1200',
        title: 'সাপ্তাহিক ধামাকা অফার!',
        subtitle: 'চাল, ডাল এবং তেলের ওপর পান বিশেষ মূল্যছাড়। অফার সীমিত সময়ের জন্য।',
        buttonText: 'অফার দেখুন'
      },
      {
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200',
        title: 'সুস্থ থাকুন, নিরাপদ পণ্য কিনুন',
        subtitle: 'আমরা দিচ্ছি ১০০% ভেজালমুক্ত পণ্যের নিশ্চয়তা। আপনার পরিবারের স্বাস্থ্য আমাদের অগ্রাধিকার।',
        buttonText: 'আমাদের সম্পর্কে'
      }
    ];

    const { error: insertSlidesError } = await supabase
      .from('slides')
      .insert(sampleSlides);

    if (!insertSlidesError) {
      console.log('✅ Slides inserted successfully');
    }

    // 5. Create orders table
    console.log('📋 Creating orders table...');
    const { error: ordersError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });

    console.log('\n✨ Database setup completed successfully!');
    console.log('📊 Tables created: products, slides, orders');
    console.log('🌱 Sample data has been seeded');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
