// Backend API URL - Update this to your actual domain
const API_BASE_URL = 'https://b4-u-esports.vercel.app/api';

// Pi Network SDK configuration - TESTNET
const PI_CONFIG = {
    version: "2.0", 
    sandbox: false, // TRUE for Testnet
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
let authInProgress = false;

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
    
    // Enhanced Pi Browser detection
    isPiBrowser = detectPiBrowser();
    
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
            authBtn.disabled = false;
        }
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

// Enhanced Pi Browser detection
function detectPiBrowser() {
    return (
        window.location.hostname === 'app-cdn.minepi.com' || 
        navigator.userAgent.includes('PiBrowser') ||
        window.location.protocol === 'pi:' ||
        navigator.userAgent.includes('MinePi') ||
        document.referrer.includes('minepi.com')
    );
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
        authBtn.onclick = () => handleAuthButtonClick();
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
    
    if (authInProgress) {
        console.log('Authentication already in progress');
        return;
    }
    
    if (!isPiBrowser) {
        simulateTestAuthentication();
        return;
    }
    
    if (!piInitialized) {
        console.log('Pi SDK not initialized yet');
        showMessage('Pi SDK is still initializing. Please wait a moment and try again.', 'error');
        return;
    }
    
    const savedUser = localStorage.getItem('pi_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            showContinueWithSavedUser(user);
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('pi_user');
            authenticatePiUser();
        }
    } else {
        authenticatePiUser();
    }
}

// Simulate test authentication for non-Pi Browser
function simulateTestAuthentication() {
    const authBtn = document.getElementById('pi-auth-btn');
    if (!authBtn) return;
    
    authBtn.disabled = true;
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulating Sign In...';
    
    setTimeout(() => {
        const testUser = {
            username: 'testuser',
            uid: 'test_uid_12345',
            walletAddress: 'test_wallet_address'
        };
        
        currentUser = testUser;
        localStorage.setItem('pi_user', JSON.stringify(testUser));
        
        handleSuccessfulAuth(testUser);
        
        alert('TEST MODE: You are using simulated Pi authentication. Use Pi Browser for real Pi transactions.');
    }, 1500);
}

// Pi Authentication
async function authenticatePiUser(attempt = 1, maxAttempts = 3) {
    console.log('Starting Pi authentication...');
    
    if (authInProgress) {
        console.log('Authentication already in progress');
        return;
    }
    
    authInProgress = true;
    const authBtn = document.getElementById('pi-auth-btn');
    if (!authBtn) {
        authInProgress = false;
        return;
    }
    
    authBtn.disabled = true;
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening Pi Wallet...';

    const scopes = ['username', 'payments', 'wallet_address'];
    
    try {
        console.log('Calling Pi.authenticate with scopes:', scopes);
        
        // Show message that wallet will open
        showMessage('Opening Pi Wallet... Please unlock your wallet with passphrase, fingerprint, or face ID.', 'info');
        
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        console.log("Pi user authenticated:", authResult);
        
        if (authResult && authResult.user) {
            currentUser = authResult.user;
            localStorage.setItem('pi_user', JSON.stringify(authResult.user));
            handleSuccessfulAuth(authResult.user);
        } else {
            throw new Error('Authentication returned invalid user data');
        }
        
    } catch (error) {
        console.error(`Authentication attempt ${attempt} failed:`, error);
        
        if (attempt < maxAttempts) {
            console.log(`Retrying authentication (attempt ${attempt + 1}/${maxAttempts})...`);
            setTimeout(() => {
                authInProgress = false;
                authenticatePiUser(attempt + 1, maxAttempts);
            }, 2000);
        } else {
            let errorMessage = "Authentication failed. Please try again.";
            
            if (error.message && error.message.includes('not authenticated')) {
                errorMessage = "Please complete authentication in your Pi Wallet.";
            } else if (error.message && error.message.includes('user cancelled')) {
                errorMessage = "Authentication cancelled. Please try again.";
            }
            
            authBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
            authBtn.disabled = false;
            
            // Add retry button
            setTimeout(() => {
                authBtn.innerHTML = '<i class="fas fa-redo"></i> Retry Authentication';
                authBtn.disabled = false;
                authBtn.onclick = () => {
                    authInProgress = false;
                    authenticatePiUser();
                };
            }, 3000);
            
            showMessage(errorMessage, 'error');
        }
    } finally {
        authInProgress = false;
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
        
        // Add logout button
        const logoutBtn = document.getElementById('pi-logout-btn') || createLogoutButton();
        piActions.appendChild(logoutBtn);
    }
    
    const payBtn = document.getElementById('piPayBtn');
    if (payBtn) {
        payBtn.disabled = false;
    }
    
    // Auto-fill the Pi username in payment form
    if (authResult.username) {
        const piUsername = document.getElementById('piUsername');
        if (piUsername) {
            piUsername.value = authResult.username;
            piUsername.setAttribute('readonly', true);
        }
    }
    
    console.log('Authentication successful, user:', authResult.username);
    showMessage(`Welcome back, ${authResult.username}! You are connected to Pi Testnet.`, 'success');
    
    // Show testnet notification if in testnet
    if (PI_CONFIG.sandbox) {
        showTestModeNotification();
    }
}

// Create logout button
function createLogoutButton() {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'pi-logout-btn';
    logoutBtn.className = 'pi-action-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.onclick = logoutUser;
    return logoutBtn;
}

// Logout function
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('pi_user');
        
        const authBtn = document.getElementById('pi-auth-btn');
        if (authBtn) {
            authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In with Pi Network';
            authBtn.disabled = false;
        }
        
        const piActions = document.getElementById('pi-actions');
        if (piActions) {
            piActions.style.display = 'none';
        }
        
        const payBtn = document.getElementById('piPayBtn');
        if (payBtn) {
            payBtn.disabled = true;
        }
        
        // Clear Pi username field
        const piUsername = document.getElementById('piUsername');
        if (piUsername) {
            piUsername.value = '';
            piUsername.removeAttribute('readonly');
        }
        
        // Remove logout button
        const logoutBtn = document.getElementById('pi-logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
        
        showMessage('You have been logged out successfully.', 'success');
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.user-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `user-message user-message-${type}`;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '80px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.padding = '12px 20px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    messageDiv.style.maxWidth = '90%';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.fontWeight = '500';
    
    if (type === 'error') {
        messageDiv.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
        messageDiv.style.color = 'white';
    } else if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #14F195 0%, #10b981 100%)';
        messageDiv.style.color = 'black';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
        messageDiv.style.color = 'white';
    }
    
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
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

// Pi Actions
function showWalletAddress() {
    if (!currentUser) {
        showMessage("Please authenticate first", "error");
        return;
    }
    const walletAddress = currentUser.walletAddress || "Not available";
    alert(`Your Pi Wallet Address:\n${walletAddress}\n\nNetwork: ${PI_CONFIG.network.toUpperCase()}`);
    }

function openShareDialog() {
    if (!currentUser) {
        showMessage("Please authenticate first", "error");
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
        showMessage("Please authenticate first", "error");
        return;
    }
    if (isPiBrowser && piInitialized) {
        Pi.Ads.showAd("rewarded")
            .then(response => {
                console.log("Ad response:", response);
                if (response.result === "AD_REWARDED") {
                    showMessage("Thanks for watching the ad! You've earned a reward.", "success");
                } else {
                    showMessage("Ad completed without reward", "info");
                }
            })
            .catch(error => {
                console.error("Ad error:", error);
                showMessage("Failed to show ad: " + error.message, "error");
            });
    } else {
        showMessage("Ads are only available in Pi Browser", "error");
    }
}

// Modal Functions
function openTokenSelectionModal() {
    if (!currentUser) {
        showMessage("Please sign in with Pi Network first.", "error");
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
        showMessage("Please sign in with Pi Network first.", "error");
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
        showMessage("Please sign in with Pi Network first.", "error");
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
    
    // Set placeholder examples for numeric IDs
    if (pubgId) pubgId.placeholder = 'e.g., 5123456789 (Numeric only)';
    if (mlbbUserId) mlbbUserId.placeholder = 'e.g., 123456789 (Numeric only)';
    if (mlbbZoneId) mlbbZoneId.placeholder = 'e.g., 1234 (Numeric only)';
    
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
        showMessage("Please authenticate with Pi Network first", "error");
        return;
    }

    const piAmount = parseFloat(document.getElementById('piAmount').value);
    if (!piAmount || piAmount < 0.01) {
        showMessage("Please enter a valid PI amount (minimum 0.01)", "error");
        return;
    }

    const userEmail = document.getElementById('userEmail').value;
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        showMessage("Please enter a valid email address", "error");
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
            network: PI_CONFIG.network
        }
    };

    // Add additional metadata based on payment type with numeric validation
    if (currentPayment.type === 'social') {
        const socialUrl = document.getElementById('socialUrl').value;
        if (!socialUrl || !/^(https?:\/\/)/.test(socialUrl)) {
            showMessage("Please enter a valid social media URL", "error");
            return;
        }
        paymentData.metadata.socialUrl = socialUrl;
    } else if (currentPayment.type === 'pubg') {
        const pubgId = document.getElementById('pubgId').value;
        // Strict numeric validation for PUBG ID (numbers only)
        if (!pubgId || !/^\d{6,12}$/.test(pubgId)) {
            showMessage("Please enter a valid PUBG Mobile Player ID (6-12 digits numbers only)", "error");
            return;
        }
        paymentData.metadata.pubgId = pubgId;
        paymentData.metadata.ucAmount = currentPayment.quantity;
    } else if (currentPayment.type === 'mlbb') {
        const mlbbUserId = document.getElementById('mlbbUserId').value;
        const mlbbZoneId = document.getElementById('mlbbZoneId').value;
        // Strict numeric validation for MLBB IDs (numbers only)
        if (!mlbbUserId || !/^\d{6,12}$/.test(mlbbUserId)) {
            showMessage("Please enter valid MLBB User ID (6-12 digits numbers only)", "error");
            return;
        }
        if (!mlbbZoneId || !/^\d{3,6}$/.test(mlbbZoneId)) {
            showMessage("Please enter valid MLBB Zone ID (3-6 digits numbers only)", "error");
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
                    await Pi.completePayment(paymentId, txid);
                    showThankYouMessage(paymentData);
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
        showPaymentStatus("Initiating payment... Please approve the transaction in your Pi Wallet.", false);
    } catch (error) {
        console.error("Payment creation error:", error);
        showPaymentError("Payment creation failed: " + error.message);
    }
}

// Show beautiful thank you message
function showThankYouMessage(paymentData) {
    const paymentStatus = document.getElementById('paymentStatus');
    if (!paymentStatus) return;
    
    paymentStatus.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; color: #14F195; margin-bottom: 15px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="color: #14F195; margin-bottom: 10px;">Payment Successful!</h3>
            <p style="margin-bottom: 15px; color: #333;">
                Thank you for your purchase of <strong>${paymentData.metadata.product}</strong>.
            </p>
            <div style="background: rgba(20, 241, 149, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0; color: #333;">
                    <strong>Amount:</strong> ${paymentData.amount} Test π
                </p>
                <p style="margin: 5px 0; color: #333;">
                    <strong>Network:</strong> Pi Testnet
                </p>
                <p style="margin: 5px 0; color: #333;">
                    <strong>Status:</strong> Completed
                </p>
            </div>
            <p style="color: #666; font-size: 14px;">
                Your Test Pi has been deducted from your wallet. You will receive a confirmation email shortly.
            </p>
        </div>
    `;
    paymentStatus.className = "payment-status payment-success";
    paymentStatus.style.display = "block";
}

// Simulate test payment for non-Pi Browser
function simulateTestPayment(paymentData) {
    showPaymentStatus("Simulating test payment...", false);
    
    setTimeout(() => {
        showThankYouMessage(paymentData);
        
        // Simulate email sending
        setTimeout(() => {
            showMessage(`TEST: Email confirmation would be sent to ${paymentData.metadata.userEmail}`, "info");
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
window.logoutUser = logoutUser;
