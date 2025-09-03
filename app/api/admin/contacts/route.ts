/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
export const runtime = 'nodejs';
import { User } from 'next-auth';
import { z } from 'zod';

const updateContactSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  adminNotes: z.string().optional(),
  assignedTo: z.string().optional()
});

export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const skip = (page - 1) * limit;
    const where: Prisma.ContactRequestWhereInput = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [contacts, totalCount, stats] = await Promise.all([
      prisma.contactRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.contactRequest.count({ where }),
      // Calculate stats
      prisma.contactRequest.groupBy({
        by: ['status'],
        _count: { id: true }
      }).then(async (statusGroups) => {
        const priorityStats = await prisma.contactRequest.groupBy({
          by: ['priority'],
          _count: { id: true }
        });

        const totalStats = await prisma.contactRequest.aggregate({
          _count: { id: true }
        });

        const stats = {
          totalContacts: totalStats._count.id,
          newContacts: 0,
          inProgressContacts: 0,
          resolvedContacts: 0,
          closedContacts: 0,
          urgentContacts: 0,
          highPriorityContacts: 0
        };

        statusGroups.forEach(group => {
          if (group.status === 'NEW') stats.newContacts = group._count.id;
          else if (group.status === 'IN_PROGRESS') stats.inProgressContacts = group._count.id;
          else if (group.status === 'RESOLVED') stats.resolvedContacts = group._count.id;
          else if (group.status === 'CLOSED') stats.closedContacts = group._count.id;
        });

        priorityStats.forEach(group => {
          if (group.priority === 'URGENT') stats.urgentContacts = group._count.id;
          else if (group.priority === 'HIGH') stats.highPriorityContacts = group._count.id;
        });

        return stats;
      })
    ]);

    const contactsWithFormattedDates = contacts.map(contact => ({
      ...contact,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
      respondedAt: contact.respondedAt?.toISOString() || null,
      resolvedAt: contact.resolvedAt?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      data: {
        contacts: contactsWithFormattedDates,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      },
      stats
    });

  } catch (error) {
    console.error('GET_CONTACTS_ERROR:', error);
    throw new Error('Failed to fetch contact requests');
  }
});

export const PUT = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const contactId = url.searchParams.get('id');

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = updateContactSchema.parse(body);

    // Prepare update data
    const updateData: Prisma.ContactRequestUpdateInput = { ...validatedData, updatedAt: new Date() };

    // Set timestamps based on status changes
    if (validatedData.status === 'IN_PROGRESS' && !updateData.respondedAt) {
      updateData.respondedAt = new Date();
    }
    if (validatedData.status === 'RESOLVED' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const updatedContact = await prisma.contactRequest.update({
      where: { id: contactId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedContact,
        createdAt: updatedContact.createdAt.toISOString(),
        updatedAt: updatedContact.updatedAt.toISOString(),
        respondedAt: updatedContact.respondedAt?.toISOString() || null,
        resolvedAt: updatedContact.resolvedAt?.toISOString() || null
      },
      message: 'Contact request updated successfully'
    });

  } catch (error) {
    console.error('UPDATE_CONTACT_ERROR:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    throw new Error('Failed to update contact request');
  }
});

export const DELETE = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const url = new URL(req.url);
    const contactId = url.searchParams.get('id');

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    await prisma.contactRequest.delete({
      where: { id: contactId }
    });

    return NextResponse.json({
      success: true,
      message: 'Contact request deleted successfully'
    });

  } catch (error) {
    console.error('DELETE_CONTACT_ERROR:', error);
    throw new Error('Failed to delete contact request');
  }
});