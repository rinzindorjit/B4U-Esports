if (action === 'approve') {
  // Validate paymentId
  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  // Validate payment data
  if (!paymentData || !paymentData.amount || !paymentData.metadata || !paymentData.metadata.product) {
    return res.status(400).json({ error: 'Invalid payment data' });
  }

  // Validate amount is a positive number
  if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
    return res.status(400).json({ error: 'Invalid payment amount' });
  }

  // Make API call to approve payment
  const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200) {
    const errorData = await response.json();
    console.error('Approval error:', errorData);
    return res.status(response.status).json({ error: `Failed to approve payment: ${errorData.message || 'Unknown error'}` });
  }

  return res.status(200).json({ success: true, message: 'Payment approved' });
}
