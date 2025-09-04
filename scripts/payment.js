// Token Selection Modal Functions
function openTokenSelectionModal() {
    if (!currentUser) {
        alert("Please sign in with Pi Network first");
        return;
    }
    document.getElementById('tokenSelectionModal').style.display = 'flex';
}

function closeTokenSelectionModal() {
    document.getElementById('tokenSelectionModal').style.display = 'none';
}

// Package Modal Functions
function openPackageModal(type) {
    const packageModal = document.getElementById('packageModal');
    const packageList = document.getElementById('packageList');
    const packageModalTitle = document.getElementById('packageModalTitle');
    
    packageList.innerHTML = '';
    let packages = type === 'pubg' ? pubgPackages : mlbbPackages;
    packageModalTitle.textContent = type === 'pubg' ? 'Select PUBG Mobile UC Package' : 'Select MLBB Diamonds Package';
    
    packages.forEach(pkg => {
        const packageDiv = document.createElement('div');
        packageDiv.className = 'package';
        packageDiv.innerHTML = `
            <img src="${pkg.img}" alt="${type === 'pubg' ? pkg.uc + ' UC' : pkg.dias + ' DIAS'}" style="width: 100%; height: 100px; object-fit: contain;">
            <div class="package-title">${type === 'pubg' ? pkg.uc + ' UC' : pkg.dias + ' DIAS'}</div>
            <div class="package-price">${pkg.price} π</div>
            <button class="package-buy-btn" onclick="openPaymentModal('${type === 'pubg' ? pkg.uc + ' UC' : pkg.dias + ' DIAS'}', ${pkg.price}, '${type}', ${type === 'pubg' ? pkg.uc : pkg.dias}); closePackageModal()">
                <i class="fas fa-coins"></i> Buy Now
            </button>
        `;
        packageList.appendChild(packageDiv);
    });
    
    packageModal.style.display = 'flex';
    closeTokenSelectionModal();
}

function closePackageModal() {
    document.getElementById('packageModal').style.display = 'none';
}

// Payment Modal Functions
function openPaymentModal(product, amount, type, quantity = null) {
    if (!currentUser) {
        alert("Please sign in with Pi Network first");
        return;
    }
    
    currentPayment.product = product;
    currentPayment.amount = amount;
    currentPayment.memo = `Payment for ${product}`;
    currentPayment.type = type;
    currentPayment.quantity = quantity;
    
    document.getElementById('productName').value = product;
    document.getElementById('piAmount').value = amount;
    
    document.getElementById('urlGroup').style.display = type === 'social' ? 'block' : 'none';
    document.getElementById('pubgIdGroup').style.display = type === 'pubg' ? 'block' : 'none';
    document.getElementById('mlbbUserIdGroup').style.display = type === 'mlbb' ? 'block' : 'none';
    document.getElementById('mlbbZoneIdGroup').style.display = type === 'mlbb' ? 'block' : 'none';
    
    document.getElementById('userEmail').value = '';
    document.getElementById('socialUrl').value = '';
    document.getElementById('pubgId').value = '';
    document.getElementById('mlbbUserId').value = '';
    document.getElementById('mlbbZoneId').value = '';
    document.getElementById('paymentStatus').style.display = 'none';
    
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    currentPayment.paymentId = null;
    currentPayment.txid = null;
}

// Process Pi Payment with Server-Side Approval and Completion
async function processPiPayment() {
    if (!currentUser) {
        alert("Please authenticate with Pi Network first");
        return;
    }

    const piAmount = parseFloat(document.getElementById('piAmount').value);
    if (!piAmount || piAmount < 0) {
        document.getElementById('paymentStatus').textContent = "Please enter a valid PI amount (minimum 0)";
        document.getElementById('paymentStatus').className = "payment-status payment-error";
        document.getElementById('paymentStatus').style.display = "block";
        return;
    }

    const userEmail = document.getElementById('userEmail').value;
    if (!userEmail) {
        document.getElementById('paymentStatus').textContent = "Please enter a valid email address";
        document.getElementById('paymentStatus').className = "payment-status payment-error";
        document.getElementById('paymentStatus').style.display = "block";
        return;
    }

    const paymentData = {
        amount: piAmount,
        memo: currentPayment.memo,
        metadata: {
            product: currentPayment.product,
            piUsername: document.getElementById('piUsername').value,
            userEmail: userEmail,
            type: currentPayment.type,
            timestamp: new Date().toISOString()
        }
    };

    if (currentPayment.type === 'social') {
        const socialUrl = document.getElementById('socialUrl').value;
        if (!socialUrl) {
            document.getElementById('paymentStatus').textContent = "Please enter a valid social media URL";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
            return;
        }
        paymentData.metadata.socialUrl = socialUrl;
    } else if (currentPayment.type === 'pubg') {
        const pubgId = document.getElementById('pubgId').value;
        if (!pubgId || isNaN(pubgId)) {
            document.getElementById('paymentStatus').textContent = "Please enter a valid numeric PUBG Mobile Player ID";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
            return;
        }
        paymentData.metadata.pubgId = parseInt(pubgId);
        paymentData.metadata.ucAmount = currentPayment.quantity;
    } else if (currentPayment.type === 'mlbb') {
        const mlbbUserId = document.getElementById('mlbbUserId').value;
        const mlbbZoneId = document.getElementById('mlbbZoneId').value;
        if (!mlbbUserId || isNaN(mlbbUserId) || !mlbbZoneId || isNaN(mlbbZoneId)) {
            document.getElementById('paymentStatus').textContent = "Please enter valid numeric MLBB User ID and Zone ID";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
            return;
        }
        paymentData.metadata.mlbbUserId = parseInt(mlbbUserId);
        paymentData.metadata.mlbbZoneId = parseInt(mlbbZoneId);
        paymentData.metadata.diasAmount = currentPayment.quantity;
    }

    const paymentCallbacks = {
        onReadyForServerApproval: async function(paymentId) {
            console.log("Ready for server approval with paymentId:", paymentId);
            currentPayment.paymentId = paymentId;
            document.getElementById('paymentStatus').textContent = "Waiting for server approval...";
            document.getElementById('paymentStatus').className = "payment-status";
            document.getElementById('paymentStatus').style.display = "block";

            try {
                // Simulate server approval for testnet
                setTimeout(() => {
                    console.log("Payment approved on testnet:", paymentId);
                    document.getElementById('paymentStatus').textContent = "Payment approved on testnet";
                }, 2000);
            } catch (error) {
                console.error("Server approval error:", error);
                document.getElementById('paymentStatus').textContent = "Server approval failed: " + error.message;
                document.getElementById('paymentStatus').className = "payment-status payment-error";
                document.getElementById('paymentStatus').style.display = "block";
            }
        },
        onReadyForServerCompletion: async function(paymentId, txid) {
            console.log("Ready for server completion with paymentId and txid:", paymentId, txid);
            currentPayment.txid = txid;
            document.getElementById('paymentStatus').textContent = "Completing payment...";

            try {
                // Simulate server completion for testnet
                setTimeout(() => {
                    console.log("Payment completed successfully on testnet:", paymentId, txid);
                    document.getElementById('paymentStatus').textContent = 
                        "Payment successful on testnet! This is a test transaction - no real Pi was deducted.";
                    document.getElementById('paymentStatus').className = "payment-status payment-success";
                    document.getElementById('paymentStatus').style.display = "block";
                    
                    setTimeout(closePaymentModal, 5000);
                }, 2000);
            } catch (error) {
                console.error("Payment completion error:", error);
                document.getElementById('paymentStatus').textContent = 
                    "Payment completion failed: " + error.message;
                document.getElementById('paymentStatus').className = "payment-status payment-error";
                document.getElementById('paymentStatus').style.display = "block";
            }
        },
        onCancel: function(paymentId) {
            console.log("Payment cancelled with paymentId:", paymentId);
            document.getElementById('paymentStatus').textContent = "Payment cancelled";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
            setTimeout(closePaymentModal, 3000);
        },
        onError: function(error, payment) {
            console.error("Payment error:", error, payment);
            document.getElementById('paymentStatus').textContent = "Error: " + error.message;
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
        }
    };

    try {
        await Pi.createPayment(paymentData, paymentCallbacks);
        console.log("Payment creation initiated");
        document.getElementById('paymentStatus').textContent = "Initiating payment...";
        document.getElementById('paymentStatus').className = "payment-status";
        document.getElementById('paymentStatus').style.display = "block";
    } catch (error) {
        console.error("Payment creation error:", error);
        document.getElementById('paymentStatus').textContent = "Payment creation failed: " + error.message;
        document.getElementById('paymentStatus').className = "payment-status payment-error";
        document.getElementById('paymentStatus').style.display = "block";
    }
}
