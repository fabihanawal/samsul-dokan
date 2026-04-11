# Quick Reference - Samsul's Grocery

## Installation (Copy & Paste)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file with:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here

# 3. Get your Supabase credentials from:
# https://supabase.com → Your Project → Settings → API

# 4. Run setup (or manually run SQL from scripts/setup-database.sql)
npm run setup-db

# 5. Start development
npm run dev

# 6. Visit http://localhost:5173
```

---

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run setup-db     # Initialize database
```

---

## Access Admin Panel

Add `?admin=true` to your URL:
```
http://localhost:5173?admin=true
```

Or click the admin button in the header.

---

## Environment Variables

Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get from: Supabase → Settings → API

---

## Important Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app & all views |
| `supabase.ts` | Database connection |
| `components/*` | UI components |
| `types.ts` | TypeScript interfaces |
| `.env.local` | Secrets (create yourself) |

---

## Supabase Setup

1. Go to https://supabase.com
2. Create new project (or use existing)
3. Go to Settings → API
4. Copy Project URL & Anon Key
5. Add to `.env.local`
6. Run SQL from `scripts/setup-database.sql` in SQL Editor

---

## Deployment Quick Links

- **Vercel**: https://vercel.com/new
- **Netlify**: https://app.netlify.com/
- **GitHub Pages**: https://pages.github.com/

Recommended: **Vercel** (easiest for React projects)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to database" | Check Supabase URL & Key in `.env.local` |
| "Products not loading" | Run setup script, verify tables exist |
| "Images not showing" | Check image URLs are HTTPS |
| "Admin not working" | Clear cache, check console for errors |
| "Confetti not showing" | Check browser supports it |

---

## File Size Reference

- App.tsx: 443 lines (complete)
- AdminPanel.tsx: 496 lines (complete)
- CartSidebar.tsx: 95 lines (complete)
- ProductCard.tsx: 70 lines (complete)
- Database setup: 77 lines SQL

**Total code: ~1200 lines** (clean, well-organized)

---

## Key Features

Customer:
- Browse products
- Add to cart
- Checkout
- Track order

Admin:
- Manage products
- Manage orders
- Upload images
- Manage banners

---

## Performance Targets

- Page load: < 3 seconds
- Cart response: < 200ms
- Checkout submission: < 1 second
- Images: Optimized & cached

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

---

## Documentation Files

1. **README.md** - Project overview
2. **QUICKSTART.md** - 5-minute setup
3. **SETUP.md** - Detailed configuration
4. **DEPLOYMENT.md** - Step-by-step deployment
5. **TESTING.md** - Testing checklist
6. **PROJECT_COMPLETION_SUMMARY.md** - Complete overview
7. **QUICK_REFERENCE.md** - This file

---

## Next 3 Steps

1. **Install**: `npm install`
2. **Configure**: Create `.env.local` with Supabase keys
3. **Deploy**: Follow DEPLOYMENT.md

---

## Contact Info (Edit in App.tsx)

Store Name: সামসুল'স গ্রোসারি
Location: বদলগাছী বাজার রোড, নওগাঁ, বাংলাদেশ
Phone: ০১৭০০-০০০০০০

---

## Useful Links

- Project: https://github.com/YOUR_USERNAME/samsul-grocery
- Supabase: https://supabase.com
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com

---

## Before Deployment Checklist

- [ ] All env variables set
- [ ] Database tables created
- [ ] Products added
- [ ] Tested locally
- [ ] No console errors
- [ ] Images working
- [ ] Mobile responsive
- [ ] Admin panel works

---

**You're all set! Deploy today!** 🚀
