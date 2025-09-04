const processPiPayment = async () => {
  // ... existing validation code ...

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
        // First verify the payment
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentId,
            txid: txid
          })
        });
        
        if (!verifyResponse.ok) {
          throw new Error(`Payment verification failed with status ${verifyResponse.status}`);
        }
        
        const verifyResult = await verifyResponse.json();
        
        if (!verifyResult.verified) {
          throw new Error('Payment could not be verified on the blockchain');
        }
        
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
    // ... rest of the callbacks ...
  };

  // ... rest of the payment creation code ...
};
