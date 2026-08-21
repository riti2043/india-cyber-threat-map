import React from 'react';

export default function TopNavbar({ 
  activePanel, 
  onPanelSwitch, 
  t, 
  openAuthModal,
  isDarkMode,
  setIsDarkMode
}) {
  
  const menuItems = [
    { id: 'panel-dashboard', labelKey: 'nav-dashboard' },
    { id: 'panel-reader', labelKey: 'nav-reader' },
    { id: 'panel-voice', labelKey: 'nav-voice' },
    { id: 'panel-map', labelKey: 'nav-map' },
    { id: 'panel-simulators', labelKey: 'nav-simulators' },
    { id: 'panel-game', labelKey: 'nav-game' }
  ];

  return (
    <nav className="top-navbar">
      
      {/* Brand Logo Header */}
      <div className="navbar-logo" onClick={() => onPanelSwitch("panel-dashboard")}>
        AURA SUITE
      </div>

      {/* Horizontal Routing Links */}
      <div className="navbar-menu-row">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`navbar-link ${activePanel === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onPanelSwitch(item.id);
            }}
          >
            {t(item.labelKey)}
          </a>
        ))}
      </div>

      {/* Settings & Profile Actions */}
      <div className="navbar-actions">
        
        {/* Light/Dark mode switcher */}
        <button 
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            color: isDarkMode ? 'var(--neon-cyan)' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.95rem',
            marginRight: '12px',
            transition: 'all 0.2s ease'
          }}
        >
          <i className={isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
        </button>

        {/* Profile Avatar Icon */}
        <button 
          type="button"
          onClick={openAuthModal}
          title="Configure Profile Settings"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '2px solid var(--neon-cyan)',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(255, 0, 127, 0.15))',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="fa-solid fa-user-astronaut" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}></i>
        </button>

      </div>

    </nav>
  );
}
