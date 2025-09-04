import { useState } from 'react';

export default function Header({ isSidebarOpen, setIsSidebarOpen }) {
  return (
    <>
      <header className="header fixed top-0 w-full bg-purple-900 bg-opacity-90 p-4 z-50 backdrop-blur-sm shadow-lg">
        <div className="nav-container flex justify-between items-center max-w-6xl mx-auto">
          <img 
            src="https://b4uesports.com/wp-content/uploads/2025/04/cropped-Black_and_Blue_Simple_Creative_Illustrative_Dragons_E-Sport_Logo_20240720_103229_0000-removebg-preview.png" 
            alt="B4U Esports Logo" 
            className="logo h-12"
          />
          <button 
            className="hamburger text-white text-2xl md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <i className={isSidebarOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <nav className={`sidebar fixed top-0 left-0 h-full w-72 bg-purple-900 bg-opacity-95 p-5 z-40 transition-transform duration-300 backdrop-blur-sm ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ul className="nav-menu mt-16">
          <li className="my-4">
            <a href="#" className="text-white flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all">
              <i className="fas fa-home mr-3 w-5 text-center"></i>Home
            </a>
          </li>
          <li className="my-4">
            <a href="https://b4uesports.com/my-account/" className="text-white flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all">
              <i className="fas fa-user mr-3 w-5 text-center"></i>My Account
            </a>
          </li>
          <li className="my-4">
            <a href="https://b4uesports.com/shop/" className="text-white flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all">
              <i className="fas fa-store mr-3 w-5 text-center"></i>Shop
            </a>
          </li>
          <li className="my-4">
            <a href="https://b4uesports.com/blogs/" className="text-white flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all">
              <i className="fas fa-blog mr-3 w-5 text-center"></i>Blogs
            </a>
          </li>
          <li className="my-4">
            <a href="#tournaments" className="text-white flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all">
              <i className="fas fa-trophy mr-3 w-5 text-center"></i>Tournaments
            </a>
          </li>
          <li className="my-4">
            <a href="https://b4uesports.com/purchase-in-game-tokens-and-social-media-boosting-services-with-pi/" className="text-white flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all">
              <i className="fas fa-coins mr-3 w-5 text-center"></i>Buy with PI
            </a>
          </li>
        </ul>
      </nav>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="overlay fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
