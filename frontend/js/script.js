// Backend API URL - Update this to your actual domain
const API_BASE_URL = 'https://b4-u-esports.vercel.app/api';

// Pi Network SDK configuration - TESTNET
const PI_CONFIG = {
    version: "2.0", 
    sandbox: true, // TRUE for Testnet
    network: "testnet" // TESTNET for testing
};

// Global variables
let currentPayment = {
    product: '',
    amount: 0,
    memo: '',
    metadata: {},
    type: ''
};

let currentUser = null;
let isPiBrowser = false;
let piInitialized = false;

// Package data
const pubgPackages = [
    { uc: 60, price: 0.1, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 325, price: 0.5, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 660, price: 1, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 1800, price: 2, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' },
    { uc: 3850, price: 4, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png' }
];

const mlbbPackages = [
    { dias: 55, price: 0.1, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 275, price: 0.5, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 565, price: 1, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 1155, price: 2, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
    { dias: 1765, price: 3, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    setupEventListeners();
    createSnowDrizzle();
});

// Initialize the application
function initializeApp() {
    console.log('Initializing app...');
    
    // Check if we're in Pi Browser
    isPiBrowser = window.location.hostname === 'app-cdn.minepi.com' || 
                  navigator.userAgent.includes('PiBrowser') ||
                  window.location.protocol === 'pi:';
    
    console.log('Pi Browser detected:', isPiBrowser);
    console.log('User Agent:', navigator.userAgent);
    console.log('Hostname:', window.location.hostname);
    console.log('Protocol:', window.location.protocol);
    
    const authBtn = document.getElementById('pi-auth-btn');
    
    if (!isPiBrowser) {
        console.log('Not in Pi Browser, showing warning but allowing testing');
        if (authBtn) {
            authBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Use Pi Browser for real Pi';
            authBtn.style.background = 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)';
            // Still allow clicking for testing purposes
            authBtn.disabled = false;
        }
        
        // Show test mode notification
        showTestModeNotification();
        return;
    }
    
    // Enable the button for manual click
    if (authBtn) {
        authBtn.disabled = false;
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In with Pi Network';
        console.log('Pi Browser detected, sign-in button enabled');
    }
    
    // Initialize Pi SDK but don't auto-authenticate
    initializePiSDK();
}

// Show test mode notification
function showTestModeNotification() {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '70px';
    notification.style.right = '20px';
    notification.style.background = 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)';
    notification.style.color = 'white';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    notification.innerHTML = '<i class="fas fa-flask"></i> TESTNET MODE - Using Test Pi';
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize Pi SDK separately
function initializePiSDK() {
    console.log('Initializing Pi SDK for Testnet...');
    
    Pi.init(PI_CONFIG).then(() => {
        console.log("Pi SDK initialized successfully for Testnet");
        piInitialized = true;
        
        // Check if user was previously authenticated
        const savedUser = localStorage.getItem('pi_user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                // Show option to continue with saved user
                showContinueWithSavedUser(user);
            } catch (e) {
                console.error('Error parsing saved user:', e);
                localStorage.removeItem('pi_user');
            }
        }
    }).catch(error => {
        console.error("Error initializing Pi SDK:", error);
        const authBtn = document.getElementById('pi-auth-btn');
        if (authBtn) {
            authBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Pi SDK Error - Refresh Page';
            authBtn.disabled = true;
        }
    });
}

// Show continue with saved user option
function showContinueWithSavedUser(user) {
    const authBtn = document.getElementById('pi-auth-btn');
    if (!authBtn) return;
    
    authBtn.innerHTML = `
        <div style="text-align: center;">
            <div>Continue as ${user.username}?</div>
            <div style="display: flex; gap: 10px; margin-top: 5px;">
                <button onclick="continueWithSavedUser()" style="flex: 1; padding: 5px; background: #14F195; border: none; border-radius: 4px; color: black;">Yes</button>
                <button onclick="signInWithNewAccount()" style="flex: 1; padding: 5px; background: #ff6b6b; border: none; border-radius: 4px; color: white;">No</button>
            </div>
        </div>
    `;
}

// Continue with saved user
function continueWithSavedUser() {
    const savedUser = localStorage.getItem('pi_user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        currentUser = user;
        handleSuccessfulAuth(user);
    }
}

// Sign in with new account
function signInWithNewAccount() {
    localStorage.removeItem('pi_user');
    const authBtn = document.getElementById('pi-auth-btn');
    if (authBtn) {
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In with Pi Network';
        authBtn.onclick = () => authenticatePiUser();
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('overlay');
    const authBtn = document.getElementById('pi-auth-btn');
    const walletBtn = document.getElementById('pi-wallet-btn');
    const shareBtn = document.getElementById('pi-share-btn');
    const adBtn = document.getElementById('pi-ad-btn');
    const payBtn = document.getElementById('piPayBtn');

    // Hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', toggleSidebar);
    }

    // Overlay click
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Pi actions buttons
    if (authBtn) {
        console.log('Setting up auth button listener');
        // Remove any existing listeners first
        authBtn.onclick = null;
        authBtn.addEventListener('click', handleAuthButtonClick);
    }

    if (walletBtn) {
        walletBtn.addEventListener('click', showWalletAddress);
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', openShareDialog);
    }

    if (adBtn) {
        adBtn.addEventListener('click', showRewardedAd);
    }

    if (payBtn) {
        payBtn.addEventListener('click', processPiPayment);
    }

    // Navigation links
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
                closeSidebar();
            }
        });
    });

    // External links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (link.hostname !== window.location.hostname) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    console.log('Event listeners setup complete');
}

// Handle auth button click
function handleAuthButtonClick() {
    console.log('Auth button clicked');
    
    if (!isPiBrowser) {
        // Simulate test authentication for non-Pi Browser
        simulateTestAuthentication();
        return;
    }
    
    if (!piInitialized) {
        console.log('Pi SDK not initialized yet');
        alert('Pi SDK is still initializing. Please wait a moment and try again.');
        return;
    }
    
    const savedUser = localStorage.getItem('pi_user');
    if (savedUser) {
        // User has saved session, ask if they want to continue
        try {
            const user = JSON.parse(savedUser);
            showContinueWithSavedUser(user);
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('pi_user');
            authenticatePiUser();
        }
    } else {
        // No saved session, start new authentication
        authenticatePiUser();
    }
}

// Simulate test authentication for non-Pi Browser
function simulateTestAuthentication() {
    const authBtn = document.getElementById('pi-auth-btn');
    if (!authBtn) return;
    
    authBtn.disabled = true;
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulating Sign In...';
    
    // Simulate authentication delay
    setTimeout(() => {
        const testUser = {
            username: 'testuser',
            uid: 'test_uid_12345',
            walletAddress: 'test_wallet_address'
        };
        
        currentUser = testUser;
        localStorage.setItem('pi_user', JSON.stringify(testUser));
        
        handleSuccessfulAuth(testUser);
        
        // Show test mode warning
        alert('TEST MODE: You are using simulated Pi authentication. Use Pi Browser for real Pi transactions.');
    }, 1500);
}

// Sidebar functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const hamburger = document.getElementById('hamburger');
    
    if (sidebar && overlay && hamburger) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        hamburger.innerHTML = sidebar.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const hamburger = document.getElementById('hamburger');
    
    if (sidebar && overlay && hamburger) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

function showDashboard() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    closeSidebar();
}

// Pi Authentication
async function authenticatePiUser(attempt = 1, maxAttempts = 3) {
    console.log('Starting Pi authentication...');
    const authBtn = document.getElementById('pi-auth-btn');
    if (!authBtn) return;
    
    authBtn.disabled = true;
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    const scopes = ['username', 'payments', 'wallet_address'];
    
    try {
        console.log('Calling Pi.authenticate...');
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        console.log("Pi user authenticated:", authResult);
        currentUser = authResult.user;
        
        // Store user data in localStorage
        localStorage.setItem('pi_user', JSON.stringify(authResult.user));
        
        handleSuccessfulAuth(authResult);
    } catch (error) {
        console.error(`Authentication attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
            console.log(`Retrying authentication (attempt ${attempt + 1}/${maxAttempts})...`);
            setTimeout(() => authenticatePiUser(attempt + 1, maxAttempts), 2000);
        } else {
            let errorMessage = "Authentication failed. Please try again.";
            
            if (error.message && error.message.includes('not authenticated')) {
                errorMessage = "Please complete authentication in the Pi Browser.";
            }
            
            authBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
            authBtn.disabled = false;
            
            // Add retry button
            setTimeout(() => {
                authBtn.innerHTML = '<i class="fas fa-redo"></i> Retry Authentication';
                authBtn.disabled = false;
                authBtn.onclick = () => authenticatePiUser();
            }, 3000);
        }
    }
}

function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
    return Promise.resolve();
}

function handleSuccessfulAuth(authResult) {
    console.log('Handling successful authentication');
    const authBtn = document.getElementById('pi-auth-btn');
    if (!authBtn) return;
    
    authBtn.innerHTML = `<i class="fas fa-check-circle"></i> Signed in as ${authResult.username}`;
    authBtn.disabled = true;
    
    const piActions = document.getElementById('pi-actions');
    if (piActions) {
        piActions.style.display = 'flex';
    }
    
    const payBtn = document.getElementById('piPayBtn');
    if (payBtn) {
        payBtn.disabled = false;
    }
    
    if (authResult.username) {
        const piUsername = document.getElementById('piUsername');
        if (piUsername) {
            piUsername.value = authResult.username;
            piUsername.setAttribute('readonly', true);
        }
    }
    
    console.log('Authentication successful, user:', authResult.username);
    
    // Show testnet notification if in testnet
    if (PI_CONFIG.sandbox) {
        showTestModeNotification();
    }
}

// Pi Actions
function showWalletAddress() {
    if (!currentUser) {
        alert("Please authenticate first");
        return;
    }
    const walletAddress = currentUser.walletAddress || "Not available";
    alert(`Your Pi Wallet Address:\n${walletAddress}\n\nNetwork: ${PI_CONFIG.network.toUpperCase()}`);
}

function openShareDialog() {
    if (!currentUser) {
        alert("Please authenticate first");
        return;
    }
    const title = "B4U Esports";
    const message = "Check out B4U Esports - The ultimate gaming marketplace with Pi Network integration!";
    if (isPiBrowser && piInitialized) {
        Pi.share(title, message);
    } else {
        alert("Sharing is only available in Pi Browser");
    }
}

function showRewardedAd() {
    if (!currentUser) {
        alert("Please authenticate first");
        return;
    }
    if (isPiBrowser && piInitialized) {
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
    } else {
        alert("Ads are only available in Pi Browser");
    }
}

// Modal Functions
function openTokenSelectionModal() {
    if (!currentUser) {
        alert("Please sign in with Pi Network first.");
        return;
    }
    const modal = document.getElementById('tokenSelectionModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeTokenSelectionModal() {
    const modal = document.getElementById('tokenSelectionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openPackageModal(type) {
    if (!currentUser) {
        alert("Please sign in with Pi Network first.");
        return;
    }
    
    const packageModal = document.getElementById('packageModal');
    const packageList = document.getElementById('packageList');
    const packageModalTitle = document.getElementById('packageModalTitle');
    
    if (!packageModal || !packageList || !packageModalTitle) return;
    
    packageList.innerHTML = '';
    let packages = type === 'pubg' ? pubgPackages : mlbbPackages;
    packageModalTitle.textContent = type === 'pubg' ? 'Select PUBG Mobile UC Package' : 'Select MLBB Diamonds Package';
    
    packages.forEach(pkg => {
        const packageDiv = document.createElement('div');
        packageDiv.className = 'package';
        packageDiv.innerHTML = `
            <img src="${pkg.img}" alt="${type === 'pubg' ? pkg.uc + ' UC' : pkg.dias + ' DIAS'}" style="width: 100%; height: 100px; object-fit: contain;">
            <div class="package-title">${type === 'pubg' ? pkg.uc + ' UC' : pkg.dias + ' DIAS'}</div>
            <div class="package-price">${pkg.price} Test π</div>
            <button class="package-buy-btn" onclick="openPaymentModal('${type === 'pubg' ? pkg.uc + ' UC' : pkg.dias + ' DIAS'}', ${pkg.price}, '${type}', ${type === 'pubg' ? pkg.uc : pkg.dias}); closePackageModal()">
                <i class="fas fa-coins"></i> Buy Now (Testnet)
            </button>
        `;
        packageList.appendChild(packageDiv);
    });
    
    packageModal.style.display = 'flex';
    closeTokenSelectionModal();
}

function closePackageModal() {
    const modal = document.getElementById('packageModal');
    if (modal) {
        modal.style.display = 'none';
    }
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
    
    const productName = document.getElementById('productName');
    const piAmount = document.getElementById('piAmount');
    
    if (productName) productName.value = product;
    if (piAmount) piAmount.value = amount;
    
    const urlGroup = document.getElementById('urlGroup');
    const pubgIdGroup = document.getElementById('pubgIdGroup');
    const mlbbUserIdGroup = document.getElementById('mlbbUserIdGroup');
    const mlbbZoneIdGroup = document.getElementById('mlbbZoneIdGroup');
    
    if (urlGroup) urlGroup.style.display = type === 'social' ? 'block' : 'none';
    if (pubgIdGroup) pubgIdGroup.style.display = type === 'pubg' ? 'block' : 'none';
    if (mlbbUserIdGroup) mlbbUserIdGroup.style.display = type === 'mlbb' ? 'block' : 'none';
    if (mlbbZoneIdGroup) mlbbZoneIdGroup.style.display = type === 'mlbb' ? 'block' : 'none';
    
    const userEmail = document.getElementById('userEmail');
    const socialUrl = document.getElementById('socialUrl');
    const pubgId = document.getElementById('pubgId');
    const mlbbUserId = document.getElementById('mlbbUserId');
    const mlbbZoneId = document.getElementById('mlbbZoneId');
    const paymentStatus = document.getElementById('paymentStatus');
    
    if (userEmail) userEmail.value = '';
    if (socialUrl) socialUrl.value = '';
    if (pubgId) pubgId.value = '';
    if (mlbbUserId) mlbbUserId.value = '';
    if (mlbbZoneId) mlbbZoneId.value = '';
    if (paymentStatus) paymentStatus.style.display = 'none';
    
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.style.display = 'flex';
    }
    
    // Update modal title for testnet
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = 'Payment (Testnet) <i class="fas fa-flask"></i>';
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Payment Processing
async function processPiPayment() {
    if (!currentUser) {
        alert("Please authenticate with Pi Network first");
        return;
    }

    const piAmount = parseFloat(document.getElementById('piAmount').value);
    if (!piAmount || piAmount < 0.01) {
        showPaymentError("Please enter a valid PI amount (minimum 0.01)");
        return;
    }

    const userEmail = document.getElementById('userEmail').value;
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        showPaymentError("Please enter a valid email address");
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
            timestamp: new Date().toISOString(),
            network: PI_CONFIG.network // Include network info
        }
    };

    if (currentPayment.type === 'social') {
        const socialUrl = document.getElementById('socialUrl').value;
        if (!socialUrl || !/^(https?:\/\/)/.test(socialUrl)) {
            showPaymentError("Please enter a valid social media URL");
            return;
        }
        paymentData.metadata.socialUrl = socialUrl;
    } else if (currentPayment.type === 'pubg') {
        const pubgId = document.getElementById('pubgId').value;
        if (!pubgId || !/^\d+$/.test(pubgId)) {
            showPaymentError("Please enter a valid PUBG Mobile Player ID");
            return;
        }
        paymentData.metadata.pubgId = pubgId;
        paymentData.metadata.ucAmount = currentPayment.quantity;
    } else if (currentPayment.type === 'mlbb') {
        const mlbbUserId = document.getElementById('mlbbUserId').value;
        const mlbbZoneId = document.getElementById('mlbbZoneId').value;
        if (!mlbbUserId || !/^\d+$/.test(mlbbUserId) || !mlbbZoneId || !/^\d+$/.test(mlbbZoneId)) {
            showPaymentError("Please enter valid MLBB User ID and Zone ID");
            return;
        }
        paymentData.metadata.mlbbUserId = mlbbUserId;
        paymentData.metadata.mlbbZoneId = mlbbZoneId;
        paymentData.metadata.diasAmount = currentPayment.quantity;
    }

    // If not in Pi Browser, simulate payment
    if (!isPiBrowser || !piInitialized) {
        simulateTestPayment(paymentData);
        return;
    }

    const paymentCallbacks = {
        onReadyForServerApproval: async function(paymentId) {
            showPaymentStatus("Processing payment... Awaiting server approval.", false);
            
            try {
                // Send payment data to backend for approval
                const response = await fetch(`${API_BASE_URL}/payments/approve`, {
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
                    showPaymentStatus("Payment approved by server. Completing transaction...", false);
                } else {
                    throw new Error(result.error || "Server approval failed");
                }
            } catch (error) {
                console.error("Payment approval error:", error);
                showPaymentError("Payment approval failed: " + error.message);
            }
        },
        onReadyForServerCompletion: async function(paymentId, txid) {
            showPaymentStatus("Completing payment...", false);

            try {
                // Send completion data to backend
                const response = await fetch(`${API_BASE_URL}/payments/complete`, {
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
                    showPaymentSuccess("Payment successful! Please send the transaction screenshot to info@b4uesports.com or WhatsApp: +97517875099.");
                    setTimeout(closePaymentModal, 5000);
                } else {
                    throw new Error(result.error || "Server completion failed");
                }
            } catch (error) {
                console.error("Payment completion error:", error);
                showPaymentError("Payment completion failed: " + error.message);
            }
        },
        onCancel: function(paymentId) {
            console.log("Payment cancelled with paymentId:", paymentId);
            showPaymentError("Payment cancelled. Did you cancel the payment? Please try again.");
        },
        onError: function(error, payment) {
            console.error("Payment error:", error, payment);
            showPaymentError("Payment error: " + error.message);
        }
    };

    try {
        Pi.createPayment(paymentData, paymentCallbacks);
        showPaymentStatus("Initiating payment... Please approve the transaction in the Pi Browser.", false);
    } catch (error) {
        console.error("Payment creation error:", error);
        showPaymentError("Payment creation failed: " + error.message);
    }
        }

// Simulate test payment for non-Pi Browser
function simulateTestPayment(paymentData) {
    showPaymentStatus("Simulating test payment...", false);
    
    setTimeout(() => {
        showPaymentSuccess("TEST PAYMENT: Simulation complete! This was a test transaction using Testnet π.");
        
        // Simulate email sending
        setTimeout(() => {
            alert("TEST: Email confirmation would be sent to " + paymentData.metadata.userEmail);
        }, 1000);
    }, 2000);
}

// Utility Functions
function showPaymentStatus(message, isError = false) {
    const paymentStatus = document.getElementById('paymentStatus');
    if (!paymentStatus) return;
    
    paymentStatus.textContent = message;
    paymentStatus.className = isError ? "payment-status payment-error" : "payment-status";
    paymentStatus.style.display = "block";
}

function showPaymentError(message) {
    showPaymentStatus(message, true);
}

function showPaymentSuccess(message) {
    const paymentStatus = document.getElementById('paymentStatus');
    if (!paymentStatus) return;
    
    paymentStatus.textContent = message;
    paymentStatus.className = "payment-status payment-success";
    paymentStatus.style.display = "block";
}

function createSnowDrizzle() {
    const container = document.querySelector('.snow');
    if (!container) return;
    
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

// Make functions globally available for HTML onclick attributes
window.openTokenSelectionModal = openTokenSelectionModal;
window.closeTokenSelectionModal = closeTokenSelectionModal;
window.openPackageModal = openPackageModal;
window.closePackageModal = closePackageModal;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.showDashboard = showDashboard;
window.continueWithSavedUser = continueWithSavedUser;
window.signInWithNewAccount = signInWithNewAccount;
