// Initialize Pi Network SDK
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in Pi Browser
    const isPiBrowser = window.location.hostname === 'app-cdn.minepi.com' || 
                        navigator.userAgent.includes('PiBrowser');
    
    if (!isPiBrowser) {
        document.getElementById('pi-auth-btn').innerHTML = 
            '<i class="fas fa-exclamation-triangle"></i> Please use Pi Browser to sign in';
        document.getElementById('pi-auth-btn').disabled = true;
        return;
    }
    
    Pi.init({ 
        version: "2.0",
        sandbox: true, // Set to false for production
        network: "testnet" // Change to "mainnet" for production
    }).then(() => {
        console.log("Pi SDK initialized successfully");
        setupPiButtons();
    }).catch(error => {
        console.error("Error initializing Pi SDK:", error);
        alert("Failed to initialize Pi Network. Please ensure you're using the Pi Browser and try again.");
    });
});

let currentPayment = {
    product: '',
    amount: 0,
    memo: '',
    metadata: {},
    type: ''
};

let currentUser = null;

const pubgPackages = [
    { uc: 60, price: 2, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 325, price: 8, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 660, price: 15, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 1800, price: 25, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 3850, price: 50, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 8100, price: 92, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 16200, price: 185, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 24300, price: 275, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 32400, price: 365, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 45000, price: 455, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' }
];

const mlbbPackages = [
    { dias: 55, price: 2, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 275, price: 8, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 565, price: 12, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 1155, price: 25, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 1765, price: 35, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 2975, price: 55, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 6000, price: 105, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 12000, price: 205, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' }
];

function setupPiButtons() {
    const authBtn = document.getElementById('pi-auth-btn');
    const walletBtn = document.getElementById('pi-wallet-btn');
    const shareBtn = document.getElementById('pi-share-btn');
    const adBtn = document.getElementById('pi-ad-btn');
    const payBtn = document.getElementById('piPayBtn');

    if (authBtn) authBtn.addEventListener('click', authenticatePiUser);
    if (walletBtn) walletBtn.addEventListener('click', showWalletAddress);
    if (shareBtn) shareBtn.addEventListener('click', openShareDialog);
    if (adBtn) adBtn.addEventListener('click', showRewardedAd);
    if (payBtn) payBtn.addEventListener('click', processPiPayment);
}

const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

hamburger.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.innerHTML = sidebar.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

overlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
});

function showDashboard() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    }
});

function createSnowDrizzle() {
    const container = document.querySelector('.snow');
    const snowCount = window.innerWidth < 768 ? 30 : 50;
    
    for (let i = 0; i < snowCount; i++) {
        const snow = document.createElement('div');
        snow.style.position = 'absolute';
        snow.style.width = Math.random() * 3 + 2 + 'px';
        snow.style.height = snow.style.width;
        snow.style.backgroundColor = 'rgba(255,255,255,' + (Math.random() * 0.7 + 0.3) + ')';
        snow.style.borderRadius = '50%';
        snow.style.top = '-10px';
        snow.style.left = Math.random() * 100 + 'vw';
        snow.style.opacity = Math.random() * 0.5 + 0.5;
        snow.style.animation = `fall ${Math.random() * 5 + 5}s linear ${Math.random() * 5}s infinite`;
        
        const keyframes = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) translateX(${Math.random() * 100 - 50}px);
                }
            }
        `;
        
        const style = document.createElement('style');
        style.innerHTML = keyframes;
        document.head.appendChild(style);
        
        container.appendChild(snow);
    }
}

async function authenticatePiUser(attempt = 1, maxAttempts = 3) {
    const authBtn = document.getElementById('pi-auth-btn');
    authBtn.disabled = true;
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    const scopes = ['username', 'payments', 'wallet_address'];
    
    try {
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        console.log("Pi user authenticated:", authResult);
        currentUser = authResult.user;
        handleSuccessfulAuth(authResult);
    } catch (error) {
        console.error(`Authentication attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
            console.log(`Retrying authentication (attempt ${attempt + 1}/${maxAttempts})...`);
            setTimeout(() => authenticatePiUser(attempt + 1, maxAttempts), 2000);
        } else {
            alert("Authentication failed after multiple attempts. Please ensure you're using the Pi Browser and try again. Error: " + (error.message || "Unknown error."));
            authBtn.disabled = false;
            authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In with Pi Network';
        }
    }
}

function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
    // Implement logic to handle incomplete payments if needed
    return Promise.resolve();
}

function handleSuccessfulAuth(authResult) {
    const authBtn = document.getElementById('pi-auth-btn');
    authBtn.innerHTML = `<i class="fas fa-check-circle"></i> Signed in as ${authResult.user.username}`;
    authBtn.disabled = true;
    
    document.getElementById('pi-actions').style.display = 'flex';
    document.getElementById('piPayBtn').disabled = false;
    
    if (authResult.user.username) {
        document.getElementById('piUsername').value = authResult.user.username;
        document.getElementById('piUsername').setAttribute('readonly', true);
    }
}

function showWalletAddress() {
    if (!currentUser) {
        alert("Please authenticate first");
        return;
    }
    const walletAddress = currentUser.walletAddress || "GCJZEOVAODSADUFWNEYFBYFASNUFASPZOLR53CIU54SQZIJT6WF62SPE";
    alert(`Your Pi Wallet Address:\n${walletAddress}`);
}

function openShareDialog() {
    const title = "B4U Esports";
    const message = "Check out B4U Esports - The ultimate gaming marketplace with Pi Network integration!";
    Pi.share(title, message);
}

function showRewardedAd() {
    Pi.Ads.showAd("rewarded")
        .then(response => {
            console.log("Ad response:", response);
            if (response.result === "AD_REWARDED") {
                alert("Thanks for watching the ad! You've earned a reward.");
            } else {
                alert("Ad completed without reward");
            }
        })
        .catch(error => {
            console.error("Ad error:", error);
            alert("Failed to show ad: " + error.message);
        });
}

function openTokenSelectionModal() {
    document.getElementById('tokenSelectionModal').style.display = 'flex';
}

function closeTokenSelectionModal() {
    document.getElementById('tokenSelectionModal').style.display = 'none';
}

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
            <div class="package-price">${pkg.price} PI</div>
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

function openPaymentModal(product, amount, type, quantity = null) {
    if (!currentUser) {
        alert("Please sign in with Pi Network first.");
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
}

async function processPiPayment() {
    if (!currentUser) {
        alert("Please authenticate with Pi Network first");
        return;
    }

    const piAmount = parseFloat(document.getElementById('piAmount').value);
    if (!piAmount || piAmount < 0.01) {
        document.getElementById('paymentStatus').textContent = "Please enter a valid PI amount (minimum 0.01)";
        document.getElementById('paymentStatus').className = "payment-status payment-error";
        document.getElementById('paymentStatus').style.display = "block";
        return;
    }

    const userEmail = document.getElementById('userEmail').value;
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
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
        if (!socialUrl || !/^(https?:\/\/)/.test(socialUrl)) {
            document.getElementById('paymentStatus').textContent = "Please enter a valid social media URL";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
            return;
        }
        paymentData.metadata.socialUrl = socialUrl;
    } else if (currentPayment.type === 'pubg') {
        const pubgId = document.getElementById('pubgId').value;
        if (!pubgId || !/^\d+$/.test(pubgId)) {
            document.getElementById('paymentStatus').textContent = "Please enter a valid PUBG Mobile Player ID";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
            return;
        }
        paymentData.metadata.pubgId = pubgId;
        paymentData.metadata.ucAmount = currentPayment.quantity;
    } else if (currentPayment.type === 'mlbb') {
        const mlbbUserId = document.getElementById('mlbbUserId').value;
        const mlbbZoneId = document.getElementById('mlbbZoneId').value;
        if (!mlbbUserId || !/^\d+$/.test(mlbbUserId) || !mlbbZoneId || !/^\d+$/.test(mlbbZoneId)) {
            document.getElementById('paymentStatus').textContent = "Please enter valid MLBB User ID and Zone ID";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
            return;
        }
        paymentData.metadata.mlbbUserId = mlbbUserId;
        paymentData.metadata.mlbbZoneId = mlbbZoneId;
        paymentData.metadata.diasAmount = currentPayment.quantity;
    }

    const paymentCallbacks = {
        onReadyForServerApproval: async function(paymentId) {
            console.log("Ready for server approval with paymentId:", paymentId);
            document.getElementById('paymentStatus').textContent = "Processing payment... Awaiting server approval.";
            document.getElementById('paymentStatus').className = "payment-status";
            document.getElementById('paymentStatus').style.display = "block";

            try {
                // Send payment data to backend for approval and email notifications
                const response = await fetch('http://localhost:3000/api/payments/approve', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentId,
                        paymentData,
                        user: currentUser
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    // Approve the payment
                    await Pi.approvePayment(paymentId);
                    console.log("Payment approved by server");
                    document.getElementById('paymentStatus').textContent = "Payment approved by server. Completing transaction...";
                } else {
                    throw new Error(result.error || "Server approval failed");
                }
            } catch (error) {
                console.error("Payment approval error:", error);
                document.getElementById('paymentStatus').textContent = "Payment approval failed: " + error.message;
                document.getElementById('paymentStatus').className = "payment-status payment-error";
                document.getElementById('paymentStatus').style.display = "block";
            }
        },
        onReadyForServerCompletion: async function(paymentId, txid) {
            console.log("Ready for server completion with paymentId and txid:", paymentId, txid);
            document.getElementById('paymentStatus').textContent = "Completing payment...";

            try {
                // Send completion data to backend
                const response = await fetch('http://localhost:3000/api/payments/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentId,
                        txid,
                        paymentData,
                        user: currentUser
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    // Complete the payment
                    await Pi.completePayment(paymentId, txid);
                    console.log("Payment completed successfully");
                    document.getElementById('paymentStatus').textContent = "Payment successful! Please send the transaction screenshot to info@b4uesports.com or WhatsApp: +97517875099.";
                    document.getElementById('paymentStatus').className = "payment-status payment-success";
                    document.getElementById('paymentStatus').style.display = "block";
                    setTimeout(closePaymentModal, 5000);
                } else {
                    throw new Error(result.error || "Server completion failed");
                }
            } catch (error) {
                console.error("Payment completion error:", error);
                document.getElementById('paymentStatus').textContent = "Payment completion failed: " + error.message;
                document.getElementById('paymentStatus').className = "payment-status payment-error";
                document.getElementById('paymentStatus').style.display = "block";
            }
        },
        onReadyForServerCompletion: async function(paymentId, txid) {
            console.log("Ready for server completion with paymentId and txid:", paymentId, txid);
            document.getElementById('paymentStatus').textContent = "Completing payment...";

            try {
                // Send completion data to backend
                const response = await fetch('http://localhost:3000/api/payments/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentId,
                        txid,
                        paymentData,
                        user: currentUser
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    // Complete the payment
                    await Pi.completePayment(paymentId, txid);
                    console.log("Payment completed successfully");
                    document.getElementById('paymentStatus').textContent = "Payment successful! Please send the transaction screenshot to info@b4uesports.com or WhatsApp: +97517875099.";
                    document.getElementById('paymentStatus').className = "payment-status payment-success";
                    document.getElementById('paymentStatus').style.display = "block";
                    setTimeout(closePaymentModal, 5000);
                } else {
                    throw new Error(result.error || "Server completion failed");
                }
            } catch (error) {
                console.error("Payment completion error:", error);
                document.getElementById('paymentStatus').textContent = "Payment completion failed: " + error.message;
                document.getElementById('paymentStatus').className = "payment-status payment-error";
                document.getElementById('paymentStatus').style.display = "block";
            }
        },
        onCancel: function(paymentId) {
            console.log("Payment cancelled with paymentId:", paymentId);
            document.getElementById('paymentStatus').textContent = "Payment cancelled. Did you cancel the payment? Please try again.";
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
        },
        onError: function(error, payment) {
            console.error("Payment error:", error, payment);
            document.getElementById('paymentStatus').textContent = "Payment error: " + error.message;
            document.getElementById('paymentStatus').className = "payment-status payment-error";
            document.getElementById('paymentStatus').style.display = "block";
        }
    };

    try {
        Pi.createPayment(paymentData, paymentCallbacks);
        document.getElementById('paymentStatus').textContent = "Initiating payment... Please approve the transaction in the Pi Browser.";
        document.getElementById('paymentStatus').className = "payment-status";
        document.getElementById('paymentStatus').style.display = "block";
    } catch (error) {
        console.error("Payment creation error:", error);
        document.getElementById('paymentStatus').textContent = "Payment creation failed: " + error.message;
        document.getElementById('paymentStatus').className = "payment-status payment-error";
        document.getElementById('paymentStatus').style.display = "block";
    }
}

window.addEventListener('load', createSnowDrizzle);
window.addEventListener('resize', function() {
    document.querySelectorAll('.snow div').forEach(el => el.remove());
    createSnowDrizzle();
});
