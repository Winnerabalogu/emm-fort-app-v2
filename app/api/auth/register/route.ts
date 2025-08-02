/* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PasswordHash } from 'phpass';
import { RegisterSchema } from '@/lib/schemas';
import { sendVerificationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { prismaWp } from '@/lib/prisma-wp';

const wpPasswordHasher = new PasswordHash(8, false);

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, fullName, phone, referral } = RegisterSchema.parse(await request.json());
    const existingAppUser = await prisma.user.findFirst({
      where: { OR: [{ email: { equals: email, mode: 'insensitive' } }, { username }] },
    });
    const existingWpUser = await prismaWp.wp_users.findFirst({
      where: { OR: [{ user_email: email }, { user_login: username }] },
    });

    if (existingAppUser || existingWpUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 409 });
    }

    // --- Prepare Data ---
    const appHashedPassword = await bcrypt.hash(password, 10);
    const wpHashedPassword = wpPasswordHasher.hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 3600000);

    let uplinerAppId: string | null = null;
    let uplinerWpAffiliateId: bigint | null = null;

    if (referral) {
      const uplinerApp = await prisma.user.findUnique({ where: { username: referral } });
      if (uplinerApp) {
        uplinerAppId = uplinerApp.id;
        const uplinerWp = await prismaWp.wp_users.findFirst({
          where: { user_login: referral }
        });
        if (uplinerWp) {
          const uplinerAffiliate = await prismaWp.wp_slicewp_affiliates.findFirst({
            where: { user_id: uplinerWp.ID }
          });
          if (uplinerAffiliate) {
            uplinerWpAffiliateId = uplinerAffiliate.id;
          }
        }
      }
    }

    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 1. Create the user in our App's DB
    const appUser = await prisma.user.create({
      data: {
        fullName, username, email, phone, referral, uplinerId: uplinerAppId,
        password: appHashedPassword,
        verificationToken, verificationTokenExpiry,
      },
    });

    // Use a try/catch block for the WordPress operations to allow for a rollback
    try {
      // 2. Create the user in the WordPress DB
      const wpUser = await prismaWp.wp_users.create({
        data: {
          user_login: username,
          user_pass: wpHashedPassword,
          user_nicename: username.toLowerCase(),
          user_email: email,
          display_name: fullName,
          user_registered: new Date(),
        }
      });

      // 3. Create the necessary metadata for the WP user
      await prismaWp.wp_usermeta.createMany({
        data: [
          { user_id: wpUser.ID, meta_key: 'nickname', meta_value: username },
          { user_id: wpUser.ID, meta_key: 'first_name', meta_value: firstName },
          { user_id: wpUser.ID, meta_key: 'last_name', meta_value: lastName },
          { user_id: wpUser.ID, meta_key: 'wp_capabilities', meta_value: 'a:1:{s:10:"subscriber";b:1;}' }, 
          { user_id: wpUser.ID, meta_key: 'billing_phone', meta_value: phone },
        ]
      });

      // 4. Create the affiliate record in SliceWP
       await prismaWp.wp_slicewp_affiliates.create({
        data: {
          user_id: wpUser.ID,
          status: 'pending',
          date_created: new Date(),
          date_modified: new Date(),
          parent_id: uplinerWpAffiliateId || BigInt(0),
          payment_email: email, 
          website: '',          
        }
      });

    } catch (wpError) {
      // If any WordPress operation fails, roll back the app user creation for consistency
      await prisma.user.delete({ where: { id: appUser.id } });
      console.error("Failed to create WordPress user, rolling back app user.", wpError);
      throw new Error("Failed to create user in our affiliate system.");
    }
    
    await sendVerificationEmail(appUser.email, verificationToken);
    
    const { password: _, ...userWithoutPassword } = appUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('REGISTRATION ERROR:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}