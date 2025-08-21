// Email service configuration
// This is a mock implementation - replace with actual email service

const sendConfirmation = async (email, paymentData) => {
    try {
        // Mock email sending
        console.log(`=== EMAIL CONFIRMATION ===`);
        console.log(`To: ${email}`);
        console.log(`Subject: Payment Confirmation for ${paymentData.memo}`);
        console.log(`Body:`);
        console.log(`Thank you for your purchase!`);
        console.log(`Product: ${paymentData.metadata.product}`);
        console.log(`Amount: ${paymentData.amount} π`);
        console.log(`Transaction ID: ${paymentData.metadata.timestamp}`);
        console.log(`=======================`);
        
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Failed to send email' };
    }
};

const sendAdminNotification = async (paymentData) => {
    try {
        // Mock admin notification
        console.log(`=== ADMIN NOTIFICATION ===`);
        console.log(`New payment received:`);
        console.log(`Product: ${paymentData.metadata.product}`);
        console.log(`Amount: ${paymentData.amount} π`);
        console.log(`User: ${paymentData.metadata.piUsername}`);
        console.log(`Email: ${paymentData.metadata.userEmail}`);
        console.log(`========================`);
        
        return { success: true, message: 'Admin notification sent' };
    } catch (error) {
        console.error('Error sending admin notification:', error);
        return { success: false, error: 'Failed to send admin notification' };
    }
};

module.exports = {
    sendConfirmation,
    sendAdminNotification
};
