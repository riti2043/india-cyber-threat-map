import React from 'react';

export default function Header({ 
  t, 
  voiceNavEnabled, 
  setVoiceNavEnabled, 
  openAuthModal
}) {
  
  const handleHamburgerClick = () => {
    const sidebar = document.getElementById("sidebar-drawer");
    if (sidebar) sidebar.classList.toggle("open");
  };

  return (
    <header className="workspace-header">
      <button className="hamburger-menu-btn" onClick={handleHamburgerClick}>
        <i className="fa-solid fa-bars"></i>
      </button>
      
      <h1>{t("page-title")}</h1>
      
      <div className="status-indicators">
        {/* Continuous Speech commands toggle */}
        <button 
          className={`indicator ${voiceNavEnabled ? 'pulse-green' : ''}`} 
          onClick={() => setVoiceNavEnabled(!voiceNavEnabled)}
          title="Toggle Voice Commands"
        >
          <i className="fa-solid fa-microphone-lines"></i>
        </button>
        
        {/* Profile Settings toggle */}
        <button 
          className="indicator" 
          onClick={openAuthModal}
          title="Profile Settings"
        >
          <i className="fa-solid fa-user-gear"></i>
        </button>
      </div>
    </header>
  );
}
