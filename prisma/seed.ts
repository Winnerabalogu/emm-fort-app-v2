// prisma/seed.ts
import { PrismaClient, Tier, Role } from '@prisma/client'; // <-- 1. Import Role
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearDatabase() {
  // Clearing logic remains the same
  await prisma.transaction.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.user.updateMany({
    where: { uplinerId: { not: null } },
    data: { uplinerId: null }
  });
  await prisma.user.deleteMany();
  console.log("Database cleared.");
}

async function main() {
  console.log("Starting seeding process...");
  await clearDatabase();

  // --- NEW: Create a dedicated Admin User ---
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Platform Admin',
      username: 'admin',
      email: 'admin@emmfort.com',
      phone: '0000000000',
      password: adminPassword,
      emailVerified: new Date(),
      tier: Tier.GOLD, // Admin can have a tier, or you can decide what fits best
      role: Role.ADMIN, // <-- 2. Assign the ADMIN role
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 99)),
    },
  });
  console.log("Admin user created:", adminUser.username);
await prisma.platformSettings.upsert({
  where: { section: 'general' },
  update: {},
  create: {
    id: 'general-default',
    section: 'general',
    data: {
      siteName: "EmmFort Platform",
      siteUrl: "https://emmfort.com",
      supportEmail: "support@emmfort.com",
      maintenanceMode: false,
      registrationEnabled: true,
      maxUplineDepth: 5,
      defaultTier: "BRONZE"
    },
    updatedBy: adminUser.id,
  },
});

await prisma.platformSettings.upsert({
  where: { section: 'commission' },
  update: {},
  create: {
    id: 'commission-default',
    section: 'commission',
    data: {
      commissionRates: { BRONZE: 5.0, SILVER: 10.0, GOLD: 15.0, PLATINUM: 20.0 },
      minWithdrawalAmount: 5000.0,
      withdrawalFee: 100.0,
      withdrawalProcessingDays: 3
    },
    updatedBy: adminUser.id,
  },
});

await prisma.platformSettings.upsert({
  where: { section: 'notifications' },
  update: {},
  create: {
    id: 'notifications-default',
    section: 'notifications',
    data: {
      emailNotifications: true,
      smsNotifications: false,
      withdrawalNotifications: true,
      commissionNotifications: true,
      systemNotifications: true
    },
    updatedBy: adminUser.id,
  },
});

await prisma.platformSettings.upsert({
  where: { section: 'payment' },
  update: {},
  create: {
    id: 'payment-default',
    section: 'payment',
    data: {
      supportedMethods: ["paystack"],
      paymentGateways: {
        paystack: { enabled: false, publicKey: "", secretKey: "" },
        flutterwave: { enabled: false, publicKey: "", secretKey: "" }
      }
    },
    updatedBy: adminUser.id,
  },
});

await prisma.platformSettings.upsert({
  where: { section: 'security' },
  update: {},
  create: {
    id: 'security-default',
    section: 'security',
    data: {
      passwordMinLength: 8,
      requireEmailVerification: true,
      maxLoginAttempts: 5,
      sessionTimeout: 1440,
      twoFactorAuth: false
    },
    updatedBy: adminUser.id,
  },
});

console.log("PlatformSettings default values created/updated.");

  // --- 1. Create a Master Upliner User (GOLD Tier) ---
  const uplinerPassword = await bcrypt.hash('password123', 10);
  const upliner = await prisma.user.create({
    data: {
      fullName: 'Master Upliner',
      username: 'master_upliner',
      email: 'upliner@example.com',
      phone: '1112223333',
      password: uplinerPassword,
      emailVerified: new Date(),
      tier: Tier.GOLD,
      role: Role.USER, // <-- 3. Explicitly set role to USER
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });
  console.log("Upliner user created:", upliner.username);

  // --- 2. Create a Downline User (SILVER Tier), referred by the Master Upliner ---
  const downline1Password = await bcrypt.hash('password123', 10);
  const downline1 = await prisma.user.create({
    data: {
      fullName: 'Silver Downline',
      username: 'silver_downline',
      email: 'downline1@example.com',
      phone: '4445556666',
      password: downline1Password,
      emailVerified: new Date(),
      tier: Tier.SILVER,
      role: Role.USER, // <-- 3. Explicitly set role to USER
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      uplinerId: upliner.id, // Link to the upliner
    },
  });
  console.log("Downline user 1 created:", downline1.username);

  // --- 3. Create another Downline User (BRONZE Tier), also referred by the Master Upliner ---
  const downline2Password = await bcrypt.hash('password123', 10);
  const downline2 = await prisma.user.create({
    data: {
      fullName: 'Bronze Downline',
      username: 'bronze_downline',
      email: 'downline2@example.com',
      phone: '7778889999',
      password: downline2Password,
      emailVerified: new Date(),
      tier: Tier.BRONZE,
      role: Role.USER, // <-- 3. Explicitly set role to USER
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      uplinerId: upliner.id, // Link to the upliner
    },
  });
  console.log("Downline user 2 created:", downline2.username);

  // --- 4. Create COMMISSION Transactions for the Master Upliner ---
  // Transaction logic remains the same
  await prisma.transaction.createMany({
    data: [
      { type: 'COMMISSION', amount: 2500.00, status: 'COMPLETED', userId: upliner.id, sourceUserId: downline1.id },
      { type: 'COMMISSION', amount: 1500.00, status: 'COMPLETED', userId: upliner.id, sourceUserId: downline1.id },
      { type: 'COMMISSION', amount: 1000.00, status: 'COMPLETED', userId: upliner.id, sourceUserId: downline2.id },
      { type: 'BONUS', amount: 5000.00, status: 'COMPLETED', userId: upliner.id },
      { type: 'WITHDRAWAL', amount: 3000.00, status: 'COMPLETED', userId: upliner.id },
    ],
  });
  console.log("Transactions created for upliner.");
}

main()
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding finished successfully.");
    await prisma.$disconnect();
  });