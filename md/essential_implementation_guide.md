# Essential Implementation Guide
## Affiliate + Creator Commission Tracking

**Version:** 1.0 | **Status:** Ready to Deploy

---

## 🎯 What We Built

### Two Commission Types, One Database

**1. Affiliate (Tier Subscriptions)**
```
User A refers User B → B pays ₦50K → A earns 5% = ₦2,500
Tracked by: sourceUserId ≠ null, referralOrderId = null
```

**2. Creator (Grocery Sales)**
```
Customer uses code MASTER2024 → Buys ₦50K → Creator earns 5% = ₦2,500
Tracked by: sourceUserId = null, referralOrderId ≠ null
```

---

## 📁 Files to Update

### NEW FILES (3)
1. **`lib/affiliateTracking.ts`** - Client-side code tracking
2. **`app/api/affiliates/validate/route.ts`** - Code validation
3. **`app/api/affiliates/conversion/route.ts`** - Optional logging

### MODIFIED FILES (4)
1. **`app/api/creator/dashboard/route.ts`** ⭐ - Separate commission queries
2. **`app/api/webhooks/paystack/route.ts`** ⚠️ - Add commission creation
3. **`components/creator/Dashboard/StatsGrid.tsx`** - Breakdown cards
4. **`components/checkout/checkout-page.tsx`** ✅ - Already done

### NO CHANGES NEEDED (Database)
- Schema already has all required fields ✅
- `Order`: affiliateCode, affiliateCommission, affiliateId
- `Transaction`: sourceUserId, referralOrderId

---

## ✅ Implementation Steps

### Step 1: Add Webhook Commission (5 min)
**File:** `app/api/webhooks/paystack/route.ts`

```typescript
// IN handleChargeSuccess(), AFTER updating order to PAID:

if (order.affiliateId && order.affiliateCommission) {
  await db.transaction.create({
    data: {
      userId: order.affiliateId,
      orderId: order.id,
      reference: `COMM-${order.id}`,
      amount: order.affiliateCommission,
      status: 'COMPLETED',
      paymentMethod: 'PAYSTACK',
      type: 'COMMISSION',
      description: `Creator commission for order ${order.orderNumber}`,
      sourceUserId: null,           // ← Key: No source
      referralOrderId: order.id,    // ← Key: Has order ID
    },
  })
}
```

### Step 2: Deploy Enhanced Dashboard API (2 min)
Replace `app/api/creator/dashboard/route.ts` with enhanced version (artifact provided)

### Step 3: Update StatsGrid Component (2 min)
Replace `components/creator/Dashboard/StatsGrid.tsx` (artifact provided)

### Step 4: Test (30 min)
See [Testing](#testing) section below

---

## 🧪 Testing

### Test 1: Affiliate Commission
```sql
-- Create test referral, pay tier
-- Verify transaction:
SELECT * FROM transactions 
WHERE sourceUserId IS NOT NULL 
  AND referralOrderId IS NULL;
-- Should have amount = tier_price * commission_rate
```

### Test 2: Creator Commission
```bash
# Visit: localhost:3000?ref=TEST2024
# Complete order
# Verify:
SELECT * FROM transactions 
WHERE sourceUserId IS NULL 
  AND referralOrderId IS NOT NULL;
-- Should have amount = order_total * 0.05
```

### Test 3: Dashboard Breakdown
```bash
curl /api/creator/dashboard | jq '.stats'
# Should show:
# - totalEarnings (combined)
# - affiliateEarnings (from referrals)
# - creatorEarnings (from orders)
```

---

## 🚀 Deploy

```bash
# 1. Backup
pg_dump database > backup.sql

# 2. Deploy
git add .
git commit -m "feat: unified commission tracking"
git push origin main

# 3. Verify
curl https://your-domain.com/api/creator/dashboard
```

---

## 📊 Monitor

### Daily Health Check
```sql
-- All commissions should have ONE identifier
SELECT COUNT(*) FROM transactions
WHERE type = 'COMMISSION'
  AND sourceUserId IS NULL 
  AND referralOrderId IS NULL;
-- Should return: 0
```

### Weekly Performance
```sql
SELECT 
  CASE 
    WHEN sourceUserId IS NOT NULL THEN 'Affiliate'
    WHEN referralOrderId IS NOT NULL THEN 'Creator'
  END as type,
  COUNT(*) as count,
  SUM(amount) as total
FROM transactions
WHERE type = 'COMMISSION'
  AND createdAt >= CURRENT_DATE - 7
GROUP BY type;
```

---

## 🔧 Troubleshoot

### Dashboard Shows ₦0
**Check:** `SELECT COUNT(*) FROM transactions WHERE userId = 'user_id' AND type = 'COMMISSION'`  
**Fix:** Verify user ID matches in session vs database

### Code Not Detected
**Check:** Browser console → `localStorage.getItem('emm-fort-affiliate-code')`  
**Fix:** Ensure `initAffiliateTracking()` called in layout

### Duplicate Commissions
**Check:** 
```sql
SELECT referralOrderId, COUNT(*) 
FROM transactions 
WHERE type = 'COMMISSION' 
GROUP BY referralOrderId 
HAVING COUNT(*) > 1;
```
**Fix:** Add duplicate check in webhook (see Step 1)

### Wrong Amount
**Check:** `commission = orderTotal * 0.05`  
**Fix:** Verify not using kobo values (divide by 100)

---

## 🔐 Security Checklist

- [ ] Validate all affiliate codes (format: ALPHA + 4 digits)
- [ ] Rate limit validation API (10 req/min per IP)
- [ ] Verify Paystack webhook signatures
- [ ] Check for duplicate commissions
- [ ] No PII in logs

---

## 📈 Success Metrics

After 1 week, verify:
- [ ] Both commission types tracked
- [ ] Dashboard loads < 2s
- [ ] No duplicate transactions
- [ ] Math correct: total = affiliate + creator
- [ ] No errors in logs

---

## 🎊 Launch Checklist

- [ ] All code deployed
- [ ] Tests passing
- [ ] Database backup done
- [ ] Monitoring configured
- [ ] Team notified
- [ ] 48hr watch period

---

## 📞 Quick Reference

**Commission Rates:**
- Affiliate: 1-6% (tier-based)
- Creator: 5% (fixed)

**Key Fields:**
- `sourceUserId` ≠ null → Affiliate
- `referralOrderId` ≠ null → Creator

**Critical Files:**
- Dashboard API: Shows breakdown
- Webhook: Creates creator commissions
- StatsGrid: Displays breakdown

**Test URLs:**
- Dev: `http://localhost:3001?ref=TEST2024`
- API: `GET /api/affiliates/validate?code=TEST2024`

---

**That's it! Deploy, test, monitor. Good luck! 🚀**
