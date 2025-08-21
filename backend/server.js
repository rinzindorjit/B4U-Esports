const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email transporter configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Routes
app.post('/api/payments/approve', async (req, res) => {
    try {
        const { paymentId, paymentData, user } = req.body;
        
        console.log('Payment approval request:', { paymentId, paymentData, user });
        
        // Send email notifications
        await sendPaymentConfirmationEmails(paymentData, user, paymentId, 'approval');
        
        res.json({ success: true, message: 'Payment approved and emails sent' });
    } catch (error) {
        console.error('Payment approval error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/payments/complete', async (req, res) => {
    try {
        const { paymentId, txid, paymentData, user } = req.body;
        
        console.log('Payment completion request:', { paymentId, txid, paymentData, user });
        
        // Send completion email notifications
        await sendPaymentConfirmationEmails(paymentData, user, paymentId, 'completion', txid);
        
        res.json({ success: true, message: 'Payment completed and emails sent' });
    } catch (error) {
        console.error('Payment completion error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Email sending function
async function sendPaymentConfirmationEmails(paymentData, user, paymentId, status, txid = null) {
    const { product, amount, metadata } = paymentData;
    const { userEmail, piUsername } = metadata;
    
    // Email to user
    const userMailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: userEmail,
        subject: `B4U Esports - Payment ${status === 'approval' ? 'Received' : 'Completed'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3B1E5E;">B4U Esports</h2>
                <p>Hello ${piUsername},</p>
                <p>Your payment has been ${status === 'approval' ? 'received' : 'completed successfully'}.</p>
                <p><strong>Product:</strong> ${product}</p>
                <p><strong>Amount:</strong> ${amount} π</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
                ${txid ? `<p><strong>Transaction ID:</strong> ${txid}</p>` : ''}
                <p>Thank you for your purchase!</p>
                <p>If you have any questions, please contact us at info@b4uesports.com or WhatsApp: +97517875099.</p>
                <br>
                <p>Best regards,<br>B4U Esports Team</p>
            </div>
        `
    };
    
    // Email to developer
    const devMailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: 'info@b4uesports.com',
        subject: `New Payment ${status === 'approval' ? 'Approval' : 'Completion'} - B4U Esports`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3B1E5E;">New Payment Notification</h2>
                <p>A new payment has been ${status === 'approval' ? 'approved' : 'completed'} on B4U Esports.</p>
                <p><strong>Product:</strong> ${product}</p>
                <p><strong>Amount:</strong> ${amount} π</p>
                <p><strong>User:</strong> ${piUsername} (${userEmail})</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
                ${txid ? `<p><strong>Transaction ID:</strong> ${txid}</p>` : ''}
                <p><strong>User Wallet:</strong> ${user.walletAddress}</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <br>
                <p>This is an automated notification from B4U Esports.</p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(userMailOptions);
        console.log('User confirmation email sent');
        
        await transporter.sendMail(devMailOptions);
        console.log('Developer notification email sent');
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send confirmation emails');
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
