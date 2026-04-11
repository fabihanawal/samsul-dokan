# 🛒 Samsul's Grocery - Quick Start Guide

Welcome to Samsul's Grocery, a full-featured Bengali grocery e-commerce platform built with React, Vite, and Supabase!

## ⚡ Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Set Up Environment Variables
Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Get these from your Supabase project settings:
1. Go to https://supabase.com
2. Create a new project or use an existing one
3. Copy your **Project URL** and **Anon Key** from Settings > API

### Step 3: Initialize Database
Run the setup script to create tables and seed data:

```bash
npm run setup-db
```

Or manually run the SQL in `scripts/setup-database.sql`:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Click "Run"

### Step 4: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## 🎯 Features Overview

### For Customers
- 🏪 **Browse Products** - Filter by category, view detailed information
- 🛍️ **Shopping Cart** - Add/remove items, adjust quantities
- 📦 **Order Checkout** - Enter delivery details, place orders
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- 🇧🇩 **Bengali Language** - Complete Bengali UI

### For Admins
Access the admin panel by adding `?admin=true` to the URL (or via the admin button):

**Admin Features:**
- 📊 **Dashboard** - View orders, customers, sales metrics
- 📦 **Product Management** - Add, edit, delete products with images
- 📋 **Order Management** - Track and update order status
- 🎨 **Banner Management** - Manage carousel slides
- ⚙️ **Settings** - Update store info, phone number, address

**Admin Credentials:**
The admin panel is currently open. In production, add authentication!

---

## 📁 Project Structure

```
samsul-grocery/
├── App.tsx                 # Main app component
├── index.tsx              # React entry point
├── index.css              # Global styles
├── supabase.ts            # Supabase client setup
├── types.ts               # TypeScript types
├── data.ts                # Default demo data
├── components/
│   ├── ProductCard.tsx    # Product display component
│   ├── CartSidebar.tsx    # Shopping cart sidebar
│   └── AdminPanel.tsx     # Admin dashboard
├── scripts/
│   ├── setup-database.sql # Database schema & seed data
│   └── setup-db.js        # Node.js setup helper
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── package.json           # Dependencies
```

---

## 🗄️ Database Schema

### Products Table
```
- id: UUID (primary key)
- name: text (product name in Bengali)
- price: float (price in Taka ৳)
- unit: text (kg, liter, piece, etc.)
- category: text (rice, oil, vegetables, etc.)
- image: text (URL to product image)
- description: text (product description)
- stock: integer (inventory count)
- created_at & updated_at: timestamps
```

### Orders Table
```
- id: UUID (primary key)
- customerName: text
- phone: text
- address: text
- items: JSONB (cart items with quantities)
- total: float (total price)
- status: text ('Pending', 'Delivered', 'Cancelled')
- date: timestamp
```

### Slides Table
```
- id: UUID (primary key)
- image: text (banner image URL)
- title: text (main title)
- subtitle: text (description)
- buttonText: text (CTA button text)
```

---

## 🎨 Customization

### Update Store Information
Edit the footer and header information in `App.tsx`:
- Store name: "সামসুল'স গ্রোসরি"
- Location: "বদলগাছী বাজার রোড, নওগাঁ, বাংলাদেশ"
- Phone: "০১৭০০-০০০০০০"

### Change Colors
Tailwind CSS is configured with an emerald green theme. To change colors, modify:
- Component `bg-emerald-*` classes
- Tailwind config if needed

### Add Products
1. Go to Admin Panel (add ?admin=true to URL)
2. Click "PRODUCTS" tab
3. Fill in product details
4. Upload image
5. Click "পণ্য সেভ করুন"

---

## 🚀 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with one click!

### Deploy to Other Platforms
This is a standard Vite React app. Can be deployed to:
- Netlify
- GitHub Pages
- Firebase Hosting
- Any Node.js hosting

**Build command:** `npm run build`
**Preview command:** `npm run preview`

---

## 🔒 Security Notes

⚠️ **Important for Production:**

1. **Admin Protection** - Currently anyone can access admin panel
   - Add authentication (Supabase Auth recommended)
   - Check user role before showing admin features

2. **Payment Processing** - Currently using Cash on Delivery
   - Add payment gateway (Stripe, SSLCommerz, etc.) for online payments
   - Implement order verification system

3. **Image Storage** - Currently using external URLs
   - Consider using Supabase Storage for product images
   - Set up CDN for faster image loading

4. **Rate Limiting** - Add rate limiting to API calls
5. **Input Validation** - Validate all form inputs server-side
6. **CORS** - Configure properly for production domain

---

## 🐛 Troubleshooting

### "Connection refused" error
- Check if Supabase URL and Key are correct in `.env.local`
- Ensure Supabase project is active

### Products not loading
- Check network tab in DevTools
- Verify database tables exist
- Check Supabase project status

### Images not displaying
- Verify image URLs are accessible
- Check CORS settings in Supabase
- Use HTTPS URLs only

### Admin panel not working
- Clear browser cache
- Check console for errors
- Verify you can access Supabase

---

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console errors (F12 > Console tab)
3. Check Supabase logs and status
4. Review database schema

---

## 📄 License

This project is open source and available under the MIT License.

Happy grocery shopping! 🥬🥕🥔🍌
