# ⚡ QUICK REFERENCE CARD
## Grocery Store Integration - Cheat Sheet

**Print this and keep it handy!**

---

## 🔑 API Key

```bash
# Location: .env
GROCERY_API_KEY=your_32_character_key_here

# Generate new key:
openssl rand -hex 32
```

---

## 📡 API Endpoints

### Base URL
- **Dev:** `http://localhost:3001`
- **Prod:** `https://your-domain.com`

### 1. Validate Creator Code
```bash
POST /api/public/validate-creator

Headers:
  Content-Type: application/json
  x-api-key: [YOUR_KEY]

Body:
  { "code": "MASTER2024" }

Response 200:
  {
    "success": true,
    "creator": { "id": "...", "fullName": "..." },
    "commissionRate": 0.05
  }
```

### 2. Track Commission
```bash
POST /api/public/track-commission

Headers:
  Content-Type: application/json
  x-api-key: [YOUR_KEY]

Body:
  {
    "orderId": "unique_id",
    "orderNumber": "EMM-001",
    "orderTotal": 50000,
    "affiliateCode": "MASTER2024"
  }

Response 200:
  {
    "success": true,
    "commission": {
      "id": "tx_...",
      "amount": 2500,
      "creatorId": "...",
      "creatorName": "..."
    }
  }
```

---

## 🎯 Commission Types

| Type | Identifier | Example |
|------|-----------|---------|
| **Affiliate** | `sourceUserId ≠ null` | User refers friend → Friend pays ₦50K → User earns ₦2.5K |
| **Creator** | `referralOrderId ≠ null` | Customer uses code → Buys ₦50K → Creator earns ₦2.5K |

**Commission Rate:** 5% fixed for both types

---

## 🔍 Database Queries

### Check Commission Type
```sql
SELECT
  CASE
    WHEN "sourceUserId" IS NOT NULL THEN 'Affiliate'
    WHEN "referralOrderId" IS NOT NULL THEN 'Creator'
    ELSE 'UNKNOWN'
  END as type,
  COUNT(*),
  SUM(amount)
FROM "Transaction"
WHERE type = 'COMMISSION'
GROUP BY type;
```

### Today's Commissions
```sql
SELECT COUNT(*), SUM(amount)
FROM "Transaction"
WHERE type = 'COMMISSION'
  AND "referralOrderId" IS NOT NULL
  AND "createdAt" >= CURRENT_DATE;
```

### Check for Duplicates
```sql
SELECT "referralOrderId", COUNT(*)
FROM "Transaction"
WHERE type = 'COMMISSION'
GROUP BY "referralOrderId"
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

---

## ⚠️ Error Codes

| Code | Error | Fix |
|------|-------|-----|
| 400 | Missing fields | Check request body |
| 401 | Unauthorized | Verify API key in header |
| 404 | Creator not found | Check code format + user exists |
| 409 | Duplicate | Order already tracked (expected) |
| 500 | Server error | Check logs + database |

---

## 🧪 Quick Test

```bash
# 1. Set API key
export GROCERY_API_KEY="your_key_here"

# 2. Test validation
curl -X POST http://localhost:3001/api/public/validate-creator \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GROCERY_API_KEY" \
  -d '{"code":"MASTER2024"}'

# 3. Test commission
curl -X POST http://localhost:3001/api/public/track-commission \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GROCERY_API_KEY" \
  -d '{
    "orderId": "test_'$(date +%s)'",
    "orderTotal": 10000,
    "affiliateCode": "MASTER2024"
  }'

# 4. Check database
psql $DATABASE_URL -c "
  SELECT * FROM \"Transaction\"
  WHERE \"referralOrderId\" LIKE 'test_%'
  ORDER BY \"createdAt\" DESC
  LIMIT 5
"
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/api/public/validate-creator/route.ts` | Validate codes |
| `app/api/public/track-commission/route.ts` | Track commissions |
| `app/api/creator/dashboard/route.ts` | Dashboard data |
| `components/creator/Dashboard/StatsGrid.tsx` | Dashboard UI |
| `lib/commissionService.ts` | Affiliate commissions |

---

## 🔒 Security Checklist

- [ ] API key in environment variable (not hardcoded)
- [ ] HTTPS only in production
- [ ] Duplicate prevention working
- [ ] Code format validation active
- [ ] Security logging enabled
- [ ] API key not in Git

---

## 📊 Health Check (Daily)

```sql
-- Run this every day
WITH commission_check AS (
  SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN "sourceUserId" IS NOT NULL THEN 1 END) as affiliate,
    COUNT(CASE WHEN "referralOrderId" IS NOT NULL THEN 1 END) as creator,
    COUNT(CASE
      WHEN "sourceUserId" IS NULL
      AND "referralOrderId" IS NULL THEN 1
    END) as orphaned,
    SUM(amount) as total_amount
  FROM "Transaction"
  WHERE type = 'COMMISSION'
    AND "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT
  total as "Total Commissions",
  affiliate as "Affiliate",
  creator as "Creator",
  orphaned as "⚠️ Orphaned (Should be 0)",
  ROUND(total_amount::numeric, 2) as "Total Amount"
FROM commission_check;
```

---

## 🚨 Rollback Plan

```bash
# If issues arise:

# 1. Notify grocery team
echo "Pausing integration" | mail grocery-team@...

# 2. Disable endpoint (add to route.ts)
return NextResponse.json(
  { error: 'Maintenance' },
  { status: 503 }
)

# 3. Restore database
psql $DATABASE_URL < backup.sql

# 4. Revert code
git revert HEAD
git push origin main --force
```

---

## 📞 Emergency Contacts

| Role | Contact | For |
|------|---------|-----|
| Developer | [Your Email] | Technical issues |
| Grocery Team | [Their Email] | Integration questions |
| Database Admin | [DBA Email] | Data issues |

---

## 🎯 Success Indicators

✅ API response time < 500ms
✅ Error rate < 1%
✅ 0 duplicate commissions
✅ 0 orphaned transactions
✅ Dashboard breakdown matches totals

---

## 📚 Full Documentation

- **Integration Guide:** `md/INTEGRATION_GUIDE.md`
- **Deployment Checklist:** `md/DEPLOYMENT_CHECKLIST.md`
- **Implementation Summary:** `md/IMPLEMENTATION_SUMMARY.md`

---

**Version:** 2.0 | **Updated:** Nov 14, 2025
