# 🛒 Samsul's Grocery (সামসুল'স গ্রোসারি)

A modern, fully-featured Bengali e-commerce platform for groceries built with React, Vite, TypeScript, and Supabase.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## ✨ Features

### 🏪 Customer Features
- **Product Catalog** - Browse products by category with search and filtering
- **Product Details** - View detailed product information with images
- **Shopping Cart** - Add/remove items, manage quantities
- **Checkout** - Complete order with delivery details
- **Order Confirmation** - Track order status with unique ID
- **Mobile Responsive** - Works perfectly on all devices
- **Bengali UI** - Fully localized in Bengali language

### 👨‍💼 Admin Features
- **Dashboard** - Overview of orders, customers, and sales
- **Product Management** - Add, edit, delete products with image uploads
- **Order Management** - View all orders and update their status
- **Banner Management** - Create and manage promotional carousel slides
- **Settings** - Update store information, contact details
- **Real-time Updates** - Live order notifications

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm, yarn, or pnpm
- Supabase account (free tier available at supabase.com)

### Installation

1. **Clone or download** the project
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize database:**
   ```bash
   npm run setup-db
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Visit `http://localhost:5173`

**See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions!**

---

## 📚 Tech Stack

- **Frontend**: React 19.2, TypeScript, Tailwind CSS
- **Build Tool**: Vite 6
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime Subscriptions
- **UI Icons**: Lucide React
- **Animations**: Canvas Confetti
- **Styling**: Tailwind CSS

---

## 📁 Project Structure

```
├── App.tsx                    # Main app component
├── index.tsx                  # React entry point
├── index.css                  # Global styles
├── supabase.ts               # Supabase client
├── types.ts                  # TypeScript interfaces
├── data.ts                   # Default demo data
│
├── components/
│   ├── ProductCard.tsx       # Product card component
│   ├── CartSidebar.tsx       # Shopping cart sidebar
│   └── AdminPanel.tsx        # Admin dashboard
│
├── scripts/
│   ├── setup-database.sql    # Database schema
│   └── setup-db.js           # Setup helper script
│
├── public/                   # Static assets
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
└── package.json             # Dependencies
```

---

## 🎨 Customization

### Update Store Info
Edit `App.tsx` footer section:
```typescript
<h1 className="text-3xl font-black">সামসুল'স গ্রোসারি</h1>
<p className="text-gray-400">বদলগাছী বাজার রোড, নওগাঁ, বাংলাদেশ</p>
```

### Add Products
1. Click admin button in header (or add `?admin=true` to URL)
2. Go to "PRODUCTS" tab
3. Fill form and upload image
4. Click "পণ্য সেভ করুন"

### Change Theme Colors
Modify Tailwind color classes in components:
- Replace `emerald-*` with your preferred color
- Update in `App.tsx`, `ProductCard.tsx`, etc.

---

## 🔐 Production Checklist

Before deploying to production:

- [ ] Add Supabase authentication for admin access
- [ ] Implement payment gateway (Stripe, SSLCommerz)
- [ ] Set up email notifications for orders
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS only
- [ ] Add rate limiting to API calls
- [ ] Set up database backups
- [ ] Implement analytics/logging
- [ ] Add order verification system
- [ ] Set up customer support system

---

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### GitHub Pages
1. Set repo visibility to public
2. Build: `npm run build`
3. Deploy dist folder to gh-pages

### Other Platforms
Any platform supporting Node.js can host this app:
- Railway.app
- Render.com
- Fly.io
- DigitalOcean

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 💬 Support & Contact

For support or questions:
1. Check [QUICKSTART.md](QUICKSTART.md) for setup help
2. Review [SETUP.md](SETUP.md) for detailed configuration
3. Check browser console for error messages
4. Review Supabase logs in dashboard

---

## 🙏 Credits

Built with ❤️ for the Badalgachhi community in Naogaon, Bangladesh.

Happy shopping! 🥬🥕🍌🛒
