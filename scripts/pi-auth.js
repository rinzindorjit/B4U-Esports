// Global variables for payment
let currentPayment = {
    product: '',
    amount: 0,
    memo: '',
    metadata: {},
    paymentId: null,
    txid: null
};

let currentUser = null;
let piSDKInitialized = false;

// Package data
const pubgPackages = [
    { uc: 60, price: 2, img: 'images/pubg-uc.png' },
    { uc: 325, price: 8, img: 'images/pubg-uc.png' },
    { uc: 660, price: 15, img: 'images/pubg-uc.png' },
    { uc: 1800, price: 25, img: 'images/pubg-uc.png' },
    { uc: 3850, price: 50, img: 'images/pubg-uc.png' },
    { uc: 8100, price: 92, img: 'images/pubg-uc.png' },
    { uc: 16200, price: 185, img: 'images/pubg-uc.png' },
    { uc: 24300, price: 275, img: 'images/pubg-uc.png' },
    { uc: 32400, price: 365, img: 'images/pubg-uc.png' },
    { uc: 45000, price: 455, img: 'images/pubg-uc.png' }
];

const mlbbPackages = [
    { dias: 55, price: 2, img: 'images/mlbb-diamonds.png' },
    { dias: 275, price: 8, img: 'images/mlbb-diamonds.png' },
    { dias: 565, price: 12, img: 'images/mlbb-diamonds.png' },
    { dias: 1155, price: 25, img: 'images/mlbb-diamonds.png' },
    { dias: 1765, price: 35, img: 'images/mlbb-diamonds.png' },
    { dias: 2975, price: 55, img: 'images/mlbb-diamonds.png' },
    { dias: 6000, price: 105, img: 'images/mlbb-diamonds.png' },
    { dias: 12000, price: 205, img: 'images/mlbb-diamonds.png' }
];

// Initialize Pi Network SDK
async function initializePiSDK() {
    try {
        console.log("Initializing Pi Network SDK...");
        
        // Initialize SDK with sandbox mode for testnet
        Pi.init({
            version: "2.0", 
            sandbox: true // true for testnet, false for mainnet
        }).then(async () => {
            console.log("Pi SDK initialized successfully");
            piSDKInitialized = true;
            setupPiButtons();
            
            // Check if user is already authenticated
            if (Pi.isAuthenticated()) {
                try {
                    const authResult = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
                    currentUser = authResult.user;
                    handleSuccessfulAuth(authResult);
                } catch (error) {
                    console.error("Auto-authentication failed:", error);
                }
            }
        }).catch(error => {
            console.error("Pi SDK initialization failed:", error);
            document.getElementById('pi-auth-btn').innerHTML = 
                '<i class="fas fa-exclamation-circle"></i> Retry Sign In';
            document.getElementById('pi-auth-btn').disabled = false;
        });

    } catch (error) {
        console.error("Error initializing Pi SDK:", error);
        document.getElementById('pi-auth-btn').innerHTML = 
            '<i class="fas fa-exclamation-circle"></i> Retry Sign In';
        document.getElementById('pi-auth-btn').disabled = false;
    }
}

// Setup Pi Network buttons
function setupPiButtons() {
    const authBtn = document.getElementById('pi-auth-btn');
    authBtn.addEventListener('click', authenticatePiUser);

    const walletBtn = document.getElementById('pi-wallet-btn');
    walletBtn?.addEventListener('click', showWalletAddress);

    const shareBtn = document.getElementById('pi-share-btn');
    shareBtn?.addEventListener('click', openShareDialog);

    const payBtn = document.getElementById('piPayBtn');
    payBtn?.addEventListener('click', processPiPayment);
}

// Pi Network Authentication
async function authenticatePiUser() {
    if (!piSDKInitialized) {
        alert("Pi Network SDK is not initialized yet. Please wait...");
        return;
    }

    const authBtn = document.getElementById('pi-auth-btn');
    authBtn.disabled = true;
    authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    try {
        const scopes = ['username', 'payments'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        console.log("Pi user authenticated:", authResult);
        currentUser = authResult.user;
        handleSuccessfulAuth(authResult);
    } catch (error) {
        console.error("Authentication error:", error);
        authBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Retry Sign In';
        authBtn.disabled = false;
        
        if (error.message.includes('User cancelled') || error.message.includes('user_cancelled')) {
            alert("You cancelled the authentication process. Please try again.");
        } else {
            alert("Authentication failed: " + error.message);
        }
    }
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

function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
    return confirm("You have an incomplete payment. Do you want to continue with this payment?");
}

// Show wallet address
function showWalletAddress() {
    if (!currentUser) {
        alert("Please authenticate first");
        return;
    }
    
    Pi.getWalletAddress().then(address => {
        alert(`Your Pi Wallet Address:\n${address}`);
    }).catch(error => {
        console.error("Error getting wallet address:", error);
        alert("Failed to get wallet address: " + error.message);
    });
}

// Open share dialog
function openShareDialog() {
    const title = "B4U Esports";
    const message = "Check out B4U Esports - The ultimate gaming marketplace with Pi Network integration!";
    Pi.openShareDialog(title, message);
}
