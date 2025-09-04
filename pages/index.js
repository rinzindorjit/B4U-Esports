import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TournamentCard from '../components/TournamentCard';
import PaymentModal from '../components/PaymentModal';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [piSDKInitialized, setPiSDKInitialized] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({
    product: '',
    amount: 0,
    type: '',
    quantity: null
  });

  useEffect(() => {
    initializePiSDK();
  }, []);

  const initializePiSDK = async () => {
    try {
      if (typeof window !== 'undefined' && window.Pi) {
        await window.Pi.init({ 
          version: "2.0", 
          sandbox: process.env.NODE_ENV !== 'production' 
        });
        setPiSDKInitialized(true);
        setupPiButtons();
        
        if (window.Pi.isAuthenticated()) {
          try {
            const authResult = await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
            setCurrentUser(authResult.user);
            handleSuccessfulAuth(authResult);
          } catch (error) {
            console.error("Auto-authentication failed:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing Pi SDK:", error);
    }
  };

  const setupPiButtons = () => {
    // Button setup logic will be handled in components
  };

  const onIncompletePaymentFound = (payment) => {
    console.log("Incomplete payment found:", payment);
    return confirm("You have an incomplete payment. Do you want to continue with this payment?");
  };

  const handleSuccessfulAuth = (authResult) => {
    console.log("User authenticated:", authResult.user.username);
  };

  const authenticatePiUser = async () => {
    if (!piSDKInitialized) {
      alert("Pi Network SDK is not initialized yet. Please wait...");
      return;
    }

    try {
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setCurrentUser(authResult.user);
      handleSuccessfulAuth(authResult);
    } catch (error) {
      console.error("Authentication error:", error);
      if (error.message.includes('User cancelled') || error.message.includes('user_cancelled')) {
        alert("You cancelled the authentication process. Please try again.");
      } else {
        alert("Authentication failed: " + error.message);
      }
    }
  };

  const openPaymentModal = (product, amount, type, quantity = null) => {
    if (!currentUser) {
      alert("Please sign in with Pi Network first");
      return;
    }
    
    setCurrentPayment({
      product,
      amount,
      type,
      quantity
    });
    setShowPaymentModal(true);
  };

  const openTokenSelectionModal = () => {
    if (!currentUser) {
      alert("Please sign in with Pi Network first");
      return;
    }
    setShowTokenModal(true);
  };

  const openPackageModal = (type) => {
    setShowPackageModal(true);
    setShowTokenModal(false);
  };

  const closeModals = () => {
    setShowTokenModal(false);
    setShowPackageModal(false);
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>B4U Esports - Pi Network Integration</title>
        <meta name="description" content="B4U Esports - Your Ultimate Gaming Marketplace with Pi Network Integration" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-grow container mx-auto px-4 py-20 mt-16">
        <section className="hero-section text-center py-12 px-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl mb-8">
          <h1 className="welcome-text text-3xl md:text-4xl font-bold mb-4">
            <i className="fas fa-hand-peace mr-2"></i> KUZUZANGPOLA! <i className="fas fa-gamepad ml-2"></i>
          </h1>
          
          <button 
            onClick={authenticatePiUser}
            className="pi-auth-btn bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold py-2 px-6 rounded-lg flex items-center justify-center mx-auto my-4"
          >
            <i className="fas fa-sign-in-alt mr-2"></i> 
            {currentUser ? `Signed in as ${currentUser.username}` : 'Sign In with Pi Network'}
          </button>

          <div className="registration-note bg-purple-800 bg-opacity-80 p-4 rounded-lg border-2 border-white border-opacity-50 animate-pulse max-w-md mx-auto my-4">
            <p className="text-white text-center flex items-center justify-center flex-wrap">
              <i className="fas fa-info-circle mr-2"></i>
              Using Pi Testnet - No real Pi will be deducted
            </p>
          </div>

          <p className="text-lg text-white">Your Ultimate Gaming Marketplace</p>
        </section>

        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Marketplace Card */}
          <div className="card bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
            <img 
              src="https://b4uesports.com/wp-content/uploads/2025/04/ChatGPT-Image-Apr-22-2025-07_04_11-PM.png" 
              alt="Marketplace"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold text-white mb-2">
              <i className="fas fa-store mr-2"></i> Marketplace
            </h2>
            <p className="text-gray-300 mb-4">Buy and sell gaming accounts and items</p>
            <button 
              onClick={() => openPaymentModal('Marketplace Listing', 5, 'marketplace')}
              className="register-btn bg-gradient-to-r from-green-400 to-blue-500 text-black font-bold py-3 px-6 rounded-lg w-full text-center"
            >
              <i className="fas fa-shopping-cart mr-2"></i> List Your Item
            </button>
          </div>

          {/* In-game Tokens Card */}
          <div className="card bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
            <img 
              src="https://b4uesports.com/wp-content/uploads/2025/05/ucandmlbb-dias.png" 
              alt="In-game Tokens"
              className="w-full h-48 object-contain rounded-lg mb-4 bg-transparent p-4"
            />
            <h2 className="text-xl font-semibold text-white mb-2">
              <i className="fas fa-coins mr-2"></i> In-game Tokens
            </h2>
            <p className="text-gray-300 mb-4">Purchase various game currencies instantly</p>
            <button 
              onClick={openTokenSelectionModal}
              className="register-btn bg-gradient-to-r from-green-400 to-blue-500 text-black font-bold py-3 px-6 rounded-lg w-full text-center"
            >
              <i className="fas fa-shopping-bag mr-2"></i> GET TOKENS
            </button>
          </div>

          {/* Social Boosting Card */}
          <div className="card bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
            <img 
              src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1266&q=80" 
              alt="Social Media"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold text-white mb-2">
              <i className="fas fa-rocket mr-2"></i> Social Boosting
            </h2>
            <p className="text-gray-300 mb-4">Boost your online presence</p>
            <button 
              onClick={() => openPaymentModal('Social Boost', 15, 'social')}
              className="register-btn bg-gradient-to-r from-green-400 to-blue-500 text-black font-bold py-3 px-6 rounded-lg w-full text-center"
            >
              <i className="fas fa-chart-line mr-2"></i> BOOST NOW
            </button>
          </div>
        </div>

        {/* Tournaments Section */}
        <div className="tournament-header text-center my-16" id="tournaments">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <i className="fas fa-trophy mr-2"></i> PUBG Mobile Tournaments
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Compete in our professional tournaments and win amazing prizes
          </p>
        </div>

        <div className="tournament-types grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <TournamentCard 
            type="classic"
            title="Classic Tournament"
            prize="500"
            onRegister={() => openPaymentModal('Classic Tournament Entry', 5, 'tournament')}
          />
          <TournamentCard 
            type="tdm"
            title="TDM Tournament"
            prize="300"
            onRegister={() => openPaymentModal('TDM Tournament Entry', 3, 'tournament')}
          />
        </div>
      </main>

      <Footer />

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          payment={currentPayment}
          user={currentUser}
          onClose={closeModals}
        />
      )}

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="modal-content bg-purple-900 bg-opacity-95 p-6 rounded-xl w-11/12 max-w-md backdrop-blur-sm">
            <span className="close-modal absolute top-4 right-4 text-white text-2xl cursor-pointer" onClick={closeModals}>×</span>
            <h2 className="modal-title text-white text-xl font-bold mb-4 text-center">Select Token Type</h2>
            <div className="token-selection flex flex-col gap-3">
              <button className="token-btn bg-white bg-opacity-20 text-white font-semibold py-3 rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all" onClick={() => openPackageModal('pubg')}>
                PUBG Mobile UC
              </button>
              <button className="token-btn bg-white bg-opacity-20 text-white font-semibold py-3 rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all" onClick={() => openPackageModal('mlbb')}>
                MLBB Diamonds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Selection Modal */}
      {showPackageModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="modal-content bg-purple-900 bg-opacity-95 p-6 rounded-xl w-11/12 max-w-2xl backdrop-blur-sm max-h-[80vh] overflow-y-auto">
            <span className="close-modal absolute top-4 right-4 text-white text-2xl cursor-pointer" onClick={closeModals}>×</span>
            <h2 className="modal-title text-white text-xl font-bold mb-4 text-center">Select Package</h2>
            <div className="packages grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Package items will be dynamically generated here */}
              <div className="package bg-white bg-opacity-10 rounded-lg p-4 text-center cursor-pointer backdrop-blur-sm hover:bg-opacity-20 transition-all">
                <img src="https://b4uesports.com/wp-content/uploads/2025/04/1000077315-1.png" alt="60 UC" className="w-full h-24 object-contain mb-2" />
                <div className="package-title text-white font-semibold">60 UC</div>
                <div className="package-price text-white mb-3">2 π</div>
                <button 
                  onClick={() => {
                    openPaymentModal('60 UC', 2, 'pubg', 60);
                    closeModals();
                  }}
                  className="package-buy-btn bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold py-2 rounded-lg w-full"
                >
                  <i className="fas fa-coins mr-1"></i> Buy Now
                </button>
              </div>
              {/* Add more packages as needed */}
            </div>
          </div>
        </div>
      )}

      {/* Pi Network SDK */}
      <script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
    </div>
  );
}
