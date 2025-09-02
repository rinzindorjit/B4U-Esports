import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [piSDKInitialized, setPiSDKInitialized] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({
    product: '',
    amount: 0,
    memo: '',
    type: '',
    quantity: null,
    paymentId: null,
    txid: null,
    metadata: {}
  });
  const [sidebarActive, setSidebarActive] = useState(false);
  const [modalStates, setModalStates] = useState({
    tokenSelection: false,
    package: false,
    payment: false
  });
  const [selectedTokenType, setSelectedTokenType] = useState('');
  const [paymentStatus, setPaymentStatus] = useState({
    message: '',
    type: '', // 'success', 'error', or ''
    visible: false
  });

  // Package data
  const PACKAGES = {
    pubg: [
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
    ],
    mlbb: [
      { dias: 55, price: 2, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
      { dias: 275, price: 8, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
      { dias: 565, price: 12, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
      { dias: 1155, price: 25, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
      { dias: 1765, price: 35, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
      { dias: 2975, price: 55, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
      { dias: 6000, price: 105, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' },
      { dias: 12000, price: 205, img: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png' }
    ]
  };

  // Initialize Pi SDK
  useEffect(() => {
    const initPiSDK = () => {
      if (window.Pi) {
        window.Pi.init({ 
          version: "2.0", 
          sandbox: true 
        }).then(() => {
          console.log("Pi SDK initialized successfully");
          setPiSDKInitialized(true);
          
          // Check if user is already authenticated
          if (window.Pi.isAuthenticated()) {
            authenticateUser();
          }
        }).catch(error => {
          console.error("Pi SDK initialization failed:", error);
        });
      }
    };

    // Load Pi SDK script
    if (!window.Pi) {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => initPiSDK();
      document.head.appendChild(script);
    } else {
      initPiSDK();
    }
  }, []);

  const authenticateUser = async () => {
    if (!piSDKInitialized) {
      alert("Pi Network SDK is not initialized yet. Please wait...");
      return;
    }

    try {
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      console.log("Pi user authenticated:", authResult);
      setCurrentUser(authResult.user);
    } catch (error) {
      console.error("Authentication error:", error);
      if (error.message.includes('User cancelled') || error.message.includes('user_cancelled')) {
        alert("You cancelled the authentication process. Please try again.");
      } else {
        alert("Authentication failed: " + error.message);
      }
    }
  };

  const onIncompletePaymentFound = (payment) => {
    console.log('onIncompletePaymentFound', { payment });
    return confirm("You have an incomplete payment. Do you want to continue with this payment?");
  };

  const showWalletAddress = async () => {
    if (!currentUser) {
      alert("Please authenticate first");
      return;
    }
    
    try {
      const address = await window.Pi.getWalletAddress();
      alert(`Your Pi Wallet Address:\n${address}`);
    } catch (error) {
      console.error("Error getting wallet address:", error);
      alert("Failed to get wallet address: " + error.message);
    }
  };

  const openShareDialog = () => {
    if (!window.Pi) {
      alert("Pi SDK not loaded");
      return;
    }
    
    const title = "B4U Esports";
    const message = "Check out B4U Esports - The ultimate gaming marketplace with Pi Network integration!";
    window.Pi.openShareDialog(title, message);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const processPayment = async () => {
    if (!currentUser) {
      setPaymentStatus({
        message: "Please authenticate with Pi Network first",
        type: "error",
        visible: true
      });
      return;
    }

    const piAmount = parseFloat(document.getElementById('piAmount')?.value || currentPayment.amount);
    if (!piAmount || piAmount < 0) {
      setPaymentStatus({
        message: "Please enter a valid PI amount (minimum 0)",
        type: "error",
        visible: true
      });
      return;
    }

    const userEmail = document.getElementById('userEmail')?.value;
    if (!userEmail || !validateEmail(userEmail)) {
      setPaymentStatus({
        message: "Please enter a valid email address",
        type: "error",
        visible: true
      });
      return;
    }

    const paymentData = {
      amount: piAmount,
      memo: `Payment for ${currentPayment.product}`,
      metadata: {
        product: currentPayment.product,
        piUsername: currentUser.username,
        userEmail: userEmail,
        type: currentPayment.type,
        timestamp: new Date().toISOString(),
        testnet: true
      }
    };

    // Validate and add additional fields based on payment type
    if (currentPayment.type === 'social') {
      const socialUrl = document.getElementById('socialUrl')?.value;
      if (!socialUrl || !validateUrl(socialUrl)) {
        setPaymentStatus({
          message: "Please enter a valid social media URL",
          type: "error",
          visible: true
        });
        return;
      }
      paymentData.metadata.socialUrl = socialUrl;
    } else if (currentPayment.type === 'pubg') {
      const pubgId = document.getElementById('pubgId')?.value;
      if (!pubgId || isNaN(pubgId)) {
        setPaymentStatus({
          message: "Please enter a valid numeric PUBG Mobile Player ID",
          type: "error",
          visible: true
        });
        return;
      }
      paymentData.metadata.pubgId = parseInt(pubgId);
      paymentData.metadata.ucAmount = currentPayment.quantity;
    } else if (currentPayment.type === 'mlbb') {
      const mlbbUserId = document.getElementById('mlbbUserId')?.value;
      const mlbbZoneId = document.getElementById('mlbbZoneId')?.value;
      if (!mlbbUserId || isNaN(mlbbUserId) || !mlbbZoneId || isNaN(mlbbZoneId)) {
        setPaymentStatus({
          message: "Please enter valid numeric MLBB User ID and Zone ID",
          type: "error",
          visible: true
        });
        return;
      }
      paymentData.metadata.mlbbUserId = parseInt(mlbbUserId);
      paymentData.metadata.mlbbZoneId = parseInt(mlbbZoneId);
      paymentData.metadata.diasAmount = currentPayment.quantity;
    }

    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        console.log("Ready for server approval with paymentId:", paymentId);
        setCurrentPayment(prev => ({ ...prev, paymentId }));
        
        setPaymentStatus({
          message: "Waiting for server approval...",
          type: "",
          visible: true
        });

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
          setPaymentStatus({
            message: "Server approval failed: " + error.message,
            type: "error",
            visible: true
          });
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("Ready for server completion with paymentId and txid:", paymentId, txid);
        setCurrentPayment(prev => ({ ...prev, txid }));

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
            type: "success",
            visible: true
          });
          
          setTimeout(() => {
            closeModal('payment');
            setPaymentStatus({ message: '', type: '', visible: false });
          }, 5000);
        } catch (error) {
          console.error("Payment completion error:", error);
          setPaymentStatus({
            message: "Payment completion failed: " + error.message,
            type: "error",
            visible: true
          });
        }
      },
      onCancel: (paymentId) => {
        console.log("Payment cancelled with paymentId:", paymentId);
        setPaymentStatus({
          message: "Payment cancelled",
          type: "error",
          visible: true
        });
        setTimeout(() => {
          setPaymentStatus({ message: '', type: '', visible: false });
        }, 3000);
      },
      onError: (error, payment) => {
        console.error("Payment error:", error, payment);
        setPaymentStatus({
          message: "Error: " + error.message,
          type: "error",
          visible: true
        });
      }
    };

    try {
      await window.Pi.createPayment(paymentData, paymentCallbacks);
      console.log("Payment creation initiated");
      setPaymentStatus({
        message: "Initiating payment...",
        type: "",
        visible: true
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      setPaymentStatus({
        message: "Payment creation failed: " + error.message,
        type: "error",
        visible: true
      });
    }
  };

  const openModal = (modalName) => {
    if (!currentUser) {
      alert("Please sign in with Pi Network first");
      return;
    }
    
    setModalStates(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModalStates(prev => ({ ...prev, [modalName]: false }));
    
    if (modalName === 'payment') {
      setCurrentPayment({
        product: '',
        amount: 0,
        memo: '',
        type: '',
        quantity: null,
        paymentId: null,
        txid: null,
        metadata: {}
      });
      setPaymentStatus({ message: '', type: '', visible: false });
    }
  };

  const openPackageModal = (type) => {
    setSelectedTokenType(type);
    closeModal('tokenSelection');
    openModal('package');
  };

  const openPaymentModal = (product, amount, type, quantity = null) => {
    setCurrentPayment({
      product,
      amount,
      memo: `Payment for ${product}`,
      type,
      quantity,
      paymentId: null,
      txid: null,
      metadata: {}
    });
    
    closeModal('package');
    openModal('payment');
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const closeSidebar = () => {
    setSidebarActive(false);
  };

  const showDashboard = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    closeSidebar();
  };

  return (
    <div>
      <Head>
        <title>B4U Esports - Pi Network Integration</title>
        <meta name="description" content="B4U Esports - Your Ultimate Gaming Marketplace" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Header Section */}
      <header className="header">
        <div className="nav-container">
          <img src="https://b4uesports.com/wp-content/uploads/2025/04/cropped-Black_and_Blue_Simple_Creative_Illustrative_Dragons_E-Sport_Logo_20240720_103229_0000-removebg-preview.png" 
               alt="B4U Esports Logo" 
               className="logo" />
          <button className="hamburger" id="hamburger" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <nav className={`sidebar ${sidebarActive ? 'active' : ''}`} id="sidebar">
        <ul className="nav-menu">
          <li><a href="#" onClick={showDashboard}><i className="fas fa-home"></i>Home</a></li>
          <li><a href="https://b4uesports.com/my-account/"><i className="fas fa-user"></i>My Account</a></li>
          <li><a href="https://b4uesports.com/shop/"><i className="fas fa-store"></i>Shop</a></li>
          <li><a href="https://b4uesports.com/blogs/"><i className="fas fa-blog"></i>Blogs</a></li>
          <li><a href="#tournaments"><i className="fas fa-trophy"></i>Tournaments</a></li>
          <li><a href="https://b4uesports.com/purchase-in-game-tokens-and-social-media-boosting-services-with-pi/"><i className="fas fa-coins"></i>Buy with PI</a></li>
        </ul>
      </nav>
      <div className={`overlay ${sidebarActive ? 'active' : ''}`} id="overlay" onClick={closeSidebar}></div>

      {/* Main Content */}
      <div className="container">
        <section className="hero-section">
          <h1 className="welcome-text">
            <i className="fas fa-hand-peace"></i> KUZUZANGPOLA! <i className="fas fa-gamepad"></i>
          </h1>
          
          {/* Pi Network Auth Button */}
          {!currentUser ? (
            <button id="pi-auth-btn" className="pi-auth-btn" onClick={authenticateUser}>
              <i className="fas fa-sign-in-alt"></i> Sign In with Pi Network
            </button>
          ) : (
            <div id="pi-actions" className="pi-actions">
              <button id="pi-wallet-btn" className="pi-action-btn" onClick={showWalletAddress}>
                <i className="fas fa-wallet"></i> Wallet Address
              </button>
              <button id="pi-share-btn" className="pi-action-btn" onClick={openShareDialog}>
                <i className="fas fa-share-alt"></i> Share
              </button>
            </div>
          )}

          <div className="registration-note">
            <p>
              <i className="fas fa-exclamation-circle"></i>
              Note: This platform uses Pi Testnet. Only test Pi coins will be deducted, not real Mainnet Pi.
            </p>
          </div>

          <p className="text-lg">Your Ultimate Gaming Marketplace</p>
        </section>

        <div className="card-grid">
          <div className="card">
            <img src="https://b4uesports.com/wp-content/uploads/2025/04/ChatGPT-Image-Apr-22-2025-07_04_11-PM.png" 
                 alt="Marketplace" />
            <h2><i className="fas fa-store"></i> Marketplace</h2>
            <p>Buy and sell gaming accounts and items</p>
            <button className="register-btn" onClick={() => openPaymentModal('Marketplace Listing', 5, 'marketplace')}>
              <i className="fas fa-shopping-cart"></i> List Your Item
            </button>
          </div>

          <div className="card">
            <img src="https://b4uesports.com/wp-content/uploads/2025/05/ucandmlbb-dias.png" 
                 alt="In-game Tokens"
                 className="token-img" />
            <h2><i className="fas fa-coins"></i> In-game Tokens</h2>
            <p>Purchase various game currencies instantly</p>
            <button className="register-btn" onClick={() => openModal('tokenSelection')}>
              <i className="fas fa-shopping-bag"></i> GET TOKENS
            </button>
          </div>

          <div className="card">
            <img src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1266&q=80" alt="Social Media" />
            <h2><i className="fas fa-rocket"></i> Social Boosting</h2>
            <p>Boost your online presence</p>
            <button className="register-btn" onClick={() => openPaymentModal('Social Boost', 15, 'social')}>
              <i className="fas fa-chart-line"></i> BOOST NOW
            </button>
          </div>
        </div>

        {/* PUBG Tournaments Section */}
        <div className="tournament-header" id="tournaments">
          <h1><i className="fas fa-trophy"></i> PUBG Mobile Tournaments</h1>
          <p>Compete in our professional tournaments and win amazing prizes</p>
        </div>

        <div className="tournament-types">
          {/* Classic Tournament */}
          <div className="tournament-card">
            <div className="tournament-banner classic-banner"></div>
            <div className="tournament-content">
              <h2 className="tournament-title">
                <i className="fas fa-map-marked-alt"></i> Classic Tournament
              </h2>
              
              <div className="tournament-prize">
                <div className="prize-label">Total Prize Pool</div>
                <div className="prize-amount">π 500</div>
              </div>
              
              <div className="testnet-notice">
                <i className="fas fa-info-circle"></i> Using Pi Testnet - No real Pi will be deducted
              </div>
              
              <div className="tournament-details">
                <p><i className="fas fa-users"></i> <strong>Squad Mode:</strong> 4-6 players per team</p>
                <p><i className="fas fa-tag"></i> <strong>Team Tag:</strong> [B4U] required in team name</p>
                <span className="team-tag-example">(e.g. [B4U]YourTeamName)</span>
                <p><i className="fas fa-map"></i> <strong>Maps:</strong> Erangel, Miramar, Sanhok</p>
                <p><i className="fas fa-calendar-alt"></i> <strong>Schedule:</strong> Weekly tournaments</p>
              </div>
              
              <div className="tournament-modes">
                <h3><i className="fas fa-gamepad"></i> Tournament Format:</h3>
                <div className="mode-item">
                  <h4><i className="fas fa-users"></i> Squad Battle Royale</h4>
                  <p>Classic PUBG rules with TPP perspective</p>
                  <span className="team-tag">Team Tag: [B4U]YourTeamName</span>
                </div>
              </div>
              
              <h3><i className="fas fa-gavel"></i> Rules & Regulations:</h3>
              <ul className="rules-list">
                <li>Team name must include [B4U] tag (e.g. [B4U]Legends)</li>
                <li>No hacking or cheating of any kind</li>
                <li>Players must use their real PUBG IDs</li>
                <li>Teams must register 30 minutes before match</li>
                <li>Disconnections will not pause the game</li>
                <li>Top 3 teams by kills and placement will qualify</li>
              </ul>
              
              <button className="register-btn" onClick={() => openPaymentModal('Classic Tournament Entry', 5, 'tournament')}>
                <i className="fas fa-user-plus"></i> Register Now
              </button>
            </div>
          </div>
          
          {/* TDM Tournament */}
          <div className="tournament-card">
            <div className="tournament-banner tdm-banner"></div>
            <div className="tournament-content">
              <h2 className="tournament-title">
                <i className="fas fa-crosshairs"></i> TDM Tournament
              </h2>
              
              <div className="tournament-prize">
                <div className="prize-label">Total Prize Pool</div>
                <div className="prize-amount">π 300</div>
              </div>
              
              <div className="testnet-notice">
                <i className="fas fa-info-circle"></i> Using Pi Testnet - No real Pi will be deducted
              </div>
              
              <div className="tournament-details">
                <p><i className="fas fa-user"></i> <strong>Modes:</strong> 1v1 Duel & 4v4 Team Battle</p>
                <p><i className="fas fa-map"></i> <strong>Maps:</strong> Warehouse, Ruins, Town</p>
                <p><i className="fas fa-calendar-alt"></i> <strong>Schedule:</strong> Daily quick matches</p>
              </div>
              
              <div className="tournament-modes">
                <h3><i className="fas fa-gamepad"></i> Tournament Modes:</h3>
                <div className="mode-item">
                  <h4><i className="fas fa-user"></i> 1v1 Duel</h4>
                  <p>First player to reach 20 kills wins the match</p>
                </div>
                <div className="mode-item">
                  <h4><i className="fas fa-users"></i> 4v4 Team Battle</h4>
                  <p>First team to reach 40 kills wins the match</p>
                </div>
              </div>
              
              <h3><i className="fas fa-gavel"></i> Rules & Regulations:</h3>
              <ul className="rules-list">
                <li>No holding position for more than 5 seconds</li>
                <li>No camping in spawn areas</li>
                <li>Only designated weapons allowed</li>
                <li>Players must maintain sportsmanship</li>
                <li>Disconnections result in automatic loss</li>
                <li>No grenades or throwables in 1v1 mode</li>
              </ul>
              
              <button className="register-btn" onClick={() => openPaymentModal('TDM Tournament Entry', 3, 'tournament')}>
                <i className="fas fa-user-plus"></i> Register Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      <div className={`modal ${modalStates.tokenSelection ? 'active' : ''}`} id="tokenSelectionModal">
        <div className="modal-content">
          <span className="close-modal" onClick={() => closeModal('tokenSelection')}>×</span>
          <h2 className="modal-title">Select Token Type</h2>
          <div className="testnet-notice">
            <i className="fas fa-info-circle"></i> Using Pi Testnet - No real Pi will be deducted
          </div>
          <div className="token-selection">
            <button className="token-btn" onClick={() => openPackageModal('pubg')}>PUBG Mobile UC</button>
            <button className="token-btn" onClick={() => openPackageModal('mlbb')}>MLBB Diamonds</button>
          </div>
        </div>
      </div>

      {/* Package Selection Modal */}
      <div className={`modal ${modalStates.package ? 'active' : ''}`} id="packageModal">
        <div className="modal-content">
          <span className="close-modal" onClick={() => closeModal('package')}>×</span>
          <h2 className="modal-title">{selectedTokenType === 'pubg' ? 'Select PUBG Mobile UC Package' : 'Select MLBB Diamonds Package'}</h2>
          <div className="testnet-notice">
            <i className="fas fa-info-circle"></i> Using Pi Testnet - No real Pi will be deducted
          </div>
          <div className="packages">
            {selectedTokenType && PACKAGES[selectedTokenType].map((pkg, index) => (
              <div key={index} className="package">
                <img src={pkg.img} alt={selectedTokenType === 'pubg' ? `${pkg.uc} UC` : `${pkg.dias} DIAS`} 
                     style={{width: '100%', height: '100px', objectFit: 'contain'}} />
                <div className="package-title">{selectedTokenType === 'pubg' ? `${pkg.uc} UC` : `${pkg.dias} DIAS`}</div>
                <div className="package-price">{pkg.price} Testnet π</div>
                <button className="package-buy-btn" 
                        onClick={() => openPaymentModal(
                          selectedTokenType === 'pubg' ? `${pkg.uc} UC` : `${pkg.dias} DIAS`, 
                          pkg.price, 
                          selectedTokenType, 
                          selectedTokenType === 'pubg' ? pkg.uc : pkg.dias
                        )}>
                  <i className="fas fa-coins"></i> Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <div className={`modal ${modalStates.payment ? 'active' : ''}`} id="paymentModal">
        <div className="modal-content">
          <span className="close-modal" onClick={() => closeModal('payment')}>×</span>
          <h2 className="modal-title">Payment</h2>
          
          <div className="testnet-notice">
            <i className="fas fa-info-circle"></i> Using Pi Testnet - No real Pi will be deducted
          </div>
          
          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="productName">Product:</label>
              <input type="text" id="productName" value={currentPayment.product} readOnly />
            </div>
            
            <div className="form-group">
              <label htmlFor="piAmount">Amount (Testnet π):</label>
              <input type="number" id="piAmount" min="0" step="0.01" 
                     value={currentPayment.amount} 
                     onChange={(e) => setCurrentPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
            
            <div className="form-group">
              <label htmlFor="piUsername">Pi Username:</label>
              <input type="text" id="piUsername" value={currentUser?.username || ''} readOnly />
            </div>
            
            <div className="form-group">
              <label htmlFor="userEmail">Your Email:</label>
              <input type="email" id="userEmail" placeholder="Enter your email" required />
            </div>
            
            <div className="form-group" style={{display: currentPayment.type === 'social' ? 'block' : 'none'}}>
              <label htmlFor="socialUrl">Social Media URL:</label>
              <input type="url" id="socialUrl" placeholder="Enter your social media URL" />
            </div>
            
            <div className="form-group" style={{display: currentPayment.type === 'pubg' ? 'block' : 'none'}}>
              <label htmlFor="pubgId">PUBG Mobile Player ID:</label>
              <input type="number" id="pubgId" placeholder="Enter your PUBG Mobile Player ID" pattern="[0-9]*" />
            </div>
            
            <div className="form-group" style={{display: currentPayment.type === 'mlbb' ? 'block' : 'none'}}>
              <label htmlFor="mlbbUserId">MLBB User ID:</label>
              <input type="number" id="mlbbUserId" placeholder="Enter your MLBB User ID" pattern="[0-9]*" />
            </div>
            
            <div className="form-group" style={{display: currentPayment.type === 'mlbb' ? 'block' : 'none'}}>
              <label htmlFor="mlbbZoneId">MLBB Zone ID:</label>
              <input type="number" id="mlbbZoneId" placeholder="Enter your MLBB Zone ID" pattern="[0-9]*" />
            </div>
            
            <button id="piPayBtn" className="pi-pay-btn" onClick={processPayment}>
              <i className="fas fa-coins"></i> Pay with Testnet Pi
            </button>
            
            {paymentStatus.visible && (
              <div id="paymentStatus" className={`payment-status ${paymentStatus.type === 'success' ? 'payment-success' : paymentStatus.type === 'error' ? 'payment-error' : ''}`}>
                {paymentStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>ABOUT US</h3>
            <ul className="footer-links">
              <li><a href="https://b4uesports.com/our-history/" target="_blank" rel="noopener noreferrer">Our History</a></li>
              <li><a href="https://b4uesports.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><a href="https://b4uesports.com/data-protection/" target="_blank" rel="noopener noreferrer">Data Protection</a></li>
              <li><a href="https://b4uesports.com/cookie-policy/" target="_blank" rel="noopener noreferrer">Cookie Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>TERMS & CONDITIONS</h3>
            <ul className="footer-links">
              <li><a href="https://b4uesports.com/terms-of-service/" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
              <li><a href="https://b4uesports.com/user-agreement/" target="_blank" rel="noopener noreferrer">User Agreement</a></li>
              <li><a href="https://b4uesports.com/refund_returns/" target="_blank" rel="noopener noreferrer">Refund & Returns</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>CONTACT US</h3>
            <ul className="footer-links">
              <li><a href="https://b4uesports.com/support/" target="_blank" rel="noopener noreferrer">Support</a></li>
              <li><a href="https://b4uesports.com/faqs/" target="_blank" rel="noopener noreferrer">FAQs</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>FOLLOW US</h3>
            <div className="social-links">
              <a href="https://www.facebook.com/b4uesports" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://youtube.com/@b4uesports" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://www.tiktok.com/b4uesports" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="https://www.instagram.com/b4uesports" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://discord.gg/m2EcGPx" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-discord"></i>
              </a>
              <a href="https://t.me/b4uesport" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-telegram"></i>
              </a>
              <a href="https://www.linkedin.com/company/b4uesports/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }

        body {
          background: linear-gradient(135deg, #3B1C63 0%, #4B2C7C 100%);
          color: #fff;
          overflow-x: hidden;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Header Styles */
        .header {
          background: rgba(59, 28, 99, 0.9);
          padding: 1rem;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          backdrop-filter: blur(10px);
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo {
          height: 50px;
        }

        .hamburger {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.8rem;
          cursor: pointer;
          padding: 5px;
          z-index: 1001;
          display: block;
        }

        @media (min-width: 992px) {
          .hamburger {
            display: none;
          }
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: -100%;
          width: 280px;
          height: 100%;
          background: rgba(59, 28, 99, 0.95);
          transition: 0.3s ease;
          padding: 20px;
          z-index: 999;
          overflow-y: auto;
          backdrop-filter: blur(10px);
        }

        .sidebar.active {
          left: 0;
          box-shadow: 5px 0 15px rgba(0,0,0,0.3);
        }

        .nav-menu {
          list-style: none;
          margin-top: 5rem;
        }

        .nav-menu li {
          margin: 1.5rem 0;
        }

        .nav-menu a {
          color: #fff;
          text-decoration: none;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          transition: 0.3s;
        }

        .nav-menu a:hover {
          background: rgba(255,255,255,0.2);
        }

        .nav-menu i {
          margin-right: 10px;
          width: 20px;
          text-align: center;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 998;
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
        }

        .overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Main Content */
        .container {
          max-width: 1200px;
          margin: 80px auto 0;
          padding: 2rem;
          flex: 1;
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          padding: 4rem 1rem;
          background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
                      url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover;
          border-radius: 15px;
          margin-bottom: 2rem;
          background-blend-mode: overlay;
        }

        .welcome-text {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          color: #fff;
          text-shadow: 0 0 15px rgba(255,255,255,0.5);
          margin-bottom: 1rem;
        }

        .registration-note {
          background: rgba(59, 28, 99, 0.8);
          padding: 1rem;
          border-radius: 10px;
          margin: 1.5rem auto;
          max-width: 600px;
          border: 2px solid #fff;
          animation: pulseBorder 2s infinite;
        }

        @keyframes pulseBorder {
          0% { border-color: #fff; }
          50% { border-color: rgba(255,255,255,0.5); }
          100% { border-color: #fff; }
        }

        .registration-note p {
          color: white;
          text-align: center;
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .registration-note a {
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s;
          border-bottom: 2px dotted #fff;
        }

        /* Pi Network Auth Button */
        .pi-auth-btn {
          background: linear-gradient(135deg, #14f195 0%, #14bff1 100%);
          color: #000;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 1rem auto;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(20, 241, 149, 0.3);
        }

        .pi-auth-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(20, 241, 149, 0.4);
        }

        .pi-auth-btn i {
          font-size: 1.2rem;
        }

        /* Pi Network Actions */
        .pi-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 1rem 0;
        }

        .pi-action-btn {
          background: rgba(255,255,255,0.2);
          color: #fff;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          backdrop-filter: blur(5px);
        }

        .pi-action-btn:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.3);
        }

        /* Modal Styles */
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.8);
          z-index: 1100;
          justify-content: center;
          align-items: center;
          overflow-y: auto;
        }

        .modal.active {
          display: flex;
        }

        .modal-content {
          background: rgba(59, 28, 99, 0.95);
          padding: 2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 5px 30px rgba(0,0,0,0.5);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
          backdrop-filter: blur(10px);
        }

        .close-modal {
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 1.5rem;
          color: #fff;
          cursor: pointer;
          transition: color 0.3s;
        }

        .close-modal:hover {
          color: #ccc;
        }

        .modal-title {
          color: #fff;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .payment-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #fff;
          font-size: 0.9rem;
        }

        .form-group input, .form-group select {
          padding: 0.8rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: #fff;
          font-size: 1rem;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #fff;
          background: rgba(255,255,255,0.2);
        }

        .pi-pay-btn {
          background: linear-gradient(135deg, #14f195 0%, #14bff1 100%);
          color: #000;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 1rem;
          transition: all 0.3s;
        }

        .pi-pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(20, 241, 149, 0.4);
        }

        .pi-pay-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .payment-status {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          display: none;
          background: rgba(255,255,255,0.2);
          color: #fff;
        }

        .payment-success {
          background: rgba(16, 185, 129, 0.5);
          border: 1px solid #10b981;
          display: block;
        }

        .payment-error {
          background: rgba(239, 68, 68, 0.5);
          border: 1px solid #ef4444;
          display: block;
        }

        /* Token Selection Modal */
        .token-selection {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .token-btn {
          background: rgba(255,255,255,0.2);
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(5px);
        }

        .token-btn:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.3);
        }

        /* Package Selection Modal */
        .packages {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .package {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(5px);
        }

        .package:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.2);
        }

        .package-title {
          font-size: 1.2rem;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .package-price {
          font-size: 1rem;
          color: #fff;
          margin-bottom: 1rem;
        }

        .package-buy-btn {
          background: linear-gradient(135deg, #14f195 0%, #14bff1 100%);
          color: #000;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
        }

        .package-buy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(20, 241, 149, 0.4);
        }

        /* Card Grid */
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .card {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 1.5rem;
          transition: transform 0.3s;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(5px);
        }

        .card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.2);
        }

        .card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .card img.token-img {
          object-fit: contain;
          background: transparent;
          height: 180px;
          padding: 10px;
        }

        /* Tournament Section */
        .tournament-header {
          text-align: center;
          margin: 4rem 0 2rem;
        }

        .tournament-header h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          color: #fff;
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
          margin-bottom: 1rem;
        }

        .tournament-header p {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: rgba(255,255,255,0.8);
          max-width: 800px;
          margin: 0 auto;
        }

        .tournament-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .tournament-card {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.2);
          transition: transform 0.3s;
          backdrop-filter: blur(5px);
        }

        .tournament-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.2);
        }

        .tournament-banner {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .tournament-banner::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7));
        }

        .classic-banner {
          background-image: url('https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
        }

        .tdm-banner {
          background-image: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
        }

        .tournament-content {
          padding: 1.5rem;
        }

        .tournament-title {
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Enhanced Prize Pool Animation */
        .tournament-prize {
          background: linear-gradient(45deg, #3B1C63, #14F195, #3B1C63);
          background-size: 400%;
          border-radius: 8px;
          padding: 0.8rem;
          margin-bottom: 1rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.3);
          animation: gradientShift 8s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .prize-label {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 0.3rem;
        }

        .prize-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          animation: prizePulse 2s infinite alternate;
        }

        @keyframes prizePulse {
          from { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
          to { text-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
        }

        .tournament-details {
          margin-bottom: 1.5rem;
        }

        .tournament-details p {
          margin-bottom: 0.8rem;
          color: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tournament-modes {
          margin-bottom: 1.5rem;
        }

        .mode-item {
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.8rem;
          margin-bottom: 0.8rem;
        }

        .mode-item h4 {
          color: #fff;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .team-tag {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          padding: 0.3rem 0.6rem;
          font-size: 0.9rem;
          display: inline-block;
          margin-top: 0.5rem;
          color: #fff;
        }

        .team-tag-example {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          margin-top: 0.3rem;
          display: block;
        }

        .rules-list {
          list-style: none;
          margin-bottom: 1.5rem;
        }

        .rules-list li {
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
          position: relative;
          color: rgba(255,255,255,0.8);
        }

        .rules-list li::before {
          content: '•';
          color: #fff;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        .register-btn {
          display: block;
          text-align: center;
          background: linear-gradient(135deg, #14f195 0%, #14bff1 100%);
          color: #000;
          font-weight: 700;
          padding: 1rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s;
          margin: 1.5rem auto;
          width: fit-content;
          border: none;
          cursor: pointer;
        }

        .register-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(20, 241, 149, 0.3);
        }

        /* Footer Styles */
        footer {
          background: rgba(59, 28, 99, 0.9);
          padding: 3rem 2rem;
          margin-top: auto;
          backdrop-filter: blur(10px);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .footer-section {
          text-align: left;
        }

        .footer-section h3 {
          color: #fff;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin: 0.7rem 0;
        }

        .footer-links a {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-links a:hover {
          color: #fff;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .social-links a {
          color: #fff;
          font-size: 1.5rem;
          transition: color 0.3s;
        }

        .social-links a:hover {
          color: #ddd;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
            margin-top: 70px;
          }
          
          .hero-section {
            padding: 3rem 1rem;
          }
          
          .registration-note p {
            flex-direction: column;
            gap: 5px;
          }
          
          .card-grid {
            grid-template-columns: 1fr;
          }
          
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-section {
            text-align: center;
          }
          
          .social-links {
            justify-content: center;
          }
          
          .tournament-title {
            font-size: 1.3rem;
          }
          
          .prize-amount {
            font-size: 1.2rem;
          }
          
          .pi-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .pi-action-btn {
            width: 100%;
            max-width: 250px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .container {
            padding: 1.5rem;
          }
          
          .packages {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        /* Loading spinner */
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Testnet Notice */
        .testnet-notice {
          background: rgba(20, 241, 149, 0.2);
          border: 1px solid #14f195;
          border-radius: 8px;
          padding: 0.8rem;
          margin: 1rem 0;
          text-align: center;
          font-size: 0.9rem;
        }

        .text-lg {
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
}