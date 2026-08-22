import React from 'react';

export default function TopNavbar({ 
  activePanel, 
  onPanelSwitch, 
  t, 
  openAuthModal,
  isDarkMode,
  setIsDarkMode,
  toggleAccessDrawer
}) {
  
  const mainTabs = [
    { id: 'panel-dashboard', label: 'Home' },
    { id: 'panel-explore', label: 'Explore' }, 
    { id: 'panel-community', label: 'Community' } 
  ];

  return (
    <header className="site-header" style={{ height: '75px', width: '100%', background: 'rgba(10, 11, 20, 0.85)', backdropFilter: 'var(--glass-blur)', borderBottom: '1.5px solid var(--glass-border)', display: 'flex', alignItems: 'center', zIndex: 1000, position: 'sticky', top: 0 }}>
      <div className="brand-row" style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '0 45px' }}>
        
        {/* Brand static name */}
        <div className="brand" onClick={() => onPanelSwitch("panel-dashboard")} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-mark" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 240, 255, 0.08)', border: '2px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'var(--neon-cyan)', fontSize: '1.3rem', textShadow: 'var(--text-glow-cyan)', boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}>S</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{ fontSize: '1.35rem', margin: 0, fontWeight: '800', color: '#fff', letterSpacing: '0.5px' }}>Sulabha</h1>
            <p className="sub" style={{ fontSize: '0.7rem', margin: 0, color: '#8a99ad', fontWeight: '500' }}>A citizen-level inclusion portal</p>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <nav className="main-nav">
          <ul style={{ display: 'flex', gap: '36px', listStyle: 'none', margin: 0, padding: 0 }}>
            {mainTabs.map((tab) => (
              <li key={tab.id}>
                <a 
                  href={`#${tab.id}`} 
                  style={{
                    color: activePanel === tab.id ? 'var(--neon-cyan)' : '#94a3b8',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    padding: '8px 12px',
                    borderBottom: activePanel === tab.id ? '2.5px solid var(--neon-cyan)' : '2.5px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    onPanelSwitch(tab.id);
                  }}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions (Left-to-Right: Theme Toggle, Accessibility Toggle [=], Sign-in) */}
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Theme Toggle (Sun/Moon) */}
          <button 
            type="button"
            className="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: isDarkMode ? 'var(--neon-cyan)' : '#475569', cursor: 'pointer' }}
          >
            <i className={isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>

          {/* Accessibility toggle button [=] */}
          <button 
            type="button" 
            className="a11y-toggle-btn"
            onClick={toggleAccessDrawer}
            title="Toggle Accessibility Settings"
            style={{ width: '38px', height: '38px', borderRadius: '6px', border: '1.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: 'var(--neon-cyan)', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-universal-access"></i>
          </button>

          {/* User Sign-In Button */}
          <button 
            type="button"
            className="signin-btn"
            onClick={openAuthModal}
            title="Sign In / Configure Profile"
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid var(--neon-cyan)', background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(255, 0, 127, 0.15))', color: '#fff', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-user"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
