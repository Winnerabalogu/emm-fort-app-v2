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
const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

// Base email styles
const getBaseEmailStyles = () => `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #f97316;
      margin-bottom: 10px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #6b7280;
      font-size: 16px;
    }
    .content {
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.39);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px 0 rgba(249, 115, 22, 0.5);
    }
    .info-box {
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      color: #0c4a6e;
    }
    .success-box {
      background: #f0fdf4;
      border: 1px solid #22c55e;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      color: #14532d;
    }
    .warning-box {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      color: #92400e;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
    }
    .details-table th {
      background: #f1f5f9;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
    }
    .details-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .highlight {
      color: #f97316;
      font-weight: bold;
    }
  </style>
`;

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${siteUrl}/auth/verify-token?token=${token}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - EMM-Fort Group</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EMM-Fort Group</div>
                <h1 class="title">Welcome to EMM-Fort!</h1>
                <p class="subtitle">Please verify your email address to activate your account</p>
            </div>
            
            <div class="content">
                <p>Hi there,</p>
                <p>Welcome to EMM-Fort Group! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" class="button">Verify My Email</a>
                </div>
                
                <div class="warning-box">
                    <strong>⚠️ Important:</strong> This verification link will expire in 1 hour for security reasons. Please verify your email as soon as possible.
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="color: #f97316; word-break: break-all; text-decoration: underline;">${verificationLink}</p>
                
                <p>Once verified, you'll be able to access all features of your EMM-Fort account.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>&copy; ${new Date().getFullYear()} EMM-Fort Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
    Welcome to EMM-Fort Group!
    
    Please verify your email address by clicking the link below:
    ${verificationLink}
    
    This link will expire in 1 hour.
    
    Thanks,
    EMM-Fort Group Team
  `;

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: 'Verify Your Email Address - EMM-Fort Group',
    text: emailText,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${email}`);
};

export const sendSubscriptionSuccessEmail = async (email: string, tier: Tier, expiryDate: Date) => {
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const tierDisplay = tier.charAt(0) + tier.slice(1).toLowerCase();
  const dashboardUrl = `${siteUrl}/dashboard`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${tierDisplay} Tier - EMM-Fort Group</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EMM-Fort Group</div>
                <h1 class="title">🎉 Subscription Activated!</h1>
                <p class="subtitle">Welcome to the <span class="highlight">${tierDisplay}</span> tier</p>
            </div>
            
            <div class="content">
                <p>Congratulations and welcome aboard!</p>
                <p>Your subscription to the <strong>${tierDisplay}</strong> plan has been successfully activated. You now have access to all the premium features and benefits of your tier.</p>
                
                <div class="success-box">
                    <table class="details-table">
                        <tr>
                            <th>Subscription Plan</th>
                            <td><strong>${tierDisplay}</strong></td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td><span style="color: #22c55e; font-weight: bold;">✅ Active</span></td>
                        </tr>
                        <tr>
                            <th>Expires On</th>
                            <td>${formattedExpiry}</td>
                        </tr>
                    </table>
                </div>
                
                <p>Ready to get started? Access your dashboard to explore all the features available in your ${tierDisplay} plan:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                </div>
                
                <div class="info-box">
                    <h3 style="margin-top: 0;">What's Next?</h3>
                    <ul>
                        <li>Explore your dashboard and available features</li>
                        <li>Complete your profile setup</li>
                        <li>Start enjoying your ${tierDisplay} benefits</li>
                        <li>Contact support if you need any assistance</li>
                    </ul>
                </div>
                
                <p>Thank you for choosing EMM-Fort Group. We're here to support your success!</p>
            </div>
            
            <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>Need help? Contact our support team anytime.</p>
                <p>&copy; ${new Date().getFullYear()} EMM-Fort Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
    Subscription Activated!
    
    Congratulations! You are now subscribed to the ${tierDisplay} plan.
    Your subscription is active and will expire on ${formattedExpiry}.
    
    Access your dashboard: ${dashboardUrl}
    
    Thanks,
    EMM-Fort Group Team
  `;
  
  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: `🎉 Welcome to the ${tierDisplay} Tier - EMM-Fort Group`,
    text: emailText,
    html: emailHtml,
  };
  
  await transporter.sendMail(mailOptions);
  console.log(`Subscription success email sent to ${email}`);
};

export const sendUpgradeSuccessEmail = async (email: string, oldTier: Tier, newTier: Tier, expiryDate: Date) => {
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const oldTierDisplay = oldTier.charAt(0) + oldTier.slice(1).toLowerCase();
  const newTierDisplay = newTier.charAt(0) + newTier.slice(1).toLowerCase();
  const dashboardUrl = `${siteUrl}/dashboard`;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upgrade Complete - EMM-Fort Group</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EMM-Fort Group</div>
                <h1 class="title">🚀 Upgrade Successful!</h1>
                <p class="subtitle">You've been upgraded to <span class="highlight">${newTierDisplay}</span></p>
            </div>
            
            <div class="content">
                <p>Congratulations on your upgrade!</p>
                <p>You have successfully upgraded your plan from <strong>${oldTierDisplay}</strong> to <strong>${newTierDisplay}</strong>. All your new benefits are now active and ready to use.</p>
                
                <div class="success-box">
                    <table class="details-table">
                        <tr>
                            <th>Previous Plan</th>
                            <td>${oldTierDisplay}</td>
                        </tr>
                        <tr>
                            <th>New Plan</th>
                            <td><strong>${newTierDisplay}</strong></td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td><span style="color: #22c55e; font-weight: bold;">✅ Active</span></td>
                        </tr>
                        <tr>
                            <th>Expires On</th>
                            <td>${formattedExpiry}</td>
                        </tr>
                    </table>
                </div>
                
                <p>Your enhanced features are now available in your dashboard:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" class="button">Explore New Features</a>
                </div>
                
                <div class="info-box">
                    <h3 style="margin-top: 0;">🎁 What's New in ${newTierDisplay}?</h3>
                    <p>Check your dashboard to discover all the enhanced features and benefits now available to you. Your upgrade gives you access to more tools and opportunities for success.</p>
                </div>
                
                <p>Thank you for continuing to grow with EMM-Fort Group. We're excited to support your journey at this new level!</p>
            </div>
            
            <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>Questions about your new features? Our support team is here to help.</p>
                <p>&copy; ${new Date().getFullYear()} EMM-Fort Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
    Upgrade Successful!
    
    You have successfully upgraded from ${oldTierDisplay} to ${newTierDisplay}.
    Your new subscription is active and will expire on ${formattedExpiry}.
    
    All new benefits are now available in your dashboard: ${dashboardUrl}
    
    Thanks,
    EMM-Fort Group Team
  `;

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: `🚀 Upgrade Complete: Welcome to ${newTierDisplay} - EMM-Fort Group`,
    text: emailText,
    html: emailHtml,
  };
     
  await transporter.sendMail(mailOptions);
  console.log(`Upgrade success email sent to ${email}`);
};

export const sendNewWithdrawalRequestEmail = async (userEmail: string, amount: number, details: any) => {
  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Withdrawal Request - EMM-Fort Group Admin</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EMM-Fort Group</div>
                <h1 class="title">💰 New Withdrawal Request</h1>
                <p class="subtitle">Action required: User withdrawal pending approval</p>
            </div>
            
            <div class="content">
                <p>A user has submitted a new withdrawal request that requires your attention.</p>
                
                <div class="info-box">
                    <h3 style="margin-top: 0;">📋 Request Details</h3>
                    <table class="details-table">
                        <tr>
                            <th>User Email</th>
                            <td>${userEmail}</td>
                        </tr>
                        <tr>
                            <th>Amount</th>
                            <td><strong style="color: #f97316;">${formattedAmount}</strong></td>
                        </tr>
                        <tr>
                            <th>Bank Name</th>
                            <td>${details.bankName}</td>
                        </tr>
                        <tr>
                            <th>Account Name</th>
                            <td>${details.firstName} ${details.lastName}</td>
                        </tr>
                        <tr>
                            <th>Account Number</th>
                            <td>${details.accountNumber}</td>
                        </tr>
                        <tr>
                            <th>Request Time</th>
                            <td>${new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })} (WAT)</td>
                        </tr>
                    </table>
                </div>
                
                <div class="warning-box">
                    <strong>⚠️ Action Required:</strong> Please log in to the admin dashboard to review and process this withdrawal request. Verify all details before approving the transaction.
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${siteUrl}/admin" class="button">Go to Admin Dashboard</a>
                </div>
                
                <p><strong>Important:</strong> Always verify user identity and account details before processing withdrawals to ensure security and prevent fraud.</p>
            </div>
            
            <div class="footer">
                <p>This notification was sent to ${adminEmail}</p>
                <p>EMM-Fort Group Admin System</p>
                <p>&copy; ${new Date().getFullYear()} EMM-Fort Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
    New Withdrawal Request - EMM-Fort Group
    
    A user has requested a new withdrawal:
    
    User Email: ${userEmail}
    Amount: ${formattedAmount}
    Bank: ${details.bankName}
    Account Name: ${details.firstName} ${details.lastName}
    Account Number: ${details.accountNumber}
    
    Please log in to the admin dashboard to approve or reject this request.
    
    EMM-Fort Group Admin System
  `;

  const mailOptions = {
    from: fromEmail,
    to: adminEmail,
    subject: `💰 New Withdrawal Request: ${formattedAmount} - EMM-Fort Group`,
    text: emailText,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Withdrawal request notification sent to admin for ${userEmail}`);
};

export const sendNewSaveRequestEmail = async (userEmail: string, amount: number, purpose: string) => {
  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Save Request - EMM-Fort Group Admin</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EMM-Fort Group</div>
                <h1 class="title">💼 New Save Request</h1>
                <p class="subtitle">User has submitted a savings request</p>
            </div>
            
            <div class="content">
                <p>A user has submitted a new request to save funds with EMM-Fort Group.</p>
                
                <div class="info-box">
                    <h3 style="margin-top: 0;">📋 Save Request Details</h3>
                    <table class="details-table">
                        <tr>
                            <th>User Email</th>
                            <td>${userEmail}</td>
                        </tr>
                        <tr>
                            <th>Amount</th>
                            <td><strong style="color: #f97316;">${formattedAmount}</strong></td>
                        </tr>
                        <tr>
                            <th>Purpose</th>
                            <td>${purpose}</td>
                        </tr>
                        <tr>
                            <th>Request Time</th>
                            <td>${new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })} (WAT)</td>
                        </tr>
                    </table>
                </div>
                
                <div class="success-box">
                    <h3 style="margin-top: 0;">📞 Next Steps</h3>
                    <ul style="margin: 0;">
                        <li>Contact the user to confirm their savings plan</li>
                        <li>Provide them with payment instructions</li>
                        <li>Set up their savings account once payment is received</li>
                        <li>Send confirmation once the savings plan is active</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${siteUrl}/admin" class="button">Go to Admin Dashboard</a>
                </div>
                
                <p><strong>Follow-up Required:</strong> Please reach out to the user promptly to complete their savings request and provide excellent customer service.</p>
            </div>
            
            <div class="footer">
                <p>This notification was sent to ${adminEmail}</p>
                <p>EMM-Fort Group Admin System</p>
                <p>&copy; ${new Date().getFullYear()} EMM-Fort Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
    New Save Request - EMM-Fort Group
    
    A user has submitted a new savings request:
    
    User Email: ${userEmail}
    Amount: ${formattedAmount}
    Purpose: ${purpose}
    
    Please follow up with the user to complete this savings process.
    
    EMM-Fort Group Admin System
  `;

  const mailOptions = {
    from: fromEmail,
    to: adminEmail,
    subject: `💼 New Save Request: ${userEmail} - ${formattedAmount}`,
    text: emailText,
    html: emailHtml,
  };
  
  await transporter.sendMail(mailOptions);
  console.log(`Save request notification sent to admin for ${userEmail}`);
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - EMM-Fort Group</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EMM-Fort Group</div>
                <h1 class="title">🔐 Reset Your Password</h1>
                <p class="subtitle">We received a request to reset your password</p>
            </div>
            
            <div class="content">
                <p>Hi there,</p>
                <p>You recently requested to reset your password for your EMM-Fort Group account. Click the button below to reset it:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <div class="warning-box">
                    <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="color: #f97316; word-break: break-all; text-decoration: underline;">${resetUrl}</p>
                
                <p><strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>For security reasons, please do not forward this email to anyone.</p>
                <p>&copy; ${new Date().getFullYear()} EMM-Fort Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
    Reset Your Password - EMM-Fort Group
    
    You recently requested to reset your password. Click the link below to reset it:
    
    ${resetUrl}
    
    This link will expire in 1 hour for security reasons.
    
    If you didn't request a password reset, you can safely ignore this email.
    
    Thanks,
    EMM-Fort Group Team
  `;

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: '🔐 Reset Your Password - EMM-Fort Group',
      text: emailText,
      html: emailHtml,
    });
    
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendAdminPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${siteUrl}/admin/auth/reset-password?token=${resetToken}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Password Reset - EMM-Fort Group</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">EMM-Fort Group</div>
                <h1 class="title">🔐 Admin Password Reset</h1>
                <p class="subtitle">Secure admin access password reset request</p>
            </div>
            
            <div class="content">
                <p>Hello Administrator,</p>
                <p>A password reset has been requested for your admin account. For security, this reset link is only valid for <strong>1 hour</strong> and can only be used once.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="button">Reset Admin Password</a>
                </div>
                
                <div class="warning-box">
                    <strong>🔒 Security Notice:</strong>
                    <ul style="margin: 10px 0;">
                        <li>This link expires in <strong>60 minutes</strong></li>
                        <li>Only use this link from a secure, trusted device</li>
                        <li>Admin passwords must be at least 12 characters</li>
                        <li>Never share this reset link with anyone</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this secure link:</p>
                <p style="color: #f97316; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
                
                <div class="info-box">
                    <strong>🛡️ Security Tips:</strong>
                    <ul style="margin: 10px 0;">
                        <li>Use a strong, unique password for your admin account</li>
                        <li>Consider using a password manager</li>
                        <li>Enable two-factor authentication when available</li>
                        <li>Log out of admin sessions when finished</li>
                    </ul>
                </div>
                
                <p><strong>Didn't request this reset?</strong> If you didn't initiate this password reset, please contact IT security immediately. Someone may be attempting unauthorized access to your admin account.</p>
                
                <p><strong>Emergency Contact:</strong> If you suspect unauthorized access, contact the system administrator immediately.</p>
            </div>
            
            <div class="footer">
                <p>This secure email was sent to ${email}</p>
                <p><strong>CONFIDENTIAL:</strong> This email contains sensitive admin access information</p>
                <p>&copy; ${new Date().getFullYear()} EMM-Fort Group. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
    EMM-Fort Group - Admin Password Reset
    
    A password reset has been requested for your administrator account.
    
    Reset your admin password: ${resetUrl}
    
    SECURITY NOTICE:
    - This link expires in 60 minutes
    - Admin passwords must be at least 12 characters  
    - Only use this link from a secure device
    - Never share this reset link
    
    If you didn't request this reset, contact IT security immediately.
    
    EMM-Fort Group Security Team
  `;

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: '🔒 Admin Password Reset - EMM-Fort Group [SECURE]',
      text: emailText,
      html: emailHtml,
      priority: 'high', // High priority for admin emails
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High'
      }
    });
    
    console.log(`Admin password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error('Failed to send admin password reset email:', error);
    throw new Error('Failed to send admin password reset email');
  }
};