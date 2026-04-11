# Deployment Guide - Samsul's Grocery

Complete guide to deploy your grocery app to production.

## Pre-Deployment Checklist

### Code & Configuration
- [ ] All environment variables configured
- [ ] Supabase database initialized with tables
- [ ] Product images uploaded or linked
- [ ] Store information updated (name, address, phone)
- [ ] No console errors in development
- [ ] All features tested locally

### Security
- [ ] Admin panel protected with authentication (if needed)
- [ ] Supabase RLS policies configured
- [ ] CORS settings configured
- [ ] Environment variables are secret (not in git)
- [ ] Payment gateway configured (if using)

### Content
- [ ] Sample products replaced with real products
- [ ] Banners/slides updated
- [ ] Contact information correct
- [ ] Terms & conditions (if applicable)
- [ ] Privacy policy (if applicable)

---

## Deploy to Vercel (Recommended)

### Step 1: Prepare for Deployment

1. Build locally to check for errors:
```bash
npm run build
```

2. Test the build preview:
```bash
npm run preview
```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Samsul's Grocery"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/samsul-grocery.git
git push -u origin main
```

### Step 3: Deploy with Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"
6. Wait for build to complete
7. Your app is live!

### Step 4: Configure Custom Domain

1. In Vercel project settings
2. Go to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS to propagate (usually 24 hours)

---

## Deploy to Netlify

### Step 1: Build the Project

```bash
npm run build
```

### Step 2: Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site"
3. Choose "Import an existing project"
4. Connect your GitHub account
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Click "Deploy"

### Step 3: Add Custom Domain

1. In Netlify site settings
2. Go to "Domain management"
3. Add custom domain
4. Configure DNS settings

---

## Deploy to GitHub Pages

### Step 1: Configure Vite

Update `vite.config.ts`:
```typescript
export default {
  base: '/samsul-grocery/', // Your repo name
  // ... rest of config
}
```

### Step 2: Build and Deploy

```bash
npm run build
git add dist/
git commit -m "Build for GitHub Pages"
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository Settings
2. Find "Pages" section
3. Set source to "Deploy from a branch"
4. Select `gh-pages` branch
5. Save

Note: This requires the `gh-pages` package. Install with:
```bash
npm install --save-dev gh-pages
```

---

## Environment Variables for Production

Create these in your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-long-anon-key-here
```

Never commit these to Git. Use your hosting platform's secrets manager.

---

## Post-Deployment Testing

### Functional Tests
- [ ] Products load correctly
- [ ] Add to cart works
- [ ] Remove from cart works
- [ ] Cart sidebar opens/closes
- [ ] Checkout form works
- [ ] Order confirmation shows
- [ ] Admin panel accessible
- [ ] Admin can add products
- [ ] Admin can edit orders
- [ ] Images load properly
- [ ] Search/filter works
- [ ] Mobile responsive

### Performance Tests
- [ ] Page loads in under 3 seconds
- [ ] Images are optimized
- [ ] No unnecessary requests
- [ ] No console errors
- [ ] Database queries are efficient

### Security Tests
- [ ] HTTPS is enforced
- [ ] Environment variables not exposed
- [ ] Database accessible only from app
- [ ] Admin actions require auth (if implemented)
- [ ] Form inputs validated

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers
- [ ] Tablets

---

## Monitoring & Maintenance

### Set Up Monitoring

1. **Error Tracking** (optional but recommended)
   - Use Sentry, LogRocket, or similar
   - Catch and report runtime errors

2. **Analytics** (optional)
   - Use Google Analytics, Plausible, or Fathom
   - Track user behavior and conversions

3. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Get alerts if site goes down

### Regular Maintenance

- [ ] Check Supabase database usage
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Monitor performance metrics

---

## Troubleshooting Deployment Issues

### Build Fails

**Error: "Cannot find module"**
- Clear `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

**Error: "Environment variable not found"**
- Ensure all VITE_ variables are set
- Vite only exposes variables starting with `VITE_`
- Check hosting platform's secrets manager

### App Works Locally but Not Online

**Products not loading**
- Check Supabase URL is correct
- Verify Supabase project is running
- Check CORS settings in Supabase

**Images not showing**
- Verify image URLs are HTTPS
- Check Supabase Storage permissions
- Clear browser cache

**Admin panel not working**
- Check for JavaScript errors (F12)
- Verify Supabase connection
- Test with `?admin=true` in URL

### Performance Issues

**Page loads slowly**
- Optimize images (use TinyPNG)
- Enable caching in Supabase
- Use a CDN for static assets
- Check database indexes

**Database too slow**
- Add indexes to frequently queried columns
- Use Supabase query performance tools
- Archive old orders to separate table

---

## Scaling for Growth

### Database Optimization
1. Add indexes to `category` and `status` columns
2. Archive old orders (older than 6 months)
3. Use database connection pooling
4. Enable Supabase replica for read-heavy queries

### Image Optimization
1. Use Supabase Storage instead of external URLs
2. Set up image resizing/optimization
3. Use CDN for faster delivery
4. Implement lazy loading

### Caching Strategy
1. Cache product list (changes rarely)
2. Cache category list
3. Don't cache orders (time-sensitive)
4. Use browser caching for static assets

### Backup Strategy
1. Enable Supabase automated backups
2. Export database weekly
3. Store backups in secure location
4. Test restore process monthly

---

## Cost Optimization

### Supabase
- Free tier: 500MB storage, limited API calls
- Upgrade to Pro if needed
- Monitor usage in dashboard

### Hosting
- Vercel: Free tier available
- Netlify: Free tier available
- GitHub Pages: Always free
- Consider serverless options

### Images
- Store in Supabase (cheaper than external URLs)
- Optimize with TinyPNG or similar
- Use modern formats (WebP)

---

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs and status page
3. Check hosting platform status
4. Review browser console errors (F12)
5. Try clearing browser cache and cookies

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

Happy deploying!
