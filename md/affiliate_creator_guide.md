# AFFILIATE & CREATOR SYSTEM
## Dual Commission Tracking Implementation

**Project:** EMM-Fort Affiliate Platform  
**Database:** Affiliate DB (PostgreSQL)  
**Focus:** Track TWO types of commissions in ONE system

---

## 🎯 What This Does

Tracks earnings from TWO sources:

### 1. Affiliate Program (Tier Subscriptions)
```
User A refers User B → B pays ₦50K for GOLD tier → A earns 5% = ₦2,500
Identifier: sourceUserId ≠ null
```

### 2. Creator Program (Grocery Sales)
```
Customer uses code MASTER2024 → Buys ₦50K groceries → Creator earns 5% = ₦2,500
Identifier: referralOrderId ≠ null
```

---

## 📁 Files to Create/Update

### NEW FILES (3)

#### 1. **`app/api/public/validate-creator/route.ts`** - Public validation
```typescript
// POST /api/public/validate-creator
// Called by Grocery Store to validate codes

export async function POST(request: NextRequest) {
  const { code } = await request.json()
  
  // Extract username from code (MASTER2024 → master)
  const username = code.replace(/\d{4}$/, '').toLowerCase()
  
  // Find creator in database
  const creator = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: 'insensitive' },
      isCreator: true,
      emailVerified: { not: null }
    }
  })
  
  if (!creator) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    creator: {
      id: creator.id,
      fullName: creator.fullName,
      username: creator.username
    },
    commissionRate: 0.05
  })
}
```

**Purpose:** Let grocery store validate creator codes

---

#### 2. **`app/api/public/track-commission/route.ts`** - Receive commissions
```typescript
// POST /api/public/track-commission
// Called by Grocery Store after successful order

export async function POST(request: NextRequest) {
  const {
    orderId,
    orderNumber,
    orderTotal,
    affiliateCode
  } = await request.json()
  
  // Find creator
  const username = affiliateCode.replace(/\d{4}$/, '').toLowerCase()
  const creator = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: 'insensitive' },
      isCreator: true
    }
  })
  
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }
  
  // Calculate commission (5%)
  const commission = orderTotal * 0.05
  
  // Create transaction
  await prisma.transaction.create({
    data: {
      type: 'COMMISSION',
      amount: commission,
      status: 'COMPLETED',
      userId: creator.id,
      referralOrderId: orderId,     // ← Key identifier
      sourceUserId: null,            // ← No sourceUserId
      description: `Creator commission from order #${orderNumber}`
    }
  })
  
  return NextResponse.json({ success: true, commission })
}
```

**Purpose:** Receive commission notifications from grocery store

---

#### 3. **`app/api/webhooks/paystack/route.ts`** UPDATE - Add commission logic
```typescript
// EXISTING FILE - ADD THIS BLOCK

async function handleChargeSuccess(data: any) {
  // ... existing order update code ...
  
  // NEW: Create affiliate commission for tier subscriptions
  const { userId, tierName, purpose } = data.metadata
  
  if (purpose === 'Subscription_Upgrade' || purpose === 'Initial_Subscription') {
    const amount = data.amount / 100 // Convert from kobo
    
    // Process affiliate commissions
    await processCommissions(userId, amount)
    // This creates transactions with sourceUserId ≠ null
  }
}
```

**Purpose:** Trigger affiliate commissions on tier payments

---

### MODIFIED FILES (2)

#### 1. **`app/api/creator/dashboard/route.ts`** ⭐ CRITICAL
**What changed:** Separate queries for each commission type

```typescript
// BEFORE: Single query
const totalEarnings = await prisma.transaction.aggregate({
  where: { userId, type: 'COMMISSION' },
  _sum: { amount: true }
})

// AFTER: Separate queries
const [affiliateEarnings, creatorEarnings] = await Promise.all([
  // Affiliate (tier subscriptions)
  prisma.transaction.aggregate({
    where: {
      userId,
      type: 'COMMISSION',
      sourceUserId: { not: null },  // ← Has source
      referralOrderId: null          // ← No order
    },
    _sum: { amount: true },
    _count: true
  }),
  
  // Creator (grocery sales)
  prisma.transaction.aggregate({
    where: {
      userId,
      type: 'COMMISSION',
      sourceUserId: null,            // ← No source
      referralOrderId: { not: null } // ← Has order
    },
    _sum: { amount: true },
    _count: true
  })
])

// Return both
return {
  stats: {
    totalEarnings: affiliate + creator,
    affiliateEarnings: affiliate,
    creatorEarnings: creator,
    affiliateCommissionCount: affiliateCount,
    creatorCommissionCount: creatorCount
  }
}
```

**Status:** ✅ Complete (artifact provided)

---

#### 2. **`components/creator/Dashboard/StatsGrid.tsx`** - Show breakdown
**What changed:** Added cards for each commission type

```typescript
const statsCards = [
  // Original total card
  { title: "Total Earnings", value: `₦${total}` },
  
  // NEW: Affiliate card
  {
    title: "Affiliate Commissions",
    value: `₦${stats.affiliateEarnings}`,
    subtitle: `${stats.affiliateCommissionCount} tier subscriptions`,
    icon: Users
  },
  
  // NEW: Creator card
  {
    title: "Creator Commissions",
    value: `₦${stats.creatorEarnings}`,
    subtitle: `${stats.creatorCommissionCount} grocery orders`,
    icon: ShoppingBag
  }
]
```

**Status:** ✅ Complete (artifact provided)

---

### EXISTING FILES (No Changes)

These work perfectly as-is:
- ✅ `lib/commissionService.ts` (processes affiliate commissions)
- ✅ `lib/tierData.ts` (commission rates)
- ✅ Database schema (has all fields)

---

## 🔧 Implementation Steps

### Step 1: Add Public API Routes (10 min)

**Create:** `app/api/public/validate-creator/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const { code } = await request.json()
  
  if (!code) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 })
  }
  
  const username = code.replace(/\d{4}$/, '').toLowerCase()
  
  const creator = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: 'insensitive' },
      isCreator: true,
      emailVerified: { not: null }
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      instagramHandle: true,
      tiktokHandle: true
    }
  })
  
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    creator: {
      id: creator.id,
      fullName: creator.fullName,
      username: creator.username,
      instagramHandle: creator.instagramHandle,
      tiktokHandle: creator.tiktokHandle
    },
    commissionRate: 0.05
  })
}
```

**Create:** `app/api/public/track-commission/route.ts` (full code above)

---

### Step 2: Update Creator Dashboard API (5 min)

**Replace:** `app/api/creator/dashboard/route.ts`

Use the enhanced version from artifacts that includes:
- Separate affiliate/creator queries
- Breakdown in response
- Enhanced recent activity labels

---

### Step 3: Update StatsGrid Component (5 min)

**Replace:** `components/creator/Dashboard/StatsGrid.tsx`

Use the enhanced version from artifacts that shows:
- Affiliate earnings card
- Creator earnings card
- Combined total

---

### Step 4: Update Paystack Webhook (OPTIONAL - if not done)

Only if you haven't added commission processing yet:

```typescript
// In handleChargeSuccess()
if (metadata.purpose === 'Initial_Subscription' || 
    metadata.purpose === 'Subscription_Upgrade') {
  await processCommissions(metadata.userId, amount / 100)
}
```

---

## 🧪 Testing

### Test 1: Affiliate Commission
```bash
# 1. User A (GOLD) refers User B
# 2. User B pays ₦50,000 for GOLD tier
# 3. Check database:

SELECT * FROM transactions 
WHERE type = 'COMMISSION' 
  AND sourceUserId IS NOT NULL
  AND referralOrderId IS NULL
ORDER BY createdAt DESC
LIMIT 5;

# Expected:
# - amount: 2500 (5% of 50,000)
# - userId: userA.id
# - sourceUserId: userB.id
# - referralOrderId: null
```

---

### Test 2: Creator Commission (End-to-End)
```bash
# 1. Test validation endpoint
curl -X POST http://localhost:3001/api/public/validate-creator \
  -H "Content-Type: application/json" \
  -d '{"code":"MASTER2024"}'

# Should return creator info

# 2. Test commission tracking
curl -X POST http://localhost:3001/api/public/track-commission \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test_order_123",
    "orderNumber": "EMM-12345",
    "orderTotal": 50000,
    "affiliateCode": "MASTER2024"
  }'

# Should return: { "success": true, "commission": 2500 }

# 3. Check database
SELECT * FROM transactions 
WHERE type = 'COMMISSION'
  AND referralOrderId = 'test_order_123'
  AND sourceUserId IS NULL;

# Expected:
# - amount: 2500
# - referralOrderId: 'test_order_123'
# - sourceUserId: null
```

---

### Test 3: Dashboard Shows Both
```bash
# Call dashboard API
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/creator/dashboard | jq '.stats'

# Should show:
{
  "totalEarnings": 25000,
  "affiliateEarnings": 10000,
  "affiliateCommissionCount": 5,
  "creatorEarnings": 15000,
  "creatorCommissionCount": 30
}

# Verify math: 10,000 + 15,000 = 25,000 ✓
```

---

### Test 4: Commission Type Identification
```sql
-- All commissions should be categorized correctly
SELECT 
  CASE 
    WHEN sourceUserId IS NOT NULL THEN 'Affiliate'
    WHEN referralOrderId IS NOT NULL THEN 'Creator'
    ELSE 'UNKNOWN'
  END as commission_type,
  COUNT(*) as count,
  SUM(amount) as total
FROM transactions
WHERE type = 'COMMISSION'
  AND userId = 'test_creator_id'
GROUP BY commission_type;

-- Expected:
-- Affiliate: 5 transactions, ₦10,000
-- Creator: 30 transactions, ₦15,000
-- UNKNOWN: 0 (should be empty!)
```

---

## 📊 Database Schema

### Transaction Table (Already exists! ✅)
```sql
-- Key fields for commission tracking:
type              VARCHAR   -- 'COMMISSION'
amount            DECIMAL   -- 2500.00
userId            VARCHAR   -- Creator's ID
sourceUserId      VARCHAR   -- Referrer ID (affiliate) OR null (creator)
referralOrderId   VARCHAR   -- Order ID (creator) OR null (affiliate)
status            VARCHAR   -- 'COMPLETED'
description       TEXT      -- Human-readable description
```

**How to distinguish:**
- `sourceUserId ≠ null` AND `referralOrderId = null` → **Affiliate**
- `sourceUserId = null` AND `referralOrderId ≠ null` → **Creator**

---

## 🔍 Monitoring

### Daily Health Check
```sql
-- Verify no orphaned commissions
SELECT COUNT(*) as orphaned_count
FROM transactions
WHERE type = 'COMMISSION'
  AND sourceUserId IS NULL
  AND referralOrderId IS NULL;

-- Should return: 0
```

### Weekly Performance
```sql
-- Top performers by total earnings
SELECT 
  u.fullName,
  u.username,
  COUNT(t.id) as total_commissions,
  SUM(CASE WHEN t.sourceUserId IS NOT NULL THEN t.amount ELSE 0 END) as affiliate_total,
  SUM(CASE WHEN t.referralOrderId IS NOT NULL THEN t.amount ELSE 0 END) as creator_total,
  SUM(t.amount) as combined_total
FROM users u
JOIN transactions t ON u.id = t.userId
WHERE t.type = 'COMMISSION'
  AND t.status = 'COMPLETED'
  AND t.createdAt >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.fullName, u.username
ORDER BY combined_total DESC
LIMIT 10;
```

### Commission Type Breakdown
```sql
-- Daily split
SELECT 
  DATE(createdAt) as date,
  COUNT(CASE WHEN sourceUserId IS NOT NULL THEN 1 END) as affiliate_count,
  COUNT(CASE WHEN referralOrderId IS NOT NULL THEN 1 END) as creator_count,
  SUM(CASE WHEN sourceUserId IS NOT NULL THEN amount ELSE 0 END) as affiliate_amount,
  SUM(CASE WHEN referralOrderId IS NOT NULL THEN amount ELSE 0 END) as creator_amount
FROM transactions
WHERE type = 'COMMISSION'
  AND createdAt >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(createdAt)
ORDER BY date DESC;
```

---

## 🐛 Troubleshooting

### Issue: Dashboard Shows ₦0 for Breakdown
**Check:**
```sql
-- Do transactions exist?
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN sourceUserId IS NOT NULL THEN 1 END) as has_source,
  COUNT(CASE WHEN referralOrderId IS NOT NULL THEN 1 END) as has_order
FROM transactions
WHERE userId = 'creator_id' AND type = 'COMMISSION';
```

**Fix:** Verify API queries use correct filters

---

### Issue: Creator Code Not Working
**Check:**
```bash
# Test validation
curl -X POST http://localhost:3001/api/public/validate-creator \
  -d '{"code":"MASTER2024"}'

# Check user exists
SELECT * FROM users 
WHERE LOWER(username) = 'master' 
  AND isCreator = true;
```

**Fix:** Ensure user has `isCreator = true` and `emailVerified`

---

### Issue: Commission Not Created
**Check logs:**
```typescript
// Add logging in track-commission route
console.log('Received commission request:', {
  orderId,
  code: affiliateCode,
  total: orderTotal
})

console.log('Found creator:', creator?.id)
console.log('Creating transaction:', commission)
```

---

## 🚀 Deploy

```bash
# 1. Create public API routes
mkdir -p app/api/public/validate-creator
mkdir -p app/api/public/track-commission

# 2. Copy files
cp validate-creator.ts app/api/public/validate-creator/route.ts
cp track-commission.ts app/api/public/track-commission/route.ts

# 3. Update dashboard
cp enhanced-dashboard.ts app/api/creator/dashboard/route.ts

# 4. Update component
cp enhanced-stats.tsx components/creator/Dashboard/StatsGrid.tsx

# 5. Test
npm run dev

# 6. Deploy
git add .
git commit -m "feat: dual commission tracking"
git push origin main
```

---

## ✅ Checklist

### Pre-Deploy
- [ ] Public API routes created
- [ ] Dashboard API updated
- [ ] StatsGrid component updated
- [ ] Validation endpoint works
- [ ] Commission tracking works
- [ ] Tests passing

### Post-Deploy
- [ ] Test affiliate commission
- [ ] Test creator commission
- [ ] Dashboard shows breakdown
- [ ] Monitor for 24 hours
- [ ] No orphaned commissions

---

## 📞 Integration Points

**This system receives calls from Grocery Store:**

1. **Validate codes:** `POST /api/public/validate-creator`
2. **Track commissions:** `POST /api/public/track-commission`

**This system does:**
- Validates creator codes
- Creates commission transactions
- Shows combined dashboard
- Manages payouts

---

## 🎊 Success Criteria

After deployment:
- [ ] Both commission types tracked
- [ ] Dashboard separates earnings
- [ ] Math correct: total = affiliate + creator
- [ ] No transactions with both identifiers
- [ ] No transactions with neither identifier

---

**That's it for the Affiliate System! Check the Grocery Store guide for the other side.** 💰
