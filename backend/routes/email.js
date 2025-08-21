const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  paymentConfirmation: (userData, paymentData, txid = null) => {
    return {
      subject: `B4U Esports - Payment ${txid ? 'Completed' : 'Received'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3B1E5E; margin: 0;">B4U ESPORTS</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Your Ultimate Gaming Marketplace</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #3B1E5E; margin-top: 0;">Payment ${txid ? 'Completed' : 'Received'}</h2>
            <p>Hello <strong>${userData.username}</strong>,</p>
            <p>Your payment has been ${txid ? 'completed successfully' : 'received and is being processed'}.</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #3B1E5E;">Payment Details</h3>
              <p><strong>Product:</strong> ${paymentData.product}</p>
              <p><strong>Amount:</strong> ${paymentData.amount} π</p>
              <p><strong>Status:</strong> ${txid ? 'Completed' : 'Processing'}</p>
              ${txid ? `<p><strong>Transaction ID:</strong> ${txid}</p>` : ''}
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>Thank you for your purchase! Your order is being processed and you will receive your items shortly.</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>If you have any questions, please contact us at:</p>
            <p>📧 <a href="mailto:info@b4uesports.com" style="color: #3B1E5E;">info@b4uesports.com</a></p>
            <p>📱 WhatsApp: +97517875099</p>
            <p>🌐 <a href="https://b4uesports.com" style="color: #3B1E5E;">b4uesports.com</a></p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
  }
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email not configured. Skipping email sending.');
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send payment emails
const sendPaymentEmails = async (payment, user, status, txid = null) => {
  const results = {};
  
  // Send to user
  const userTemplate = emailTemplates.paymentConfirmation(user, payment, txid);
  results.user = await sendEmail(
    payment.userEmail,
    userTemplate.subject,
    userTemplate.html
  );
  
  // Send to admin
  const adminTemplate = emailTemplates.paymentConfirmation(user, payment, txid);
  results.admin = await sendEmail(
    process.env.EMAIL_ADMIN || process.env.EMAIL_USER,
    'Admin Notification: ' + userTemplate.subject,
    userTemplate.html.replace('Payment Received', 'ADMIN NOTIFICATION: New Payment Received')
  );
  
  return results;
};

// Test email endpoint
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    const result = await sendEmail(
      email,
      'Test Email from B4U Esports',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B1E5E;">B4U Esports - Test Email</h2>
          <p>This is a test email to verify your email configuration.</p>
          <p>If you received this email, your SMTP settings are working correctly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    );
    
    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
module.exports.sendPaymentEmails = sendPaymentEmails;
