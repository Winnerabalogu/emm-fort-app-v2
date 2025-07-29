/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/email.ts
import nodemailer from 'nodemailer';
import { Tier } from '@prisma/client';


if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP environment variables are not fully configured. Email sending will be disabled.");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const fromEmail = `EMM-Fort Group <${process.env.SMTP_USER}>`;
const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${siteUrl}/auth/verify-token?token=${token}`;

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: 'Verify Your Email Address for EMM-Fort',
    html: `
      <h1>Welcome to EMM-Fort!</h1>
      <p>Please click the link below to verify your email address and activate your account:</p>
      <a href="${verificationLink}" style="padding: 10px 20px; background-color: #F97316; color: white; text-decoration: none; border-radius: 5px;">Verify My Email</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${email}`);
};

export const sendSubscriptionSuccessEmail = async (email: string, tier: Tier, expiryDate: Date) => {
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: `Welcome to the ${tier} Tier!`,
    html: `
      <h1>Subscription Activated!</h1>
      <p>Congratulations! You are now subscribed to the <strong>${tier.charAt(0) + tier.slice(1).toLowerCase()}</strong> plan.</p>
      <p>Your subscription is active and will expire on ${formattedExpiry}.</p>
      <a href="${siteUrl}/auth/login">Go to Your Dashboard</a>
    `,
  };
  
  await transporter.sendMail(mailOptions);
  console.log(`Subscription success email sent to ${email}`);
};
// --- NEW FUNCTION FOR UPGRADES ---
export const sendUpgradeSuccessEmail = async (email: string, oldTier: Tier, newTier: Tier, expiryDate: Date) => {
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

 
    const mailOptions = {
     from: fromEmail,
    to: email,
    subject: 'Your Tier Upgrade is Complete!',
    html: `
      <h1>Upgrade Successful!</h1>
      <p>Congratulations! You have successfully upgraded your plan from <strong>${oldTier.charAt(0) + oldTier.slice(1).toLowerCase()}</strong> to <strong>${newTier.charAt(0) + newTier.slice(1).toLowerCase()}</strong>.</p>
      <p>Your new subscription is active and will expire on ${formattedExpiry}.</p>
      <p>All new benefits are now available in your dashboard.</p>
      <a href="${siteUrl}/dashboard">Go to Your Dashboard</a>
    `,
    };
     await transporter.sendMail(mailOptions);
  console.log(`Subscription success email sent to ${email}`);
};

export const sendNewWithdrawalRequestEmail = async (userEmail: string, amount: number, details: any) => {

  const mailOptions = {
     from: fromEmail,
    to:adminEmail,
    subject: 'Your Tier Upgrade is Complete!',
    html: `
    <h2>New Withdrawal Request Submitted</h2>
    <p>A user has requested a new withdrawal.</p>
    <ul>
      <li><strong>User Email:</strong> ${userEmail}</li>
      <li><strong>Amount:</strong> ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)}</li>
      <li><strong>Bank:</strong> ${details.bankName}</li>
      <li><strong>Account Name:</strong> ${details.firstName} ${details.lastName}</li>
      <li><strong>Account Number:</strong> ${details.accountNumber}</li>
    </ul>
    <p>Please log in to the admin dashboard to approve or reject this request.</p>
  `};

    await transporter.sendMail(mailOptions);
};


export const sendNewSaveRequestEmail = async (userEmail: string, amount: number, purpose: string) => {

  const mailOptions = {
  from: fromEmail,
   to:adminEmail,
  subject: `New Save Request: ${userEmail}`,
  html: `
    <h2>New Save Request Submitted</h2>
    <p>A user has submitted a new request to save funds.</p>
    <ul>
      <li><strong>User Email:</strong> ${userEmail}</li>
      <li><strong>Amount:</strong> ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)}</li>
      <li><strong>Purpose:</strong> ${purpose}</li>
    </ul>
    <p>Please follow up with the user to complete this process.</p>
  `};
  
     await transporter.sendMail(mailOptions);
};
