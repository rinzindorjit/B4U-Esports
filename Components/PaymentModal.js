import { useState } from 'react';

export default function PaymentModal({ payment, user, onClose }) {
  const [piAmount, setPiAmount] = useState(payment.amount);
  const [userEmail, setUserEmail] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [pubgId, setPubgId] = useState('');
  const [mlbbUserId, setMlbbUserId] = useState('');
  const [mlbbZoneId, setMlbbZoneId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState({ message: '', type: '' });

  const processPiPayment = async () => {
    if (!user) {
      setPaymentStatus({ message: "Please authenticate with Pi Network first", type: "error" });
      return;
    }

    if (!piAmount || piAmount < 0) {
      setPaymentStatus({ message: "Please enter a valid PI amount (minimum 0)", type: "error" });
      return;
    }

    if (!userEmail) {
      setPaymentStatus({ message: "Please enter a valid email address", type: "error" });
      return;
    }

    const paymentData = {
      amount: piAmount,
      memo: `Payment for ${payment.product}`,
      metadata: {
        product: payment.product,
        piUsername: user.username,
        userEmail: userEmail,
        type: payment.type,
        timestamp: new Date().toISOString()
      }
    };

    if (payment.type === 'social') {
      if (!socialUrl) {
        setPaymentStatus({ message: "Please enter a valid social media URL", type: "error" });
        return;
      }
      paymentData.metadata.socialUrl = socialUrl;
    } else if (payment.type === 'pubg') {
      if (!pubgId || isNaN(pubgId)) {
        setPaymentStatus({ message: "Please enter a valid numeric PUBG Mobile Player ID", type: "error" });
        return;
      }
      paymentData.metadata.pubgId = parseInt(pubgId);
      paymentData.metadata.ucAmount = payment.quantity;
    } else if (payment.type === 'mlbb') {
      const mlbbUserIdNum = parseInt(mlbbUserId);
      const mlbbZoneIdNum = parseInt(mlbbZoneId);
      if (isNaN(mlbbUserIdNum) || isNaN(mlbbZoneIdNum)) {
        setPaymentStatus({ message: "Please enter valid numeric MLBB User ID and Zone ID", type: "error" });
        return;
      }
      paymentData.metadata.mlbbUserId = mlbbUserIdNum;
      paymentData.metadata.mlbbZoneId = mlbbZoneIdNum;
      paymentData.metadata.diasAmount = payment.quantity;
    }

    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        console.log("Ready for server approval with paymentId:", paymentId);
        setPaymentStatus({ message: "Waiting for server approval...", type: "info" });

        try {
          // Call your backend API to approve the payment
          const response = await fetch('/api/approve-payment', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: paymentId,
              paymentData: paymentData
            })
          });
          
          if (!response.ok) {
            throw new Error(`Server approval failed with status ${response.status}`);
          }
          
          const result = await response.json();
          console.log("Payment approved:", result);
        } catch (error) {
          console.error("Server approval error:", error);
          setPaymentStatus({ message: "Server approval failed: " + error.message, type: "error" });
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("Ready for server completion with paymentId and txid:", paymentId, txid);
        setPaymentStatus({ message: "Completing payment...", type: "info" });

        try {
          // Call your backend API to complete the payment
          const response = await fetch('/api/complete-payment', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: paymentId,
              txid: txid,
              paymentData: paymentData
            })
          });
          
          if (!response.ok) {
            throw new Error(`Server completion failed with status ${response.status}`);
          }
          
          const result = await response.json();
          console.log("Payment completed successfully:", result);
          setPaymentStatus({ 
            message: "Payment successful! Please send the transaction screenshot to info@b4uesports.com or WhatsApp: +97517875099.", 
            type: "success" 
          });
          
          setTimeout(onClose, 5000);
        } catch (error) {
          console.error("Payment completion error:", error);
          setPaymentStatus({ message: "Payment completion failed: " + error.message, type: "error" });
        }
      },
      onCancel: (paymentId) => {
        console.log("Payment cancelled with paymentId:", paymentId);
        setPaymentStatus({ message: "Payment cancelled", type: "error" });
        setTimeout(onClose, 3000);
      },
      onError: (error, paymentInfo) => {
        console.error("Payment error:", error, paymentInfo);
        setPaymentStatus({ message: "Error: " + error.message, type: "error" });
      }
    };

    try {
      await window.Pi.createPayment(paymentData, paymentCallbacks);
      setPaymentStatus({ message: "Initiating payment...", type: "info" });
    } catch (error) {
      console.error("Payment creation error:", error);
      setPaymentStatus({ message: "Payment creation failed: " + error.message, type: "error" });
    }
  };

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-purple-900 bg-opacity-95 p-6 rounded-xl w-full max-w-md backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <span className="close-modal absolute top-4 right-4 text-white text-2xl cursor-pointer" onClick={onClose}>×</span>
        <h2 className="modal-title text-white text-xl font-bold mb-4 text-center">Payment</h2>
        
        <div className="payment-form flex flex-col gap-4">
          <div className="form-group">
            <label htmlFor="productName" className="text-white text-sm mb-1">Product:</label>
            <input 
              type="text" 
              id="productName" 
              value={payment.product} 
              readOnly 
              className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="piAmount" className="text-white text-sm mb-1">Amount (π):</label>
            <input 
              type="number" 
              id="piAmount" 
              value={piAmount}
              onChange={(e) => setPiAmount(parseFloat(e.target.value) || 0)}
              min="0" 
              step="0.01" 
              placeholder="Enter PI amount"
              className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="piUsername" className="text-white text-sm mb-1">Pi Username:</label>
            <input 
              type="text" 
              id="piUsername" 
              value={user?.username || ''} 
              readOnly 
              placeholder="Enter your Pi username"
              className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userEmail" className="text-white text-sm mb-1">Your Email:</label>
            <input 
              type="email" 
              id="userEmail" 
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email" 
              required
              className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
            />
          </div>
          
          {payment.type === 'social' && (
            <div className="form-group">
              <label htmlFor="socialUrl" className="text-white text-sm mb-1">Social Media URL:</label>
              <input 
                type="url" 
                id="socialUrl" 
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                placeholder="Enter your social media URL"
                className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
              />
            </div>
          )}
          
          {payment.type === 'pubg' && (
            <div className="form-group">
              <label htmlFor="pubgId" className="text-white text-sm mb-1">PUBG Mobile Player ID:</label>
              <input 
                type="number" 
                id="pubgId" 
                value={pubgId}
                onChange={(e) => setPubgId(e.target.value)}
                placeholder="Enter your PUBG Mobile Player ID"
                pattern="[0-9]*"
                className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
              />
            </div>
          )}
          
          {payment.type === 'mlbb' && (
            <>
              <div className="form-group">
                <label htmlFor="mlbbUserId" className="text-white text-sm mb-1">MLBB User ID:</label>
                <input 
                  type="number" 
                  id="mlbbUserId" 
                  value={mlbbUserId}
                  onChange={(e) => setMlbbUserId(e.target.value)}
                  placeholder="Enter your MLBB User ID"
                  pattern="[0-9]*"
                  className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
                />
              </div>
              <div className="form-group">
                <label htmlFor="mlbbZoneId" className="text-white text-sm mb-1">MLBB Zone ID:</label>
                <input 
                  type="number" 
                  id="mlbbZoneId" 
                  value={mlbbZoneId}
                  onChange={(e) => setMlbbZoneId(e.target.value)}
                  placeholder="Enter your MLBB Zone ID"
                  pattern="[0-9]*"
                  className="w-full p-3 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-10 text-white"
                />
              </div>
            </>
          )}
          
          <button 
            onClick={processPiPayment}
            disabled={!user}
            className="pi-pay-btn bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <i className="fas fa-coins"></i> Pay with Pi
          </button>
          
          {paymentStatus.message && (
            <div className={`payment-status p-3 rounded-lg text-center ${
              paymentStatus.type === 'success' ? 'bg-green-500 bg-opacity-50 border border-green-400' :
              paymentStatus.type === 'error' ? 'bg-red-500 bg-opacity-50 border border-red-400' :
              'bg-white bg-opacity-20'
            }`}>
              {paymentStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
