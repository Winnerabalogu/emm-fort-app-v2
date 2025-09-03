// scripts/seed-earnings.ts
import { PrismaClient } from '@prisma/client';
import { subDays, addHours } from 'date-fns';

const prisma = new PrismaClient();

interface MockTransaction {
  userId: string;
  sourceUserId?: string;
  type: 'COMMISSION' | 'WITHDRAWAL';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING';
  description: string;
  createdAt: Date;
}

async function seedEarningsData() {
  try {
    console.log('🌱 Starting earnings data seeding...');

    // First, let's check if we have creators and create some if needed
    let creators = await prisma.user.findMany({
      where: { isCreator: true },
      select: { 
        id: true, 
        username: true,
        fullName: true,
        referredUsers: {
          select: { id: true, fullName: true }
        }
      },
      take: 5
    });

    // If no creators exist, convert some regular users to creators
    if (creators.length === 0) {
      console.log('👑 No creators found. Converting some users to creators...');
      
      const regularUsers = await prisma.user.findMany({
        where: { 
          isCreator: false,
          emailVerified: { not: null }
        },
        take: 3
      });

      if (regularUsers.length === 0) {
        console.log('❌ No users found. Please run the main seed script first:');
        console.log('💡 Run: npx prisma db seed');
        return;
      }

      // Update users to be creators
      await prisma.user.updateMany({
        where: { 
          id: { in: regularUsers.map(u => u.id) }
        },
        data: { isCreator: true }
      });

      // Fetch the updated creators
      creators = await prisma.user.findMany({
        where: { 
          id: { in: regularUsers.map(u => u.id) }
        },
        select: { 
          id: true, 
          username: true,
          fullName: true,
          referredUsers: {
            select: { id: true, fullName: true }
          }
        }
      });

      console.log(`✅ Converted ${creators.length} users to creators`);
    }

    const now = new Date();
    const mockTransactions: MockTransaction[] = [];

    // Generate transactions for each creator
    for (const creator of creators) {
      console.log(`📈 Generating earnings for creator: ${creator.username || creator.fullName}`);

      // Get or create some referred users for this creator
      let referredUsers = creator.referredUsers;
      if (referredUsers.length === 0) {
        // Find some users who aren't creators to be "referred users"
        const availableUsers = await prisma.user.findMany({
          where: { 
            isCreator: false,
            uplinerId: null,
            id: { not: creator.id }
          },
          take: 3
        });

        if (availableUsers.length > 0) {
          // Assign them as referred users
          await prisma.user.updateMany({
            where: { 
              id: { in: availableUsers.slice(0, 2).map(u => u.id) }
            },
            data: { uplinerId: creator.id }
          });

          referredUsers = availableUsers.slice(0, 2).map(u => ({
            id: u.id,
            fullName: u.fullName
          }));
          
          console.log(`🔗 Linked ${referredUsers.length} referred users to ${creator.username}`);
        }
      }

      // Generate commission transactions over the last 90 days
      for (let i = 0; i < 25; i++) {
        const transactionDate = subDays(now, Math.floor(Math.random() * 90));
        
        // Random commission amount between ₦50-₦500 (representing 5% of ₦1000-₦10000 orders)
        const orderValue = 1000 + Math.random() * 9000;
        const commissionAmount = orderValue * 0.05;
        
        const sourceUser = referredUsers.length > 0 ? 
          referredUsers[Math.floor(Math.random() * referredUsers.length)] : null;

        mockTransactions.push({
          userId: creator.id,
          sourceUserId: sourceUser?.id,
          type: 'COMMISSION',
          amount: Number(commissionAmount.toFixed(2)),
          status: Math.random() > 0.1 ? 'COMPLETED' : 'PENDING', // 90% completed, 10% pending
          description: 'Referral commission from grocery order',
          createdAt: addHours(transactionDate, Math.floor(Math.random() * 24))
        });
      }

      // Generate some withdrawal transactions
      for (let i = 0; i < 2; i++) {
        const withdrawalDate = subDays(now, Math.floor(Math.random() * 60));
        const withdrawalAmount = 1000 + Math.random() * 3000; // ₦1000-₦4000

        mockTransactions.push({
          userId: creator.id,
          type: 'WITHDRAWAL',
          amount: Number(withdrawalAmount.toFixed(2)),
          status: Math.random() > 0.3 ? 'COMPLETED' : 'PROCESSING', // 70% completed, 30% processing
          description: 'Creator earnings withdrawal',
          createdAt: addHours(withdrawalDate, Math.floor(Math.random() * 24))
        });
      }

      // Add some recent high-value transactions (last 7 days)
      for (let i = 0; i < 7; i++) {
        const recentDate = subDays(now, Math.floor(Math.random() * 7));
        const highOrderValue = 3000 + Math.random() * 7000;
        const highCommission = highOrderValue * 0.05;

        const sourceUser = referredUsers.length > 0 ? 
          referredUsers[Math.floor(Math.random() * referredUsers.length)] : null;

        mockTransactions.push({
          userId: creator.id,
          sourceUserId: sourceUser?.id,
          type: 'COMMISSION',
          amount: Number(highCommission.toFixed(2)),
          status: 'COMPLETED',
          description: 'Premium referral commission',
          createdAt: addHours(recentDate, Math.floor(Math.random() * 24))
        });
      }
    }

    console.log(`📝 Generated ${mockTransactions.length} mock transactions`);

    // Delete existing mock transactions to avoid duplicates
    console.log('🧹 Cleaning up existing mock data...');
    await prisma.transaction.deleteMany({
      where: {
        userId: { in: creators.map(c => c.id) },
        description: { 
          in: [
            'Referral commission from grocery order',
            'Creator earnings withdrawal', 
            'Premium referral commission'
          ]
        }
      }
    });

    // Insert new mock transactions in batches
    console.log('💾 Inserting new transaction data...');
    const batchSize = 50;
    for (let i = 0; i < mockTransactions.length; i += batchSize) {
      const batch = mockTransactions.slice(i, i + batchSize);
      await prisma.transaction.createMany({
        data: batch
      });
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mockTransactions.length / batchSize)}`);
    }

    // Create withdrawal details for creators who don't have them
    console.log('🏦 Setting up withdrawal details...');
    for (const creator of creators) {
      const existingDetails = await prisma.withdrawalDetails.findUnique({
        where: { userId: creator.id }
      });

      if (!existingDetails) {
        const bankNames = [
          'First Bank of Nigeria',
          'Zenith Bank',
          'GTBank',
          'Access Bank',
          'UBA'
        ];

        await prisma.withdrawalDetails.create({
          data: {
            userId: creator.id,
            bankName: bankNames[Math.floor(Math.random() * bankNames.length)],
            firstName: creator.fullName.split(' ')[0] || 'Creator',
            lastName: creator.fullName.split(' ').slice(1).join(' ') || 'User',
            accountNumber: `22${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
          }
        });
        console.log(`🔗 Created withdrawal details for ${creator.username || creator.fullName}`);
      }
    }

    console.log('\n✅ Earnings data seeding completed successfully!');

    // Print summary for each creator
    console.log('\n📊 CREATOR EARNINGS SUMMARY:');
    console.log('='.repeat(60));
    
    for (const creator of creators) {
      const creatorStats = await prisma.transaction.groupBy({
        by: ['type', 'status'],
        where: { userId: creator.id },
        _sum: { amount: true },
        _count: true
      });

      console.log(`\n🎯 ${(creator.username || creator.fullName).toUpperCase()}:`);
      if (creatorStats.length === 0) {
        console.log('   No transactions found');
      } else {
        creatorStats.forEach(stat => {
          console.log(`   ${stat.type} (${stat.status}): ₦${(stat._sum.amount || 0).toFixed(2)} (${stat._count} transactions)`);
        });
      }
    }

    console.log('\n🚀 Ready to test your earnings dashboard!');
    console.log('💡 Navigate to /creator/earnings to see your data');

  } catch (error) {
    console.error('❌ Error seeding earnings data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for potential use in main seed file
export { seedEarningsData };

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedEarningsData()
    .then(() => {
      console.log('\n🎉 Earnings seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Earnings seeding failed:', error);
      process.exit(1);
    });
}