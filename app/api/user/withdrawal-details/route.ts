export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const details = await prisma.withdrawalDetails.findUnique({
            where: { userId: session.user.id },
        });

        if (!details) {            
            return NextResponse.json(null);
        }

        return NextResponse.json(details);
    } catch (error) {
        console.error("GET_WITHDRAWAL_DETAILS_ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch withdrawal details' }, { status: 500 });
    }
}