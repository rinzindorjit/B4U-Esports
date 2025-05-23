// frontend/src/app.js
const authButton = document.getElementById('auth-button');
const paymentButton = document.getElementById('payment-button');
const userInfo = document.getElementById('user-info');
const paymentStatus = document.getElementById('payment-status');

const scopes = ['payments', 'username'];

function onIncompletePaymentFound(payment) {
  const paymentId = payment.identifier;
  const txid = payment.transaction.txid;
  fetch('/api/payments/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, txid, debug: 'cancel' }),
  });
}

authButton.addEventListener('click', async () => {
  try {
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    userInfo.textContent = `Authenticated as ${auth.user.username}`;
    paymentButton.disabled = false;
    authButton.disabled = true;
  } catch (error) {
    console.error('Authentication error:', error);
    userInfo.textContent = 'Authentication failed';
  }
});

paymentButton.addEventListener('click', async () => {
  try {
    Pi.createPayment(
      {
        amount: 1,
        memo: 'Test payment',
        metadata: { orderId: 'TEST123' },
      },
      {
        onReadyForServerApproval: (paymentId) => {
          fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          paymentStatus.textContent = 'Payment approval requested';
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          paymentStatus.textContent = 'Payment completed';
        },
        onCancel: () => {
          paymentStatus.textContent = 'Payment cancelled';
        },
        onError: (error) => {
          console.error('Payment error:', error);
          paymentStatus.textContent = 'Payment failed';
        },
      }
    );
  } catch (error) {
    console.error('Payment error:', error);
    paymentStatus.textContent = 'Payment failed';
  }
});