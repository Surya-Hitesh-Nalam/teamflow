const nodemailer = require('nodemailer');
const dns = require('dns');

// Configure transporter with IPv4 Force Fix
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Port 465 REQUIRES secure: true
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
  connectionTimeout: 15000, 
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('-----------------------------------------');
      console.log(`📧 MOCK EMAIL (No Credentials) TO: ${to}`);
      console.log(`📝 SUBJECT: ${subject}`);
      console.log('-----------------------------------------');
      return true;
    }

    const mailOptions = {
      from: `"TeamFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔐 ${subject}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

const sendOTP = async (email, otp) => {
  const otpTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; padding: 20px; }
          .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.3); }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 10px; }
          .content { padding: 50px 40px; text-align: center; }
          .greeting { font-size: 24px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
          .otp-container { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: 800; color: #1e40af; letter-spacing: 8px; font-family: monospace; }
          .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">
              <div class="logo">TeamFlow</div>
              <div style="color: #e2e8f0;">Your Gateway to Team Success</div>
          </div>
          <div class="content">
              <h1 class="greeting">Verify Your Account</h1>
              <p style="color: #64748b;">Use the OTP code below to complete your verification process.</p>
              <div class="otp-container">
                  <div style="font-size: 14px; color: #64748b; margin-bottom: 10px;">YOUR VERIFICATION CODE</div>
                  <div class="otp-code">${otp}</div>
                  <div style="color: #f59e0b; margin-top: 10px;">⏱️ Valid for 10 minutes</div>
              </div>
          </div>
          <div class="footer">
              <p>© 2026 TeamFlow. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
          </div>
      </div>
  </body>
  </html>
  `;
  return await sendEmail(email, "TeamFlow - Your Verification Code", otpTemplate);
};

const sendTaskAssignment = async (email, taskTitle, projectName) => {
  const taskTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; background: #0f172a; padding: 20px; }
          .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 40px; text-align: center; }
          .task-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: left; }
          .cta-button { display: inline-block; padding: 16px 32px; background: #1e40af; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; margin-top: 20px; }
          .footer { padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header"><h1>TeamFlow</h1></div>
          <div class="content">
              <h2>New Task Assigned! 🎉</h2>
              <p>You have a new responsibility in <b>${projectName}</b>.</p>
              <div class="task-card">
                  <h3 style="color: #166534;">${taskTitle}</h3>
                  <p style="color: #15803d; font-size: 14px; margin-top: 10px;">Check your dashboard for details and deadlines.</p>
              </div>
              <a href="${process.env.FRONTEND_URL || '#'}" class="cta-button">VIEW DASHBOARD</a>
          </div>
          <div class="footer">© 2026 TeamFlow Platform</div>
      </div>
  </body>
  </html>
  `;
  return await sendEmail(email, `New Task: ${taskTitle}`, taskTemplate);
};

module.exports = { sendEmail, sendOTP, sendTaskAssignment };
