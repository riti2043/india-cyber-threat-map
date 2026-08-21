import React from 'react';

export default function Sidebar({ activePanel, onPanelSwitch, lang, setLang, t, openAuthModal }) {
  const menuItems = [
    { id: 'panel-dashboard', icon: 'fa-chart-line', labelKey: 'nav-dashboard' },
    { id: 'panel-reader', icon: 'fa-file-invoice', labelKey: 'nav-reader' },
    { id: 'panel-voice', icon: 'fa-microphone-lines', labelKey: 'nav-voice' },
    { id: 'panel-map', icon: 'fa-map-location-dot', labelKey: 'nav-map' },
    { id: 'panel-simulators', icon: 'fa-eye-low-vision', labelKey: 'nav-simulators' },
    { id: 'panel-game', icon: 'fa-gamepad', labelKey: 'nav-game' }
  ];

  return (
    <aside className="sidebar" id="sidebar-drawer">
      <div className="sidebar-brand">
        AURA Suite
      </div>
      
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`menu-item ${activePanel === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onPanelSwitch(item.id);
            }}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span className="nav-text">{t(item.labelKey)}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="lang-selector">
          <button 
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`} 
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button 
            className={`lang-btn ${lang === 'hi' ? 'active' : ''}`} 
            onClick={() => setLang('hi')}
          >
            हिन्दी
          </button>
          <button 
            className={`lang-btn ${lang === 'kn' ? 'active' : ''}`} 
            onClick={() => setLang('kn')}
          >
            ಕನ್ನಡ
          </button>
        </div>
        <button className="profile-quick-btn" onClick={openAuthModal}>
          <i className="fa-solid fa-user-gear"></i>
          <span>{t("txt-quick-profile")}</span>
        </button>
      </div>
    </aside>
  );
}
