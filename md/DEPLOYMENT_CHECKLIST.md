# ✅ DEPLOYMENT CHECKLIST
## Grocery Store Integration - Production Readiness

**Project:** EMM-Fort Affiliate + Creator System
**Integration:** Grocery Store Commission Tracking
**Target Date:** [Your Date]

---

## 📋 Pre-Deployment

### 1. Environment Variables

#### Required Variables

Add these to your `.env` file:

```bash
# ===== EXISTING (should already be set) =====
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
PAYSTACK_SECRET_KEY="sk_live_..."

# ===== NEW: Grocery Store Integration =====
GROCERY_API_KEY="[GENERATE_32_CHAR_KEY]"
```

#### Generate API Key

```bash
# Run this command to generate a secure API key:
openssl rand -hex 32

# Example output:
# a3f8b2c9d4e1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1

# Add to .env:
GROCERY_API_KEY=a3f8b2c9d4e1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

**Action Items:**
- [ ] Generate `GROCERY_API_KEY` using command above
- [ ] Add to `.env` (development)
- [ ] Add to `.env.production` (production)
- [ ] Add to Vercel/hosting platform environment variables
- [ ] Share key with grocery store team (use 1Password/LastPass)
- [ ] Document key rotation schedule (every 90 days)

---

### 2. Database Health Check

Verify database schema has required fields:

```sql
-- Check Transaction table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Transaction'
  AND column_name IN ('sourceUserId', 'referralOrderId');

-- Expected output:
-- sourceUserId    | text | YES
-- referralOrderId | text | YES
```

**Action Items:**
- [ ] Verify `sourceUserId` column exists
- [ ] Verify `referralOrderId` column exists
- [ ] Test database connection: `psql $DATABASE_URL -c "SELECT 1"`
- [ ] Create database backup: `pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql`

---

### 3. Code Review

#### Files Modified/Created

**NEW FILES (created):**
- [ ] `app/api/public/validate-creator/route.ts` - Validation endpoint
- [ ] `app/api/public/track-commission/route.ts` - Commission tracking
- [ ] `app/api/public/creator-stats/route.ts` - Public stats (optional)
- [ ] `md/INTEGRATION_GUIDE.md` - Documentation for grocery team
- [ ] `md/DEPLOYMENT_CHECKLIST.md` - This file

**MODIFIED FILES (enhanced):**
- [ ] `app/api/creator/dashboard/route.ts` - Separate affiliate vs creator earnings
- [ ] `components/creator/Dashboard/StatsGrid.tsx` - Show breakdown cards
- [ ] `types/Creatortypes/dashboard.ts` - Add new fields

**UNCHANGED FILES (verify working):**
- [ ] `app/api/webhooks/paystack/route.ts` - Affiliate commissions (line 91)
- [ ] `lib/commissionService.ts` - Creates affiliate commissions

#### Security Features Added

- [ ] API key authentication on both public endpoints
- [ ] Duplicate commission prevention
- [ ] Code format validation (regex)
- [ ] Commission amount validation (max ₦50,000 warning)
- [ ] Request logging for security audits
- [ ] Explicit `sourceUserId = null` for creator commissions

---

### 4. Test Coverage

#### Unit Tests (Manual Verification)

**Test 1: Validate Creator - Success**
```bash
curl -X POST http://localhost:3001/api/public/validate-creator \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GROCERY_API_KEY" \
  -d '{"code":"MASTER2024"}'

# Expected: 200 OK with creator details
```
- [ ] Returns `success: true`
- [ ] Contains creator ID, name, username
- [ ] Shows `commissionRate: 0.05`

**Test 2: Validate Creator - Invalid Code**
```bash
curl -X POST http://localhost:3001/api/public/validate-creator \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GROCERY_API_KEY" \
  -d '{"code":"INVALID2024"}'

# Expected: 404 Creator not found
```
- [ ] Returns `success: false`
- [ ] Error message: "Creator not found"

**Test 3: Validate Creator - No API Key**
```bash
curl -X POST http://localhost:3001/api/public/validate-creator \
  -H "Content-Type: application/json" \
  -d '{"code":"MASTER2024"}'

# Expected: 401 Unauthorized
```
- [ ] Returns `401 Unauthorized`
- [ ] Logs warning about missing API key

**Test 4: Track Commission - First Time**
```bash
curl -X POST http://localhost:3001/api/public/track-commission \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GROCERY_API_KEY" \
  -d '{
    "orderId": "test_unique_001",
    "orderNumber": "EMM-TEST-001",
    "orderTotal": 20000,
    "affiliateCode": "MASTER2024"
  }'

# Expected: 200 OK with commission details
```
- [ ] Returns `success: true`
- [ ] Commission amount = ₦1,000 (5% of ₦20,000)
- [ ] Contains transaction ID
- [ ] Database shows `sourceUserId = null`, `referralOrderId = test_unique_001`

**Test 5: Track Commission - Duplicate**
```bash
# Run same request again
curl -X POST http://localhost:3001/api/public/track-commission \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GROCERY_API_KEY" \
  -d '{
    "orderId": "test_unique_001",
    "orderNumber": "EMM-TEST-001",
    "orderTotal": 20000,
    "affiliateCode": "MASTER2024"
  }'

# Expected: 409 Conflict
```
- [ ] Returns `409 Conflict`
- [ ] Error: "Commission already tracked for this order"
- [ ] Includes existing commission ID

**Test 6: Dashboard Breakdown**
```bash
# Login as creator and visit dashboard
curl -H "Cookie: authjs.session-token=..." \
  http://localhost:3001/api/creator/dashboard

# Expected: JSON with breakdown
```
- [ ] Contains `affiliateEarnings` (from tier subscriptions)
- [ ] Contains `creatorEarnings` (from grocery sales)
- [ ] Contains `affiliateCommissionCount`
- [ ] Contains `creatorCommissionCount`
- [ ] Math correct: `totalEarnings = affiliateEarnings + creatorEarnings`

#### Database Verification

**Test 7: Commission Type Identification**
```sql
-- All commissions should be categorized
SELECT
  CASE
    WHEN "sourceUserId" IS NOT NULL THEN 'Affiliate'
    WHEN "referralOrderId" IS NOT NULL THEN 'Creator'
    ELSE 'UNKNOWN'
  END as commission_type,
  COUNT(*) as count,
  SUM(amount) as total
FROM "Transaction"
WHERE type = 'COMMISSION'
GROUP BY commission_type;

-- CRITICAL: "UNKNOWN" count MUST be 0
```
- [ ] No rows with `UNKNOWN` type
- [ ] Affiliate commissions have `sourceUserId ≠ null`
- [ ] Creator commissions have `referralOrderId ≠ null`

**Test 8: No Orphaned Commissions**
```sql
-- Should return 0 rows
SELECT * FROM "Transaction"
WHERE type = 'COMMISSION'
  AND "sourceUserId" IS NULL
  AND "referralOrderId" IS NULL;
```
- [ ] Returns 0 rows (no orphaned commissions)

---

## 🚀 Deployment Steps

### Step 1: Backup Everything

```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

# 2. Backup .env file
cp .env .env.backup

# 3. Create git tag
git tag -a v2.0-grocery-integration -m "Grocery store integration"
git push origin v2.0-grocery-integration
```

**Action Items:**
- [ ] Database backup created and stored safely
- [ ] `.env` backup created
- [ ] Git tag created
- [ ] All changes committed to version control

---

### Step 2: Deploy to Staging (if available)

```bash
# 1. Set environment variables in staging
vercel env add GROCERY_API_KEY production < grocery_api_key.txt

# 2. Deploy to staging
git push staging main

# 3. Test all endpoints on staging
./test_staging.sh
```

**Action Items:**
- [ ] Environment variables set in staging
- [ ] Code deployed to staging
- [ ] All tests pass on staging
- [ ] Manual QA completed

---

### Step 3: Deploy to Production

```bash
# 1. Set environment variables
vercel env add GROCERY_API_KEY production

# 2. Deploy
git push origin main
# or
vercel --prod

# 3. Verify deployment
curl https://your-domain.com/api/public/validate-creator \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GROCERY_API_KEY" \
  -d '{"code":"MASTER2024"}'
```

**Action Items:**
- [ ] Environment variables set in production
- [ ] Code deployed successfully
- [ ] Health check endpoint responds
- [ ] No errors in production logs

---

### Step 4: Share with Grocery Team

**Securely share:**
1. API key (use 1Password/LastPass shared vault)
2. Integration guide: `md/INTEGRATION_GUIDE.md`
3. Base URL: `https://your-affiliate-domain.com`
4. Support contact: `support@emmfort.com`

**Send this information:**

```
Subject: Affiliate API Integration - Ready for Testing

Hi Grocery Team,

The affiliate API is ready for integration! Here's what you need:

📡 API Endpoints:
- Validate: POST https://your-domain.com/api/public/validate-creator
- Track: POST https://your-domain.com/api/public/track-commission

🔑 API Key: [SHARED_VIA_1PASSWORD]

📖 Documentation: See attached INTEGRATION_GUIDE.md

⚙️ Key Details:
- Commission rate: 5% fixed
- Header required: x-api-key
- Duplicate prevention: Built-in
- Response time: < 500ms

🧪 Test Creator Code: MASTER2024 (use in staging only)

Let me know when you're ready to test!
```

**Action Items:**
- [ ] API key shared via secure channel (NOT email!)
- [ ] Documentation sent to grocery team
- [ ] Test creator account created
- [ ] Contact information provided
- [ ] Meeting scheduled for integration support

---

## 📊 Post-Deployment Monitoring

### Day 1: Intensive Monitoring

**Every 2 hours, check:**

```sql
-- New commissions today
SELECT
  COUNT(*) as today_count,
  SUM(amount) as today_total,
  MIN("createdAt") as first_at,
  MAX("createdAt") as last_at
FROM "Transaction"
WHERE type = 'COMMISSION'
  AND "referralOrderId" IS NOT NULL
  AND "createdAt" >= CURRENT_DATE;
```

**Action Items:**
- [ ] Check logs for errors every 2 hours
- [ ] Monitor database for new commissions
- [ ] Verify no duplicate commission warnings
- [ ] Check response times (should be < 1s)
- [ ] Ensure no 500 errors in monitoring

---

### Week 1: Daily Checks

**Daily health check:**

```sql
-- Daily commission summary
SELECT
  DATE("createdAt") as date,
  COUNT(*) as orders,
  COUNT(DISTINCT "userId") as unique_creators,
  SUM(amount) as total_commissions,
  AVG(amount) as avg_commission
FROM "Transaction"
WHERE type = 'COMMISSION'
  AND "referralOrderId" IS NOT NULL
  AND "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE("createdAt")
ORDER BY date DESC;
```

**Action Items:**
- [ ] Run daily health check query
- [ ] Review error logs
- [ ] Check for unusual patterns (very high/low amounts)
- [ ] Verify grocery team integration is working
- [ ] Address any issues within 4 hours

---

### Week 2+: Weekly Review

**Weekly report:**

```sql
-- Top creators this week
SELECT
  u."fullName",
  u.username,
  COUNT(t.id) as order_count,
  SUM(t.amount) as total_earned,
  AVG(t.amount) as avg_order_value
FROM "User" u
JOIN "Transaction" t ON u.id = t."userId"
WHERE t.type = 'COMMISSION'
  AND t."referralOrderId" IS NOT NULL
  AND t."createdAt" >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u."fullName", u.username
ORDER BY total_earned DESC
LIMIT 20;
```

**Action Items:**
- [ ] Generate weekly report
- [ ] Share stats with team
- [ ] Identify top performers
- [ ] Look for optimization opportunities
- [ ] Plan feature enhancements

---

## 🐛 Rollback Plan

### If Issues Arise

**Minor Issues (API errors < 5%):**
- Fix code
- Deploy patch
- Monitor for 2 hours

**Major Issues (API errors > 5% or data corruption):**

```bash
# 1. Immediately notify grocery team to pause integration
echo "PAUSE INTEGRATION" | mail grocery-team@...

# 2. Disable endpoints (add to route.ts)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Endpoint temporarily disabled for maintenance' },
    { status: 503 }
  )
}

# 3. Deploy hotfix
git revert HEAD
git push origin main --force

# 4. Restore database if needed
psql $DATABASE_URL < backup_pre_deploy_YYYYMMDD_HHMMSS.sql

# 5. Investigate root cause
# 6. Fix and re-deploy
# 7. Re-enable integration
```

**Action Items:**
- [ ] Rollback plan documented
- [ ] Grocery team emergency contact saved
- [ ] Database backup accessible
- [ ] Previous git version tagged

---

## 📞 Support & Escalation

### Issue Severity Levels

**P0 - Critical (Response: Immediate)**
- All API requests failing
- Database corruption
- Security breach

**P1 - High (Response: < 2 hours)**
- > 10% error rate
- Duplicate commissions being created
- Wrong commission amounts

**P2 - Medium (Response: < 1 day)**
- Slow response times (> 2s)
- Minor bugs in dashboard
- Documentation issues

**P3 - Low (Response: < 1 week)**
- Feature requests
- UI/UX improvements
- Performance optimizations

### Contact Chain

1. **Developer:** [Your Name/Email]
2. **Team Lead:** [Lead Name/Email]
3. **CTO:** [CTO Name/Email]
4. **Grocery Team Contact:** [Their Name/Email]

---

## ✅ Final Sign-Off

### Before Going Live

- [ ] All tests passing (13/13)
- [ ] Database backup created
- [ ] Environment variables set
- [ ] Code deployed to production
- [ ] API key shared with grocery team
- [ ] Documentation sent
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Support contacts shared
- [ ] Team notified
- [ ] 48-hour monitoring period started

### Stakeholder Approval

- [ ] **Engineering Lead:** _________________ Date: _______
- [ ] **Product Manager:** _________________ Date: _______
- [ ] **QA Lead:** _________________ Date: _______

---

## 🎊 Success Metrics

**After 30 days, we should see:**

- [ ] > 100 creator commissions tracked
- [ ] 0 duplicate commissions
- [ ] < 1% API error rate
- [ ] < 500ms average response time
- [ ] > 95% uptime
- [ ] 0 security incidents
- [ ] Positive feedback from grocery team

---

**Deployment Date:** ______________
**Deployed By:** ______________
**Version:** 2.0-grocery-integration

**Notes:**
_____________________________________
_____________________________________
_____________________________________
