// Hamburger Menu Functionality
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

// Initialize when page loads
window.addEventListener('load', initializePiSDK);
