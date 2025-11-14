# 🎯 AFFILIATE TEAM INTEGRATION GUIDE
## How to Integrate Grocery Store Commissions into Your Dashboard

**Version:** 1.0
**Status:** Production Ready
**Last Updated:** 2025-11-14
**For:** Affiliate/Creator System Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Commission Types](#commission-types)
5. [API Integration](#api-integration)
6. [Dashboard Implementation](#dashboard-implementation)
7. [SQL Queries](#sql-queries)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The **Grocery Store** and **Affiliate/Creator System** share a unified PostgreSQL database. This means:

✅ **No API calls needed** between systems
✅ **Real-time data** - commissions appear instantly
✅ **Single source of truth** - one database for everything
✅ **Two commission types** tracked in one `Transaction` table

### What the Grocery Store Does For You

1. **Tracks creator codes** when customers check out
2. **Creates commission transactions** automatically when orders are paid
3. **Provides a dashboard API** with separated affiliate vs creator earnings
4. **Stores order details** with full affiliate metadata

### What You Need to Do

1. **Read commission data** from the shared `Transaction` table
2. **Display separated earnings** in your dashboard (affiliate vs creator)
3. **Show order details** from the `Order` table
4. **Handle payouts** using the existing affiliate commission fields

---

## 🏗️ Architecture

### Unified Database Model

```
┌─────────────────────────────────────────────────────────┐
│              SHARED POSTGRESQL DATABASE                  │
│                                                          │
│  ┌──────────┐    ┌─────────────┐    ┌───────────┐     │
│  │   User   │◄───│ Transaction │───►│   Order   │     │
│  └──────────┘    └─────────────┘    └───────────┘     │
│       ▲                  │                              │
│       │                  │                              │
│       └──────────────────┘                              │
└─────────────────────────────────────────────────────────┘
         ▲                                    ▲
         │                                    │
    ┌────┴─────┐                      ┌──────┴──────┐
    │ Affiliate │                      │   Grocery   │
    │  System   │                      │    Store    │
    └──────────┘                      └─────────────┘
```

### Data Flow

```
1. Customer uses code MASTER2024 on grocery store
   ↓
2. Grocery validates code against User table (shared DB)
   ↓
3. Customer completes purchase via Paystack
   ↓
4. Grocery webhook creates TWO transactions:
   - PAYMENT transaction (customer payment)
   - COMMISSION transaction (creator earnings) ⭐
   ↓
5. Your dashboard queries Transaction table
   ↓
6. Display earnings separated by type:
   - Affiliate: sourceUserId ≠ null
   - Creator: referralOrderId ≠ null
```

---

## 🗄️ Database Schema

### Transaction Table (Enhanced)

```prisma
model Transaction {
  id              String            @id @default(cuid())
  userId          String            // Who earned the commission
  orderId         String?           // Related order (for payments)
  reference       String            @unique
  amount          Float             // Commission amount in Naira
  currency        String            @default("NGN")
  status          TransactionStatus // COMPLETED, PENDING, etc.
  paymentMethod   PaymentMethod     // PAYSTACK, etc.
  type            TransactionType   // PAYMENT, COMMISSION
  description     String?
  metadata        Json?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // ⭐ NEW COMMISSION TRACKING FIELDS
  sourceUserId    String?           // NOT NULL = Affiliate commission
  referralOrderId String?           // NOT NULL = Creator commission

  // Relations
  order           Order?            @relation(fields: [orderId], references: [id])
  user            User              @relation(fields: [userId], references: [id])
}
```

### Order Table (Affiliate Fields)

```prisma
model Order {
  id                        String    @id @default(cuid())
  orderNumber               String    @unique
  userId                    String
  total                     Float
  paymentStatus             PaymentStatus

  // ⭐ AFFILIATE TRACKING FIELDS
  affiliateCode             String?   // "MASTER2024"
  affiliateId               String?   // Creator's user ID
  affiliateCommission       Float?    // 2500.00
  affiliateCommissionRate   Float?    // 0.05
  affiliateCommissionPaid   Boolean   @default(false)
  affiliatePaidAt           DateTime?
  affiliateMetadata         Json?     // Extra tracking data

  // Relations
  user                      User      @relation(fields: [userId], references: [id])
  transactions              Transaction[]

  @@index([affiliateCode])
  @@index([affiliateId])
}
```

---

## 🎭 Commission Types

### Two Types, One Table

The `Transaction` table uses **mutually exclusive fields** to distinguish commission types:

#### 1. Affiliate Commission (Tier Subscription Referrals)

**When:** User A refers User B → B pays for tier subscription

```sql
{
  userId: "user_A_id",           -- Who earned it
  type: "COMMISSION",
  amount: 2500.00,
  sourceUserId: "user_B_id",     -- ✅ NOT NULL (who was referred)
  referralOrderId: NULL,         -- ❌ NULL (no grocery order)
  description: "Tier referral commission"
}
```

**How to identify:**
```sql
WHERE type = 'COMMISSION'
  AND sourceUserId IS NOT NULL
  AND referralOrderId IS NULL
```

---

#### 2. Creator Commission (Grocery Orders)

**When:** Customer uses code MASTER2024 → Buys groceries → Order paid

```sql
{
  userId: "creator_id",          -- Who earned it (code owner)
  type: "COMMISSION",
  amount: 2500.00,
  sourceUserId: NULL,            -- ❌ NULL (not a referral)
  referralOrderId: "order_123",  -- ✅ NOT NULL (grocery order)
  orderId: "order_123",          -- Same as referralOrderId
  description: "Creator commission for order EMM-2024-001"
}
```

**How to identify:**
```sql
WHERE type = 'COMMISSION'
  AND sourceUserId IS NULL
  AND referralOrderId IS NOT NULL
```

---

### Quick Reference Table

| Commission Type | `sourceUserId` | `referralOrderId` | `orderId` | Source |
|----------------|----------------|-------------------|-----------|--------|
| **Affiliate** (Tier) | NOT NULL | NULL | NULL | Affiliate System |
| **Creator** (Grocery) | NULL | NOT NULL | NOT NULL | Grocery Store |

---

## 📡 API Integration

### Option 1: Direct Database Queries (Recommended)

Since you share the database, **query the Transaction table directly** from your backend:

```typescript
// app/api/creator/earnings/route.ts (Your affiliate system)
import { db } from '@/lib/db' // Same database connection

export async function GET(request: NextRequest) {
  const session = await auth()
  const userId = session.user.id

  // Get affiliate earnings (tier referrals)
  const affiliateEarnings = await db.transaction.aggregate({
    where: {
      userId: userId,
      type: 'COMMISSION',
      sourceUserId: { not: null },
      referralOrderId: null,
    },
    _sum: { amount: true },
    _count: true,
  })

  // Get creator earnings (grocery orders)
  const creatorEarnings = await db.transaction.aggregate({
    where: {
      userId: userId,
      type: 'COMMISSION',
      sourceUserId: null,
      referralOrderId: { not: null },
    },
    _sum: { amount: true },
    _count: true,
  })

  return NextResponse.json({
    affiliate: {
      total: affiliateEarnings._sum.amount || 0,
      count: affiliateEarnings._count || 0,
    },
    creator: {
      total: creatorEarnings._sum.amount || 0,
      count: creatorEarnings._count || 0,
    },
    combined: {
      total: (affiliateEarnings._sum.amount || 0) + (creatorEarnings._sum.amount || 0),
    }
  })
}
```

---

### Option 2: Use Grocery Dashboard API

The grocery store provides a ready-made API endpoint:

**Endpoint:** `GET /api/creator/dashboard`

**Usage:**
```typescript
// In your affiliate system
const response = await fetch('http://grocery-store.com/api/creator/dashboard', {
  headers: {
    'Cookie': session.cookie, // User session
  }
})

const data = await response.json()
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalEarnings": 125000,
    "totalTransactions": 75,

    "affiliateEarnings": 75000,    // From tier referrals
    "affiliateCount": 50,

    "creatorEarnings": 50000,      // From grocery orders
    "creatorCount": 25,

    "pendingAmount": 10000,
    "pendingCount": 5,

    "monthlyStats": {
      "affiliate": { "amount": 15000, "count": 10 },
      "creator": { "amount": 8000, "count": 4 },
      "total": { "amount": 23000, "count": 14 }
    },

    "ordersWithCode": 25,
    "conversionRate": 50
  },

  "recentActivity": [
    {
      "id": "tx_123",
      "amount": 2500,
      "type": "CREATOR",           // or "AFFILIATE"
      "description": "Creator commission for order EMM-001",
      "createdAt": "2025-11-14T10:30:00Z",
      "orderNumber": "EMM-001",
      "orderTotal": 50000
    }
  ],

  "pendingPayouts": [
    {
      "orderNumber": "EMM-002",
      "total": 30000,
      "affiliateCommission": 1500,
      "createdAt": "2025-11-14T09:00:00Z"
    }
  ]
}
```

---

## 🎨 Dashboard Implementation

### Stats Grid Component

Update your `StatsGrid.tsx` to show separated earnings:

```typescript
// components/creator/Dashboard/StatsGrid.tsx (Your affiliate system)
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

interface EarningsData {
  affiliateEarnings: number
  affiliateCount: number
  creatorEarnings: number
  creatorCount: number
  totalEarnings: number
  pendingAmount: number
}

export function StatsGrid() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/creator/earnings')
      .then(res => res.json())
      .then(data => {
        setData({
          affiliateEarnings: data.affiliate.total,
          affiliateCount: data.affiliate.count,
          creatorEarnings: data.creator.total,
          creatorCount: data.creator.count,
          totalEarnings: data.combined.total,
          pendingAmount: data.pending || 0,
        })
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Earnings */}
      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground">
          Total Earnings
        </div>
        <div className="text-3xl font-bold">
          ₦{data?.totalEarnings.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Combined from all sources
        </p>
      </Card>

      {/* Affiliate Earnings */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <div className="text-sm font-medium text-blue-600">
          Affiliate Earnings
        </div>
        <div className="text-3xl font-bold text-blue-700">
          ₦{data?.affiliateEarnings.toLocaleString()}
        </div>
        <p className="text-xs text-blue-600 mt-2">
          {data?.affiliateCount} tier referrals
        </p>
      </Card>

      {/* Creator Earnings */}
      <Card className="p-6 border-green-200 bg-green-50">
        <div className="text-sm font-medium text-green-600">
          Creator Earnings
        </div>
        <div className="text-3xl font-bold text-green-700">
          ₦{data?.creatorEarnings.toLocaleString()}
        </div>
        <p className="text-xs text-green-600 mt-2">
          {data?.creatorCount} grocery orders
        </p>
      </Card>

      {/* Pending Payouts */}
      <Card className="p-6 border-orange-200 bg-orange-50">
        <div className="text-sm font-medium text-orange-600">
          Pending Payouts
        </div>
        <div className="text-3xl font-bold text-orange-700">
          ₦{data?.pendingAmount.toLocaleString()}
        </div>
        <p className="text-xs text-orange-600 mt-2">
          Awaiting payment
        </p>
      </Card>
    </div>
  )
}
```

---

### Earnings Breakdown Chart

```typescript
// components/creator/Dashboard/EarningsChart.tsx
'use client'

import { Bar } from 'react-chartjs-2'

export function EarningsChart({ data }: { data: any }) {
  const chartData = {
    labels: ['Affiliate', 'Creator', 'Total'],
    datasets: [
      {
        label: 'Earnings (₦)',
        data: [
          data.affiliateEarnings,
          data.creatorEarnings,
          data.totalEarnings,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',  // Blue for affiliate
          'rgba(34, 197, 94, 0.5)',   // Green for creator
          'rgba(168, 85, 247, 0.5)',  // Purple for total
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="w-full h-64">
      <Bar data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Earnings Breakdown',
          },
        },
      }} />
    </div>
  )
}
```

---

### Transaction History Table

```typescript
// components/creator/Dashboard/TransactionHistory.tsx
'use client'

export function TransactionHistory() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetch('/api/creator/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
  }, [])

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Type</th>
            <th className="p-4 text-left">Description</th>
            <th className="p-4 text-left">Amount</th>
            <th className="p-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx: any) => (
            <tr key={tx.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  tx.type === 'AFFILIATE'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {tx.type}
                </span>
              </td>
              <td className="p-4 text-sm">{tx.description}</td>
              <td className="p-4 font-medium">₦{tx.amount.toLocaleString()}</td>
              <td className="p-4 text-sm text-gray-500">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 📊 SQL Queries

### Get All Creator Commissions for a User

```sql
-- Get all grocery order commissions for a specific creator
SELECT
  t.id,
  t.amount,
  t.description,
  t.reference,
  t."createdAt",
  o."orderNumber",
  o.total as "orderTotal",
  o."affiliateCode",
  o."affiliateCommissionPaid"
FROM "Transaction" t
LEFT JOIN "Order" o ON t."referralOrderId" = o.id
WHERE t."userId" = 'cm_creator_id'
  AND t.type = 'COMMISSION'
  AND t."sourceUserId" IS NULL
  AND t."referralOrderId" IS NOT NULL
ORDER BY t."createdAt" DESC;
```

---

### Get Monthly Earnings Summary

```sql
-- Monthly breakdown by commission type
SELECT
  DATE_TRUNC('month', "createdAt") as month,
  CASE
    WHEN "sourceUserId" IS NOT NULL THEN 'Affiliate'
    WHEN "referralOrderId" IS NOT NULL THEN 'Creator'
  END as type,
  COUNT(*) as transactions,
  SUM(amount) as total
FROM "Transaction"
WHERE "userId" = 'cm_creator_id'
  AND type = 'COMMISSION'
  AND "createdAt" >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', "createdAt"), type
ORDER BY month DESC, type;
```

---

### Get Pending Payouts

```sql
-- Orders with unpaid commissions
SELECT
  o.id,
  o."orderNumber",
  o.total,
  o."affiliateCode",
  o."affiliateCommission",
  o."createdAt",
  o."paymentCompletedAt"
FROM "Order" o
WHERE o."affiliateId" = 'cm_creator_id'
  AND o."affiliateCommissionPaid" = false
  AND o."paymentStatus" = 'PAID'
  AND o."affiliateCommission" > 0
ORDER BY o."createdAt" DESC;
```

---

### Top Performing Creators (This Week)

```sql
-- Leaderboard of top grocery creators
SELECT
  u.id,
  u."fullName",
  u.username,
  COUNT(DISTINCT t.id) as orders,
  SUM(t.amount) as earnings
FROM "User" u
JOIN "Transaction" t ON u.id = t."userId"
WHERE t.type = 'COMMISSION'
  AND t."sourceUserId" IS NULL
  AND t."referralOrderId" IS NOT NULL
  AND t."createdAt" >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u."fullName", u.username
ORDER BY earnings DESC
LIMIT 10;
```

---

### Verify Data Integrity

```sql
-- Health check: Find orphaned commissions (should be empty)
SELECT
  id,
  amount,
  description,
  "createdAt"
FROM "Transaction"
WHERE type = 'COMMISSION'
  AND "sourceUserId" IS NULL
  AND "referralOrderId" IS NULL;

-- Expected result: 0 rows
-- If you find any, investigate why they have neither identifier
```

---

## 🧪 Testing

### 1. Test Data Setup

Create a test creator and order:

```sql
-- 1. Create test creator (if not exists)
INSERT INTO "User" (id, email, "fullName", username, "isCreator", "emailVerified")
VALUES (
  'test_creator_001',
  'testcreator@example.com',
  'Test Creator',
  'testcreator',
  true,
  NOW()
);

-- 2. Create test order with affiliate data
INSERT INTO "Order" (
  id, "orderNumber", "userId", total,
  "paymentStatus", "affiliateCode", "affiliateId",
  "affiliateCommission", "affiliateCommissionRate"
)
VALUES (
  'test_order_001',
  'TEST-001',
  'customer_user_id',
  50000,
  'PAID',
  'TESTCREATOR2024',
  'test_creator_001',
  2500,
  0.05
);

-- 3. Create creator commission transaction
INSERT INTO "Transaction" (
  id, "userId", "orderId", reference, amount, status,
  "paymentMethod", type, description, currency,
  "sourceUserId", "referralOrderId"
)
VALUES (
  'test_tx_001',
  'test_creator_001',
  'test_order_001',
  'COMM-TEST-001',
  2500,
  'COMPLETED',
  'PAYSTACK',
  'COMMISSION',
  'Creator commission for order TEST-001',
  'NGN',
  NULL,                    -- sourceUserId = NULL (creator commission)
  'test_order_001'         -- referralOrderId = order ID
);
```

---

### 2. Verify Commission Appears

```sql
-- Check commission was created correctly
SELECT
  t.id,
  t.amount,
  t.type,
  t."sourceUserId",
  t."referralOrderId",
  o."orderNumber"
FROM "Transaction" t
LEFT JOIN "Order" o ON t."referralOrderId" = o.id
WHERE t.id = 'test_tx_001';

-- Expected result:
-- amount: 2500
-- type: COMMISSION
-- sourceUserId: NULL
-- referralOrderId: test_order_001
-- orderNumber: TEST-001
```

---

### 3. Test Dashboard API

```bash
# Test the grocery store's dashboard API
curl http://localhost:3001/api/creator/dashboard \
  -H "Cookie: session_token=..." \
  | jq '.stats'

# Expected output:
{
  "totalEarnings": 2500,
  "affiliateEarnings": 0,      # No affiliate commissions yet
  "creatorEarnings": 2500,     # Our test commission
  "creatorCount": 1
}
```

---

### 4. Test Your Dashboard Component

```typescript
// In your affiliate system's dev tools console
fetch('/api/creator/earnings')
  .then(r => r.json())
  .then(console.log)

// Should show:
// {
//   affiliate: { total: 0, count: 0 },
//   creator: { total: 2500, count: 1 },
//   combined: { total: 2500 }
// }
```

---

### 5. End-to-End Test

```bash
# 1. Visit grocery store with test code
http://localhost:3001?ref=TESTCREATOR2024

# 2. Add items to cart (₦50,000)

# 3. Complete checkout and payment

# 4. Wait for webhook to process (~5 seconds)

# 5. Check your affiliate dashboard
# Should see:
# - Creator Earnings: ₦2,500
# - Transaction count: 1
# - Recent activity showing the order
```

---

## 🔧 Troubleshooting

### Issue: Creator earnings not showing

**Diagnosis:**
```sql
-- Check if transactions exist
SELECT COUNT(*)
FROM "Transaction"
WHERE "userId" = 'cm_your_user_id'
  AND type = 'COMMISSION'
  AND "referralOrderId" IS NOT NULL;
```

**Possible causes:**
1. ❌ Webhook didn't create commission transaction
2. ❌ User ID mismatch
3. ❌ Transaction has wrong type or fields

**Solution:**
```sql
-- Check recent orders with your affiliate code
SELECT
  o."orderNumber",
  o."affiliateCode",
  o."affiliateId",
  o."affiliateCommission",
  o."paymentStatus",
  (
    SELECT COUNT(*)
    FROM "Transaction" t
    WHERE t."referralOrderId" = o.id
  ) as "commissionCreated"
FROM "Order" o
WHERE o."affiliateCode" = 'YOURCODE2024'
ORDER BY o."createdAt" DESC;

-- If commissionCreated = 0, webhook didn't run
```

---

### Issue: Duplicate commissions

**Diagnosis:**
```sql
-- Find orders with multiple commissions
SELECT
  "referralOrderId",
  COUNT(*) as count
FROM "Transaction"
WHERE type = 'COMMISSION'
  AND "referralOrderId" IS NOT NULL
GROUP BY "referralOrderId"
HAVING COUNT(*) > 1;
```

**Solution:**
The grocery webhook should prevent this, but if it happens:

```sql
-- Keep only the earliest commission (DANGEROUS - dev only!)
DELETE FROM "Transaction"
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY "referralOrderId"
             ORDER BY "createdAt" ASC
           ) as rn
    FROM "Transaction"
    WHERE type = 'COMMISSION'
      AND "referralOrderId" IS NOT NULL
  ) t
  WHERE rn > 1
);
```

---

### Issue: Affiliate vs Creator earnings mixed up

**Diagnosis:**
```sql
-- Check field consistency
SELECT
  id,
  CASE
    WHEN "sourceUserId" IS NOT NULL AND "referralOrderId" IS NULL THEN 'Affiliate ✅'
    WHEN "sourceUserId" IS NULL AND "referralOrderId" IS NOT NULL THEN 'Creator ✅'
    WHEN "sourceUserId" IS NOT NULL AND "referralOrderId" IS NOT NULL THEN 'BOTH ❌'
    WHEN "sourceUserId" IS NULL AND "referralOrderId" IS NULL THEN 'NEITHER ❌'
  END as classification
FROM "Transaction"
WHERE type = 'COMMISSION'
  AND (
    ("sourceUserId" IS NOT NULL AND "referralOrderId" IS NOT NULL) OR
    ("sourceUserId" IS NULL AND "referralOrderId" IS NULL)
  );

-- Should return 0 rows (no invalid combinations)
```

---

### Issue: Wrong commission amounts

**Check calculation:**
```sql
-- Verify 5% calculation
SELECT
  o."orderNumber",
  o.total,
  o."affiliateCommission",
  (o.total * 0.05) as "expectedCommission",
  o."affiliateCommission" - (o.total * 0.05) as "difference"
FROM "Order" o
WHERE o."affiliateCode" IS NOT NULL
  AND ABS(o."affiliateCommission" - (o.total * 0.05)) > 0.01;

-- Should return 0 rows (all correct within 1 kobo)
```

---

## 📞 Support

### Getting Help

**Before contacting grocery team:**

1. ✅ Check database connection
2. ✅ Verify user has `isCreator = true`
3. ✅ Check recent transactions exist
4. ✅ Review webhook logs in grocery system
5. ✅ Test with sample data first

**Contact:**
- **Grocery Team Lead:** [Name/Email]
- **Database Admin:** [Name/Email]
- **Integration Slack:** #grocery-affiliate-integration

---

## ✅ Implementation Checklist

### Phase 1: Setup (Day 1)

- [ ] Verify database access to shared PostgreSQL
- [ ] Confirm `Transaction` table has new fields (`sourceUserId`, `referralOrderId`)
- [ ] Test grocery dashboard API: `GET /api/creator/dashboard`
- [ ] Review sample commission transactions

### Phase 2: Backend (Day 2-3)

- [ ] Create `/api/creator/earnings` endpoint in your system
- [ ] Write queries to separate affiliate vs creator commissions
- [ ] Add aggregation for monthly stats
- [ ] Implement pending payouts query
- [ ] Add error handling and validation

### Phase 3: Frontend (Day 4-5)

- [ ] Update StatsGrid component with 4 cards:
  - Total Earnings
  - Affiliate Earnings (blue)
  - Creator Earnings (green)
  - Pending Payouts (orange)
- [ ] Add earnings breakdown chart
- [ ] Update transaction history table with type badges
- [ ] Add filters for commission type
- [ ] Test responsive design

### Phase 4: Testing (Day 6)

- [ ] Create test creator account
- [ ] Simulate grocery order with test code
- [ ] Verify commission appears in dashboard
- [ ] Test with multiple commission types
- [ ] Check calculations are correct (5%)
- [ ] Verify no duplicate commissions

### Phase 5: Deployment (Day 7)

- [ ] Deploy to staging environment
- [ ] Run end-to-end integration tests
- [ ] Monitor for 24 hours
- [ ] Deploy to production
- [ ] Notify creators of new feature

---

## 🎊 Success Criteria

After implementation, verify:

✅ **Data Integrity**
- All commissions have exactly ONE identifier (affiliate OR creator)
- No orphaned commissions (both fields null)
- Commission amounts = order total × 5%

✅ **Dashboard Accuracy**
- Total earnings = affiliate + creator
- Transaction counts match database
- Pending payouts match unpaid orders

✅ **Performance**
- Dashboard loads in < 2 seconds
- Queries optimized with indexes
- No N+1 query issues

✅ **User Experience**
- Clear distinction between commission types
- Accurate historical data
- Real-time updates after orders

---

## 📚 Additional Resources

**Grocery Store Files:**
- Webhook: `app/api/webhooks/paystack/route.ts` (lines 118-143)
- Dashboard API: `app/api/creator/dashboard/route.ts`
- Schema: `prisma/schema.prisma` (Transaction model, lines 336-337)

**Your Files to Update:**
- Stats Grid: `components/creator/Dashboard/StatsGrid.tsx`
- Earnings API: `app/api/creator/earnings/route.ts` (create this)
- Transaction History: `components/creator/Dashboard/TransactionHistory.tsx`

**Database Queries:**
- See [SQL Queries](#sql-queries) section above

---

**Last Updated:** November 14, 2025
**Version:** 1.0
**Maintained by:** Grocery & Affiliate Integration Team
**Questions?** Slack: #grocery-integration
