// prisma/seed.ts
import { PrismaClient, Tier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
async function clearDatabase() {  
  await prisma.transaction.deleteMany();  
  await prisma.user.updateMany({
    where: { uplinerId: { not: null } },
    data: { uplinerId: null }
  });
  await prisma.user.deleteMany();  
}

async function main() {
  await clearDatabase();  

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
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });  

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
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      uplinerId: upliner.id, // Link to the upliner
    },
  });  

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
      subscriptionStartDate: new Date(),
      subscriptionExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      uplinerId: upliner.id, // Link to the upliner
    },
  });  
  
  // --- 4. Create COMMISSION Transactions for the Master Upliner ---
  // These transactions simulate earnings generated from the downlines.
  await prisma.transaction.createMany({
    data: [
      { // Commission from the SILVER downline
        type: 'COMMISSION',
        amount: 2500.00,
        status: 'COMPLETED',
        userId: upliner.id,       // Paid TO the upliner
        sourceUserId: downline1.id, // Sourced FROM downline1
      },
      { // A second commission from the SILVER downline
        type: 'COMMISSION',
        amount: 1500.00,
        status: 'COMPLETED',
        userId: upliner.id,
        sourceUserId: downline1.id,
      },
      { // Commission from the BRONZE downline
        type: 'COMMISSION',
        amount: 1000.00,
        status: 'COMPLETED',
        userId: upliner.id,       // Paid TO the upliner
        sourceUserId: downline2.id, // Sourced FROM downline2
      },
      { // A general BONUS for the upliner, not from a specific downline
        type: 'BONUS',
        amount: 5000.00,
        status: 'COMPLETED',
        userId: upliner.id,
        // sourceUserId is null here
      },
      { // A WITHDRAWAL for the upliner
        type: 'WITHDRAWAL',
        amount: 3000.00,
        status: 'COMPLETED',
        userId: upliner.id,
      }
    ],
  });  
  
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });