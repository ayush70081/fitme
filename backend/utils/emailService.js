const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if all required environment variables are present
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`Email service disabled. Missing environment variables: ${missingVars.join(', ')}`);
      console.warn('Using console logging for email simulation in development');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
  }

  async verifyConnection() {
    if (!this.transporter) {
      throw new Error('Email service not initialized. Check SMTP configuration.');
    }

    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      throw error;
    }
  }

  async sendOTPEmail(email, otp, firstName = '') {
    if (!this.transporter) {
      // For development: log the OTP to console
      console.log('\n' + '='.repeat(60));
      console.log('📧 EMAIL SIMULATION (Development Mode)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: Email Verification - FitMe App`);
      console.log(`OTP CODE: ${otp}`);
      console.log(`Name: ${firstName}`);
      console.log('='.repeat(60));
      console.log('Copy this OTP code to verify your email in the frontend');
      console.log('='.repeat(60) + '\n');
      
      // Simulate successful email sending
      return { messageId: 'simulated-' + Date.now() };
    }

    const emailTemplate = this.getOTPEmailTemplate(otp, firstName);
    
    const mailOptions = {
      from: `"FitMe App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Email Verification - FitMe App',
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw error;
    }
  }

  async sendPasswordResetOTP(email, otp, firstName = '') {
    if (!this.transporter) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 PASSWORD RESET EMAIL SIMULATION (Development Mode)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset - FitMe App`);
      console.log(`RESET OTP: ${otp}`);
      console.log(`Name: ${firstName}`);
      console.log('='.repeat(60));
      console.log('Copy this OTP code to reset your password in the frontend');
      console.log('='.repeat(60) + '\n');
      return { messageId: 'simulated-reset-' + Date.now() };
    }

    const { html, text } = this.getPasswordResetEmailTemplate(otp, firstName);

    const mailOptions = {
      from: `"FitMe App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset - FitMe App',
      html,
      text
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset OTP email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send password reset OTP email:', error);
      throw error;
    }
  }

  getPasswordResetEmailTemplate(otp, firstName) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - FitMe</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #4f46e5; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
          .otp-box { background-color: #111827; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FitMe</div>
            <h2>Password Reset</h2>
          </div>
          <p>Hello ${firstName ? firstName : 'there'},</p>
          <p>We received a request to reset your password. Use the verification code below to continue:</p>
          <div class="otp-box">
            <div>Your password reset code is:</div>
            <div class="otp-code">${otp}</div>
          </div>
          <p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
          <div class="footer">
            <p>Best regards,<br>The FitMe Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      FitMe - Password Reset

      Hello ${firstName ? firstName : 'there'},

      We received a request to reset your password. Use the verification code below to continue:

      Your password reset code is: ${otp}

      This code expires in 5 minutes. If you didn't request this, you can ignore this email.

      Best regards,
      The FitMe Team

      This is an automated email. Please do not reply to this message.
    `;

    return { html, text };
  }

  getOTPEmailTemplate(otp, firstName) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - FitMe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            color: #4f46e5;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .otp-box {
            background-color: #4f46e5;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 10px 0;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FitMe</div>
            <h2>Email Verification</h2>
          </div>
          
          <p>Hello ${firstName ? firstName : 'there'},</p>
          
          <p>Thank you for registering with FitMe! To complete your registration, please verify your email address using the verification code below:</p>
          
          <div class="otp-box">
            <div>Your verification code is:</div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>Enter this code in the app to verify your email address and activate your account.</p>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This code will expire in 5 minutes</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this verification, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you're having trouble with verification, please contact our support team.</p>
          
          <div class="footer">
            <p>Best regards,<br>The FitMe Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      FitMe - Email Verification
      
      Hello ${firstName ? firstName : 'there'},
      
      Thank you for registering with FitMe! To complete your registration, please verify your email address using the verification code below:
      
      Your verification code is: ${otp}
      
      Enter this code in the app to verify your email address and activate your account.
      
      Important:
      - This code will expire in 5 minutes
      - Do not share this code with anyone
      - If you didn't request this verification, please ignore this email
      
      If you're having trouble with verification, please contact our support team.
      
      Best regards,
      The FitMe Team
      
      This is an automated email. Please do not reply to this message.
    `;

    return { html, text };
  }

  async sendWelcomeEmail(email, firstName) {
    if (!this.transporter) {
      // For development: log the welcome email to console
      console.log('\n' + '='.repeat(60));
      console.log('📧 WELCOME EMAIL SIMULATION (Development Mode)');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Subject: Welcome to FitMe!`);
      console.log(`Welcome ${firstName}! Your email has been verified successfully.`);
      console.log('='.repeat(60) + '\n');
      
      // Simulate successful email sending
      return { messageId: 'simulated-welcome-' + Date.now() };
    }

    const mailOptions = {
      from: `"FitMe App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to FitMe!',
      html: this.getWelcomeEmailTemplate(firstName),
      text: `Welcome to FitMe, ${firstName}! Your email has been successfully verified. Start your fitness journey today!`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  getWelcomeEmailTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FitMe!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            color: #4f46e5;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .success-box {
            background-color: #10b981;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FitMe</div>
            <h2>Welcome!</h2>
          </div>
          
          <div class="success-box">
            <h3>🎉 Email Verified Successfully!</h3>
          </div>
          
          <p>Hello ${firstName},</p>
          
          <p>Congratulations! Your email has been successfully verified and your FitMe account is now active.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Complete your fitness profile</li>
            <li>Get personalized workout plans</li>
            <li>Track your progress</li>
            <li>Access AI-powered fitness coaching</li>
          </ul>
          
          <p>Start your fitness journey today and achieve your health goals with FitMe!</p>
          
          <div class="footer">
            <p>Best regards,<br>The FitMe Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();