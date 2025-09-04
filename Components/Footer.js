export default function Footer() {
  return (
    <footer className="bg-purple-900 bg-opacity-90 py-12 px-8 mt-auto backdrop-blur-sm">
      <div className="footer-content max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="footer-section">
          <h3 className="text-white text-lg font-semibold mb-4">ABOUT US</h3>
          <ul className="footer-links">
            <li className="my-2"><a href="https://b4uesports.com/our-history/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Our History</a></li>
            <li className="my-2"><a href="https://b4uesports.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
            <li className="my-2"><a href="https://b4uesports.com/data-protection/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Data Protection</a></li>
            <li className="my-2"><a href="https://b4uesports.com/cookie-policy/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="text-white text-lg font-semibold mb-4">TERMS & CONDITIONS</h3>
          <ul className="footer-links">
            <li className="my-2"><a href="https://b4uesports.com/terms-of-service/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
            <li className="my-2"><a href="https://b4uesports.com/user-agreement/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">User Agreement</a></li>
            <li className="my-2"><a href="https://b4uesports.com/refund_returns/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Refund & Returns</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="text-white text-lg font-semibold mb-4">CONTACT US</h3>
          <ul className="footer-links">
            <li className="my-2"><a href="https://b4uesports.com/support/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
            <li className="my-2"><a href="https://b4uesports.com/faqs/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">FAQs</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="text-white text-lg font-semibold mb-4 text-center md:text-left">FOLLOW US</h3>
          <div className="social-links flex justify-center md:justify-start gap-4 mt-4">
            <a href="https://www.facebook.com/b4uesports" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-gray-300 transition-colors">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://youtube.com/@b4uesports" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-gray-300 transition-colors">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.tiktok.com/b4uesports" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-gray-300 transition-colors">
              <i className="fab fa-tiktok"></i>
            </a>
            <a href="https://www.instagram.com/b4uesports" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-gray-300 transition-colors">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://discord.gg/m2EcGPx" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-gray-300 transition-colors">
              <i className="fab fa-discord"></i>
            </a>
            <a href="https://t.me/b4uesport" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-gray-300 transition-colors">
              <i className="fab fa-telegram"></i>
            </a>
            <a href="https://www.linkedin.com/company/b4uesports/" target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-gray-300 transition-colors">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
