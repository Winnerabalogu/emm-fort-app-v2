// app/api/savings/request/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendNewSaveRequestEmail } from '@/lib/email';

const SaveRequestSchema = z.object({
  amount: z.number().positive(),
  purpose: z.string().min(3, "Purpose must be at least 3 characters."),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = SaveRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { amount, purpose } = validation.data;

     const [saveRequest] = await prisma.$transaction([
      prisma.saveRequest.create({
        data: {
          amount,
          purpose,
          userId: session.user.id,
          status: 'PENDING',
        },
      }),
      prisma.transaction.create({
        data: {
            amount,
            userId: session.user.id,
            type: 'SAVING', 
            status: 'PENDING',
        }
      })
    ]);

    // Send notification email to admin
    await sendNewSaveRequestEmail(session.user.email, amount, purpose);

    return NextResponse.json({ message: 'Save request submitted successfully!', request: saveRequest });

  } catch (error) {
    console.error("SAVE_REQUEST_ERROR: ", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'An internal error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}