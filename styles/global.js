@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

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
}

/* Animation for gradient shifting */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient-shift {
  background-size: 400%;
  animation: gradientShift 8s ease infinite;
}

/* Animation for prize amount pulsing */
@keyframes prizePulse {
  from { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
  to { text-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
}

.animate-pulse {
  animation: prizePulse 2s infinite alternate;
}

/* Background images for tournament banners */
.classic-banner {
  background-image: url('https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
}

.tdm-banner {
  background-image: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
}
