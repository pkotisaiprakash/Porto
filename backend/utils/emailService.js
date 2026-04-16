const nodemailer = require('nodemailer');

const mailTemplates = {
  welcome: {
    name: 'Welcome Message',
    subject: 'Welcome to Portfolio Builder!',
    body: `<p>Welcome to Portfolio Builder! We're excited to have you on board.</p>
<p>With our platform, you can create stunning portfolios to showcase your work and skills.</p>
<p>Get started by:</p>
<ul>
<li>Completing your profile</li>
<li>Choosing a template</li>
<li>Adding your projects and achievements</li>
</ul>
<p>If you have any questions, feel free to reach out to our support team.</p>`,
    footer: 'Thank you for joining us!',
    style: { primaryColor: '#4f46e5', backgroundColor: '#ffffff', textColor: '#1f2937', footerColor: '#6b7280' }
  },
  update: {
    name: 'Platform Update',
    subject: 'New Features Available!',
    body: `<p>We've been working hard to bring you new features and improvements!</p>
<p><strong>What's New:</strong></p>
<ul>
<li>New portfolio templates added</li>
<li>Improved editor experience</li>
<li>Better performance</li>
</ul>
<p>Log in now to explore the latest updates!</p>`,
    footer: 'Thank you for being part of our community!',
    style: { primaryColor: '#059669', backgroundColor: '#ffffff', textColor: '#1f2937', footerColor: '#6b7280' }
  },
  announcement: {
    name: 'Announcement',
    subject: 'Important Announcement',
    body: `<p>This is an important announcement for all our members.</p>
<p>Please take a moment to review this message and reach out if you have any questions.</p>
<p>We appreciate your continued support and engagement.</p>`,
    footer: 'Best regards, The Team',
    style: { primaryColor: '#dc2626', backgroundColor: '#ffffff', textColor: '#1f2937', footerColor: '#6b7280' }
  },
  newsletter: {
    name: 'Newsletter',
    subject: 'Your Monthly Newsletter',
    body: `<p>Here's your monthly update from Portfolio Builder!</p>
<p><strong>Highlights:</strong></p>
<ul>
<li>New community members</li>
<li>Popular templates this month</li>
<li>Tips and tricks for your portfolio</li>
</ul>
<p>Stay tuned for more updates!</p>`,
    footer: 'Sent with love from the Portfolio Builder team',
    style: { primaryColor: '#7c3aed', backgroundColor: '#ffffff', textColor: '#1f2937', footerColor: '#6b7280' }
  },
  premium: {
    name: 'Premium Offer',
    subject: 'Upgrade to Premium - Special Offer!',
    body: `<p>Unlock the full potential of your portfolio with Premium!</p>
<p><strong>Premium Features:</strong></p>
<ul>
<li>All premium templates</li>
<li>Custom domain support</li>
<li>Analytics dashboard</li>
<li>Priority support</li>
<li>No watermarks</li>
</ul>
<p>Upgrade today and take your portfolio to the next level!</p>`,
    footer: 'Limited time offer - Do not miss out!',
    style: { primaryColor: '#f59e0b', backgroundColor: '#ffffff', textColor: '#1f2937', footerColor: '#6b7280' }
  },
  reminder: {
    name: 'Reminder',
    subject: 'Just a Friendly Reminder',
    body: `<p>We noticed you haven't logged in for a while!</p>
<p>Here's a quick reminder about what you can do:</p>
<ul>
<li>Update your portfolio with new projects</li>
<li>Try out our new templates</li>
<li>Connect with other members</li>
</ul>
<p>We'd love to see what you've been working on!</p>`,
    footer: 'Miss you! Come back soon!',
    style: { primaryColor: '#0891b2', backgroundColor: '#ffffff', textColor: '#1f2937', footerColor: '#6b7280' }
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

const getMailTemplate = (templateId) => {
  if (templateId && mailTemplates[templateId]) {
    const t = mailTemplates[templateId];
    return {
      subject: t.subject,
      body: t.body,
      footer: t.footer,
      style: t.style
    };
  }
  return null;
};

const getAllMailTemplates = () => {
  return Object.entries(mailTemplates).map(([id, template]) => ({
    id,
    name: template.name,
    subject: template.subject,
    body: template.body,
    footer: template.footer,
    style: template.style
  }));
};

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Builder'}" <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
    to: email,
    subject: 'Verify Your Email - Portfolio Builder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Verify Your Email</h2>
        <p>Thank you for registering with Portfolio Builder!</p>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p><strong>This code expires in 10 minutes.</strong></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">Portfolio Builder - Build your professional portfolio</p>
      </div>
    `
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP Email would be sent to: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`To enable email sending, configure SMTP in .env file`);
    return { success: true, previewUrl: null };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Builder'}" <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
    to: email,
    subject: 'Reset Your Password - Portfolio Builder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>You requested a password reset for your Portfolio Builder account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><strong>This link expires in 10 minutes.</strong></p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">Portfolio Builder - Build your professional portfolio</p>
      </div>
    `
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`Password Reset Email would be sent to: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`To enable email sending, configure SMTP in .env file`);
    return { success: true, previewUrl: null };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password Reset Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

const sendBulkMail = async (recipients, subject, body, footer, style) => {
  const { primaryColor, backgroundColor, textColor, footerColor } = style || {};
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: ${backgroundColor || '#ffffff'};">
      <div style="padding: 30px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${primaryColor || '#4f46e5'}; margin: 0;">${subject}</h1>
        </div>
        <div style="color: ${textColor || '#1f2937'}; line-height: 1.6; font-size: 16px;">
          ${body}
        </div>
        ${footer ? `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid ${footerColor || '#e5e7eb'};">
          <p style="color: ${footerColor || '#6b7280'}; font-size: 14px; margin: 0;">${footer}</p>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  if (process.env.NODE_ENV === 'development') {
    console.log(`Bulk Email would be sent to ${recipients.length} recipients`);
    console.log(`Subject: ${subject}`);
    return { success: true, recipientCount: recipients.length };
  }

  const results = [];
  let successful = 0;
  let failed = 0;
  
  for (const recipient of recipients) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Builder'}" <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
        to: recipient,
        subject: subject,
        html: htmlContent
      };
      
      await transporter.sendMail(mailOptions);
      results.push({ email: recipient, status: 'sent' });
      successful++;
    } catch (error) {
      const errorMsg = error.message || error.toString();
      const responseCode = error.response?.code;
      const responseMessage = error.response?.message;
      
      results.push({ email: recipient, status: 'failed', error: `${responseCode || ''} ${responseMessage || errorMsg}` });
      failed++;
    }
  }
  return { 
    success: failed === 0, 
    recipientCount: recipients.length,
    results 
  };
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendBulkMail,
  getMailTemplate,
  getAllMailTemplates,
  mailTemplates,
  transporter
};