const nodemailer = require('nodemailer');

// For local testing, we'll log to console if SMTP isn't configured
// In production, these would be in your .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    // If no credentials, just log to console (Smart Debug Mode)
    if (!process.env.EMAIL_USER) {
      console.log('-----------------------------------------');
      console.log(`📧 MOCK EMAIL SENT TO: ${to}`);
      console.log(`📝 SUBJECT: ${subject}`);
      console.log(`📄 CONTENT: ${text}`);
      console.log('-----------------------------------------');
      return true;
    }

    const info = await transporter.sendMail({
      from: '"TeamFlow App" <noreply@teamflow.com>',
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

const sendOTP = async (email, otp) => {
  const subject = "TeamFlow - Your Verification Code";
  const text = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">Verify Your Account</h2>
      <p>Welcome to TeamFlow! Use the code below to complete your registration:</p>
      <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f3f4f6; text-align: center; border-radius: 8px; letter-spacing: 5px; color: #111827;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
    </div>
  `;
  return await sendEmail(email, subject, text, html);
};

const sendTaskAssignment = async (email, taskTitle, projectName) => {
  const subject = `New Task Assigned: ${taskTitle}`;
  const text = `You have been assigned a new task: "${taskTitle}" in project "${projectName}".`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #2563eb;">New Task Assigned</h2>
      <p>Hello! You've been assigned a new task in <b>${projectName}</b>.</p>
      <div style="padding: 15px; border-left: 4px solid #2563eb; background: #f9fafb;">
        <p style="margin: 0; font-weight: bold;">${taskTitle}</p>
      </div>
      <p>Log in to TeamFlow to see more details.</p>
    </div>
  `;
  return await sendEmail(email, subject, text, html);
};

module.exports = { sendEmail, sendOTP, sendTaskAssignment };
