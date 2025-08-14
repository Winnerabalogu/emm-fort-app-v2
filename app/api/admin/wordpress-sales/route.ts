// app/api/admin/wordpress-sales/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth-admin';
import { prismaWp } from '@/lib/prisma-wp';
import { processCommissions } from '@/lib/commissionService';
import { z } from 'zod';
import type { Prisma } from '@/generated/wordpress-client';


// Schema for WordPress sale data
const WordPressSaleSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  customerEmail: z.string().email("Valid email is required"),
  affiliateUsername: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  orderDate: z.string().datetime("Valid date is required"),
  status: z.enum(['completed', 'processing', 'pending', 'on-hold', 'cancelled', 'refunded', 'failed']),
  description: z.string().optional()
});

const ProcessSalesSchema = z.object({
  sales: z.array(z.object({
    orderId: z.string(),
    customerEmail: z.string().email(),
    affiliateUsername: z.string().optional(),
    amount: z.number().positive(),
    orderDate: z.string(),
    status: z.string()
  }))
});

type Wp_wc_ordersWhereInput = Prisma.wp_wc_ordersWhereInput;

// GET: Fetch WordPress sales with filters
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    const skip = (page - 1) * limit;

    // Build where clause for wp_wc_orders with inferred typing
    const where: Wp_wc_ordersWhereInput = {};
    
    if (status !== 'all') {
      if (status === 'processed') {
        // We'll need to track processed orders differently since wp_wc_orders doesn't have processedAt
        // For now, we'll assume all orders are unprocessed unless we create a separate tracking table
        where.status = 'completed'; // Only show completed orders as "processed"
      } else if (status === 'unprocessed') {
        where.status = { not: 'completed' };
      } else {
        where.status = status;
      }
    }

    if (search) {
      // For search, we need to handle the bigint ID field properly
      const searchAsNumber = parseInt(search);
      const searchConditions: Wp_wc_ordersWhereInput[] = [];
      
      // Add email search (billing_email supports string operations)
      if (search.includes('@') || !searchAsNumber) {
        searchConditions.push({
          billing_email: { contains: search }
        });
      }
      
      // Add ID search only if the search term is a valid number (exact match for BigInt)
      if (!isNaN(searchAsNumber) && searchAsNumber > 0) {
        searchConditions.push({
          id: BigInt(searchAsNumber)
        });
      }
      
      // Only add OR condition if we have valid search conditions
      if (searchConditions.length > 0) {
        where.OR = searchConditions;
      }
    }

    if (dateFrom || dateTo) {
      where.date_created_gmt = {};
      if (dateFrom) where.date_created_gmt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.date_created_gmt.lte = toDate;
      }
    }

    const [orders, totalCount] = await Promise.all([
      prismaWp.wp_wc_orders.findMany({
        where,
        orderBy: { date_created_gmt: 'desc' },
        skip,
        take: limit
      }),
      prismaWp.wp_wc_orders.count({ where })
    ]);

    // Get order meta for affiliate information - convert bigint to string for keys
    const orderIds = orders.map(order => order.id);
    const orderMeta = await prismaWp.wp_wc_orders_meta.findMany({
      where: {
        order_id: { in: orderIds },
        meta_key: { in: ['_affiliate_username', '_affiliate_user_id', '_slicewp_affiliate_id'] }
      }
    });

    // Map meta to orders using string keys to avoid bigint index issues
    const orderMetaMap = orderMeta.reduce((acc, meta) => {
      const orderIdStr = meta.order_id?.toString();
      if (orderIdStr) {
        if (!acc[orderIdStr]) acc[orderIdStr] = {};
        if (meta.meta_key && meta.meta_value) {
          acc[orderIdStr][meta.meta_key] = meta.meta_value;
        }
      }
      return acc;
    }, {} as Record<string, Record<string, string>>);

    // Get affiliate information for orders that have affiliate data
    const affiliateUserIds = orderMeta
      .filter(meta => meta.meta_key === '_slicewp_affiliate_id' && meta.meta_value)
      .map(meta => parseInt(meta.meta_value!))
      .filter(id => !isNaN(id));

    const affiliateUsers = affiliateUserIds.length > 0 ? await prismaWp.wp_users.findMany({
      where: { ID: { in: affiliateUserIds } },
      select: {
        ID: true,
        user_login: true,
        user_nicename: true,
        display_name: true,
        user_email: true
      }
    }) : [];

    const affiliateMap = affiliateUsers.reduce((acc, user) => {
      acc[user.ID.toString()] = user;
      return acc;
    }, {} as Record<string, typeof affiliateUsers[0]>);

    // Format the response - use string conversion for bigint keys
    const formattedOrders = orders.map(order => {
      const orderIdStr = order.id.toString();
      const meta = orderMetaMap[orderIdStr] || {};
      const affiliateId = meta['_slicewp_affiliate_id'];
      const affiliate = affiliateId ? affiliateMap[affiliateId] : null;

      return {
        id: orderIdStr,
        orderId: orderIdStr,
        customerEmail: order.billing_email || 'N/A',
        affiliateUsername: affiliate?.user_login || meta['_affiliate_username'] || undefined,
        amount: parseFloat(order.total_amount?.toString() || '0'),
        orderDate: order.date_created_gmt?.toISOString() || new Date().toISOString(),
        status: order.status || 'unknown',
        processedAt: null, // We'll implement this when we add processing tracking
        description: `WooCommerce Order #${orderIdStr}`,
        affiliate: affiliate ? {
          id: affiliate.ID.toString(),
          fullName: affiliate.display_name || affiliate.user_nicename || 'Unknown',
          username: affiliate.user_login || 'unknown',
          tier: 'BASIC' // Default tier, we'd need to get this from user meta
        } : undefined,
        createdAt: order.date_created_gmt?.toISOString() || new Date().toISOString()
      };
    });

    // Calculate stats
    const allOrdersStats = await Promise.all([
      prismaWp.wp_wc_orders.count(),
      prismaWp.wp_wc_orders.aggregate({
        _sum: { total_amount: true }
      }),
      prismaWp.wp_wc_orders.count({ where: { status: 'completed' } }),
      prismaWp.wp_wc_orders.aggregate({
        where: { status: 'completed' },
        _sum: { total_amount: true }
      })
    ]);

    const [totalOrderCount, totalOrderSum, completedCount, completedSum] = allOrdersStats;

    const summaryStats = {
      processed: {
        count: completedCount,
        amount: parseFloat(completedSum._sum.total_amount?.toString() || '0')
      },
      unprocessed: {
        count: totalOrderCount - completedCount,
        amount: parseFloat(totalOrderSum._sum.total_amount?.toString() || '0') - 
                parseFloat(completedSum._sum.total_amount?.toString() || '0')
      },
      total: {
        count: totalOrderCount,
        amount: parseFloat(totalOrderSum._sum.total_amount?.toString() || '0')
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        sales: formattedOrders,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        stats: summaryStats
      }
    });

  } catch (error) {
    console.error('ADMIN_WP_SALES_FETCH_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch WordPress sales'
    }, { status: 500 });
  }
});

// POST: Process multiple sales (create commissions)
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validation = ProcessSalesSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { sales } = validation.data;
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const saleData of sales) {
      try {
        // Validate order ID is a valid number
        const orderIdNum = parseInt(saleData.orderId);
        if (isNaN(orderIdNum) || orderIdNum <= 0) {
          results.errors.push(`Invalid order ID: ${saleData.orderId}`);
          results.failed++;
          continue;
        }

        // Find the WooCommerce order
        const order = await prismaWp.wp_wc_orders.findFirst({
          where: { id: BigInt(orderIdNum) }
        });

        if (!order) {
          results.errors.push(`Order ${saleData.orderId} not found`);
          results.failed++;
          continue;
        }

        // Find affiliate user if provided
        let affiliate = null;
        if (saleData.affiliateUsername) {
          affiliate = await prismaWp.wp_users.findFirst({
            where: { user_login: saleData.affiliateUsername }
          });
          
          if (!affiliate) {
            results.errors.push(`Affiliate '${saleData.affiliateUsername}' not found for order ${saleData.orderId}`);
            results.failed++;
            continue;
          }
        }

        // Check if commission already exists
        const existingCommission = await prismaWp.wp_slicewp_commissions.findFirst({
          where: { reference: saleData.orderId }
        });

        if (existingCommission) {
          results.errors.push(`Commission already exists for order ${saleData.orderId}`);
          results.failed++;
          continue;
        }

        // Process commission if affiliate exists and sale is completed
        if (affiliate && saleData.status === 'completed') {
          const commissionRate = 0.1; // 10% - make this configurable
          const commissionAmount = saleData.amount * commissionRate;
          
          // Create SliceWP commission
          await prismaWp.wp_slicewp_commissions.create({
            data: {
              affiliate_id: BigInt(affiliate.ID),
              visit_id: BigInt(0), // We don't have visit tracking yet
              date_created: new Date(),
              date_modified: new Date(),
              type: 'sale',
              status: 'unpaid',
              reference: saleData.orderId,
              reference_amount: commissionAmount.toString(),
              customer_id: BigInt(order.customer_id || 0),
              origin: 'woocommerce',
              amount: commissionAmount.toString(),
              parent_id: BigInt(0),
              payment_id: BigInt(0),
              currency: order.currency || 'NGN'
            }
          });

          // If you have the main app's commission system, process upstream commissions
          // await processCommissions(affiliate.ID.toString(), commissionAmount);
        }

        results.processed++;

      } catch (saleError) {
        results.failed++;
        results.errors.push(
          `Failed to process order ${saleData.orderId}: ${
            saleError instanceof Error ? saleError.message : 'Unknown error'
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processing complete: ${results.processed} processed, ${results.failed} failed`,
      data: results
    });

  } catch (error) {
    console.error('ADMIN_WP_SALES_PROCESS_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process WordPress sales'
    }, { status: 500 });
  }
});

// PUT: Add manual sale (create order manually)
export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validation = WordPressSaleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { orderId, customerEmail, affiliateUsername, amount, orderDate, status, description } = validation.data;

    // Validate order ID is a valid number
    const orderIdNum = parseInt(orderId);
    if (isNaN(orderIdNum) || orderIdNum <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Order ID must be a valid positive number'
      }, { status: 400 });
    }

    // Check if order ID already exists
    const existingOrder = await prismaWp.wp_wc_orders.findFirst({
      where: { id: BigInt(orderIdNum) }
    });

    if (existingOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order ID already exists'
      }, { status: 409 });
    }

    // Find affiliate if provided
    let affiliate = null;
    if (affiliateUsername) {
      affiliate = await prismaWp.wp_users.findFirst({
        where: { user_login: affiliateUsername },
        select: { 
          ID: true, 
          display_name: true, 
          user_login: true,
          user_email: true
        }
      });

      if (!affiliate) {
        return NextResponse.json({
          success: false,
          error: `Affiliate '${affiliateUsername}' not found`
        }, { status: 404 });
      }
    }

    // Create manual order (this is a simplified version)
    const newOrderId = BigInt(orderIdNum);
    const order = await prismaWp.wp_wc_orders.create({
      data: {
        id: newOrderId,
        status: status,
        currency: 'NGN',
        type: 'shop_order',
        tax_amount: 0,
        total_amount: amount,
        customer_id: null,
        billing_email: customerEmail,
        date_created_gmt: new Date(orderDate),
        date_updated_gmt: new Date(),
        parent_order_id: null,
        payment_method: 'manual',
        payment_method_title: 'Manual Entry',
        transaction_id: null,
        ip_address: null,
        user_agent: 'Admin Dashboard',
        customer_note: description || null
      }
    });

    // Add affiliate meta if applicable
    if (affiliate) {
      await prismaWp.wp_wc_orders_meta.create({
        data: {
          order_id: newOrderId,
          meta_key: '_slicewp_affiliate_id',
          meta_value: affiliate.ID.toString()
        }
      });
    }

    // Process commission if applicable
    let commission = null;
    if (affiliate && status === 'completed') {
      const commissionRate = 0.1; // 10% commission
      const commissionAmount = amount * commissionRate;
      
      commission = await prismaWp.wp_slicewp_commissions.create({
        data: {
          affiliate_id: BigInt(affiliate.ID),
          visit_id: BigInt(0),
          date_created: new Date(),
          date_modified: new Date(),
          type: 'sale',
          status: 'unpaid',
          reference: orderId,
          reference_amount: commissionAmount.toString(),
          customer_id: BigInt(0),
          origin: 'manual',
          amount: commissionAmount.toString(),
          parent_id: BigInt(0),
          payment_id: BigInt(0),
          currency: 'NGN'
        }
      });

      // Process upstream commissions if you have the system
      // await processCommissions(affiliate.ID.toString(), commissionAmount);
    }

    return NextResponse.json({
      success: true,
      message: 'WordPress sale created successfully',
      data: {
        sale: {
          id: order.id.toString(),
          orderId: order.id.toString(),
          customerEmail: order.billing_email,
          amount: parseFloat(order.total_amount?.toString() || '0'),
          orderDate: order.date_created_gmt?.toISOString(),
          status: order.status,
          processedAt: new Date().toISOString(),
          createdAt: order.date_created_gmt?.toISOString(),
          affiliate: affiliate ? {
            id: affiliate.ID.toString(),
            fullName: affiliate.display_name || 'Unknown',
            username: affiliate.user_login,
            tier: 'BASIC'
          } : undefined
        },
        commission
      }
    });

  } catch (error) {
    console.error('ADMIN_WP_SALES_CREATE_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create WordPress sale'
    }, { status: 500 });
  }
});