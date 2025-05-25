// For TESTNET (Sandbox Mode) - Use any dummy txid
const completeResponse = await axios.post(
  `https://api.minepi.com/sandbox/v2/payments/${paymentId}/complete`,
  { txid: "test_txid_123" }, // ← Any string works in sandbox
  {
    headers: {
      Authorization: `Key ${process.env.PI_SECRET_KEY}`,
    },
  }
);
