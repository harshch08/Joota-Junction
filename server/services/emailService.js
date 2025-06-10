const nodemailer = require('nodemailer');

// Create transporter (you can use Gmail, SendGrid, or any other service)
const createTransporter = () => {
  // For development, you can use Gmail or a service like Ethereal Email
  // For production, use SendGrid, AWS SES, or similar
  
  // Gmail configuration (you'll need to enable 2FA and use App Password)
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });

  // Alternative: SendGrid configuration
  // return nodemailer.createTransporter({
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   auth: {
  //     user: 'apikey',
  //     pass: process.env.SENDGRID_API_KEY
  //   }
  // });
};

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@jootajunction.com',
      to: email,
      subject: 'Email Verification - JOOTA JUNCTION',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">JOOTA JUNCTION</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Email Verification</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">Hello ${name}!</h2>
              <p style="color: #4b5563; margin: 0 0 15px 0; line-height: 1.6;">
                Thank you for registering with JOOTA JUNCTION. To complete your registration, please use the verification code below:
              </p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
                This code will expire in 5 minutes
              </p>
            </div>
            
            <div style="margin: 25px 0;">
              <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Important:</strong>
              </p>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>This code is valid for 5 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this verification, please ignore this email</li>
              </ul>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 25px;">
              <p style="color: #6b7280; margin: 0; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} JOOTA JUNCTION. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        JOOTA JUNCTION - Email Verification
        
        Hello ${name}!
        
        Thank you for registering with JOOTA JUNCTION. To complete your registration, please use the verification code below:
        
        ${otp}
        
        This code will expire in 5 minutes.
        
        Important:
        - This code is valid for 5 minutes only
        - Do not share this code with anyone
        - If you didn't request this verification, please ignore this email
        
        © ${new Date().getFullYear()} JOOTA JUNCTION. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@jootajunction.com',
      to: email,
      subject: 'Welcome to JOOTA JUNCTION!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">JOOTA JUNCTION</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Welcome to our community!</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">Welcome, ${name}!</h2>
              <p style="color: #4b5563; margin: 0 0 15px 0; line-height: 1.6;">
                Your email has been successfully verified! You're now a member of the JOOTA JUNCTION community.
              </p>
              <p style="color: #4b5563; margin: 0; line-height: 1.6;">
                You can now enjoy shopping for the latest footwear and accessories with exclusive member benefits.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Start Shopping
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 25px;">
              <p style="color: #6b7280; margin: 0; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} JOOTA JUNCTION. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
}; 