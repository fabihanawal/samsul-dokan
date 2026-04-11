# Testing Checklist - Samsul's Grocery

Comprehensive testing guide to ensure all features work correctly.

## Pre-Testing Setup

1. Fresh install: `npm install`
2. Environment variables set: `.env.local`
3. Database initialized: `npm run setup-db`
4. Dev server running: `npm run dev`
5. Browser: Fresh tab, cache cleared

---

## Customer Features Testing

### Homepage & Navigation
- [ ] Homepage loads without errors
- [ ] All sections visible on scroll
- [ ] Navigation works smoothly
- [ ] Banner/carousel displays correctly
- [ ] Category filters visible

### Product Browsing
- [ ] All products load from database
- [ ] Product images display
- [ ] Product prices show correctly
- [ ] Product unit shows (kg, piece, etc.)
- [ ] Stock indicator works (shows "স্টক সীমিত" when <10)
- [ ] Category filtering works
- [ ] Search functionality works (if implemented)

### Product Details Modal
- [ ] Click product opens modal
- [ ] Modal shows full product info
- [ ] Product image displays in modal
- [ ] Price and unit display correctly
- [ ] Description shows in Bengali
- [ ] Category badge appears
- [ ] Close button (X) works
- [ ] Modal closes on background click

### Shopping Cart
- [ ] Add to cart button works
- [ ] Quick view button works (hover)
- [ ] Cart sidebar opens
- [ ] Product appears in cart
- [ ] Quantity increment/decrement works
- [ ] Remove from cart works
- [ ] Cart count updates in header
- [ ] Total price calculates correctly
- [ ] Empty cart message shows when cart is empty
- [ ] Cart persists on page reload (if implementing localStorage)

### Checkout Process
- [ ] Checkout button visible in cart
- [ ] Checkout form shows all fields
- [ ] Required fields have validation:
  - [ ] Customer name required
  - [ ] Phone required (format validation)
  - [ ] Address required
- [ ] Submit button works
- [ ] Order data saves to database
- [ ] Confirmation page shows:
  - [ ] Unique order ID
  - [ ] Customer details
  - [ ] Order items and total
  - [ ] Delivery estimate
  - [ ] Contact information
- [ ] Confetti animation plays
- [ ] Back to shop button works

### Responsive Design
- [ ] Mobile (320px): All elements fit
- [ ] Tablet (768px): Layout optimized
- [ ] Desktop (1024px+): Full layout
- [ ] Touch targets are large enough (48px+)
- [ ] Text is readable on all sizes
- [ ] Images scale properly
- [ ] No horizontal scrolling

### Performance
- [ ] Page loads in <3 seconds
- [ ] No layout shift (CLS)
- [ ] Smooth animations
- [ ] No jank on scroll
- [ ] Images load efficiently

---

## Admin Panel Testing

### Access Admin Panel
- [ ] Admin panel opens with admin URL
- [ ] Only authorized users can access (if auth added)
- [ ] Layout looks correct
- [ ] All tabs visible

### Dashboard Tab
- [ ] Total customers shows
- [ ] Total orders shows
- [ ] Recent orders display
- [ ] Sales metrics visible
- [ ] Order status breakdown shows

### Products Tab
- [ ] All products list displays
- [ ] Product grid loads from database
- [ ] Edit button works
- [ ] Delete button works with confirmation
- [ ] Add product form visible

### Add/Edit Product
- [ ] Name field accepts input
- [ ] Price field accepts numbers
- [ ] Unit dropdown has options
- [ ] Category dropdown works
- [ ] Image upload works
- [ ] Stock field accepts numbers
- [ ] Description field accepts text
- [ ] Submit button saves to database
- [ ] New products appear in store
- [ ] Product updates reflect immediately
- [ ] Edit existing product works
- [ ] Changes save correctly

### Orders Tab
- [ ] All orders display in table
- [ ] Order ID shows correctly
- [ ] Customer name shows
- [ ] Order total shows
- [ ] Status dropdown works
- [ ] Can change order status
- [ ] Status updates immediately
- [ ] Filter by status works (if implemented)
- [ ] Search orders works (if implemented)

### Slides/Banner Tab
- [ ] Current slides display
- [ ] Edit button works
- [ ] Delete button works
- [ ] Add slide form visible
- [ ] Image upload works
- [ ] Title field accepts text
- [ ] Subtitle field accepts text
- [ ] Button text field works
- [ ] Submit saves to database
- [ ] Changes reflect in homepage carousel

### Settings Tab
- [ ] Store name field editable
- [ ] Address field editable
- [ ] Phone field editable
- [ ] Save button works
- [ ] Settings update in database
- [ ] Changes persist after refresh

---

## Database Testing

### Supabase Connection
- [ ] Connection established
- [ ] Tables created successfully
- [ ] Sample data populated
- [ ] Real-time subscriptions working

### Products Table
- [ ] All columns present:
  - [ ] id, name, price, unit, category
  - [ ] image, description, stock
  - [ ] created_at, updated_at
- [ ] Data types correct
- [ ] Indexes created
- [ ] Can insert new products
- [ ] Can update products
- [ ] Can delete products
- [ ] Stock updates when purchased

### Orders Table
- [ ] All columns present:
  - [ ] id, customerName, phone, address
  - [ ] items (JSONB), total, status
  - [ ] date, created_at, updated_at
- [ ] Data types correct
- [ ] Constraints working (status enum)
- [ ] New orders save
- [ ] Status updates work
- [ ] Order history preserved

### Slides Table
- [ ] All columns present
- [ ] Can insert slides
- [ ] Can update slides
- [ ] Can delete slides
- [ ] Changes reflect in carousel

---

## Integration Testing

### Image Handling
- [ ] External URLs load
- [ ] Image not found shows placeholder
- [ ] Broken links handled gracefully
- [ ] Image optimization working
- [ ] Lazy loading (if implemented)

### Real-time Updates
- [ ] Orders update in admin without refresh
- [ ] Product stock updates immediately
- [ ] Multiple admin tabs sync data
- [ ] Subscription connections stable

### File Uploads
- [ ] Image upload works
- [ ] File size validated
- [ ] Format validated (jpg, png, etc.)
- [ ] Upload progress shows
- [ ] Successful upload confirmed
- [ ] Uploaded image appears

---

## Error Handling Testing

### Network Errors
- [ ] Handle database connection errors
- [ ] Show friendly error messages
- [ ] Retry functionality works
- [ ] Don't expose sensitive error details

### Form Validation
- [ ] Empty fields rejected
- [ ] Invalid email rejected (if applicable)
- [ ] Phone number format validated
- [ ] Price validates as number
- [ ] Stock validates as number
- [ ] Error messages clear

### Edge Cases
- [ ] Order with 0 items rejected
- [ ] Negative prices rejected
- [ ] Duplicate product names allowed
- [ ] Very long product names handled
- [ ] Special characters in names handled
- [ ] Unicode (Bengali) handled correctly

---

## Security Testing

### Data Protection
- [ ] Sensitive data not in console logs
- [ ] Environment variables hidden
- [ ] No credentials in code
- [ ] Supabase keys not exposed

### Input Validation
- [ ] SQL injection not possible
- [ ] XSS vulnerabilities checked
- [ ] CSRF protection (if forms submitted)
- [ ] File upload validation

### Authentication (if implemented)
- [ ] Admin login works
- [ ] Logout works
- [ ] Session timeout works
- [ ] Password reset works
- [ ] Unauthorized access blocked

---

## Browser Compatibility

Test on these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

For each browser, verify:
- [ ] Page loads completely
- [ ] No JavaScript errors
- [ ] Layout looks correct
- [ ] Forms work
- [ ] Images display
- [ ] Buttons clickable

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all elements
- [ ] Logical tab order
- [ ] Focus indicators visible
- [ ] Skip navigation links
- [ ] Modal closes with Escape

### Screen Reader
- [ ] Images have alt text
- [ ] Form labels associated
- [ ] Button text clear
- [ ] Headings structured correctly
- [ ] ARIA labels where needed

### Color & Contrast
- [ ] Text contrast meets WCAG AA
- [ ] Not relying on color alone
- [ ] Color blind friendly
- [ ] Dark mode readable (if implemented)

---

## Performance Testing

### Load Time
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s

### Resource Usage
- [ ] Bundle size optimal
- [ ] No unused packages
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript minified

### Database Performance
- [ ] Product list loads in <500ms
- [ ] Order list loads in <1s
- [ ] Add to cart < 200ms
- [ ] Checkout submission < 1s

---

## Mobile-Specific Testing

### Touch Interactions
- [ ] Buttons easily tappable (48x48px+)
- [ ] No accidental double-taps
- [ ] Swipe gestures work (if implemented)
- [ ] Long-press handled

### Mobile UI
- [ ] Readable without zoom
- [ ] Forms easy to fill on mobile
- [ ] Modal doesn't cover entire screen
- [ ] Bottom sheet patterns work
- [ ] Mobile menu functions

### Connection
- [ ] Works on 4G
- [ ] Works on 3G (slow)
- [ ] Offline handling (if implemented)
- [ ] Retry on poor connection

---

## User Acceptance Testing

Get feedback from actual users on:
- [ ] UI is intuitive
- [ ] Navigation is clear
- [ ] Checkout is easy
- [ ] Admin panel is understandable
- [ ] Product information sufficient
- [ ] Overall user satisfaction
- [ ] Any bugs or issues found

---

## Final Sign-Off

- [ ] All critical tests passed
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Ready for production

---

## Bug Report Template

If you find an issue, document:

**Title:** Clear description of the issue
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:** What should happen
**Actual Result:** What actually happened
**Browser:** Chrome 120, Safari 17, etc.
**Screenshot:** If applicable

---

## Continuous Testing

After deployment, regularly:
- [ ] Check error logs weekly
- [ ] Monitor performance metrics
- [ ] Test with real users
- [ ] Update browser compatibility
- [ ] Security scans monthly
- [ ] Database performance review
- [ ] User feedback collection
