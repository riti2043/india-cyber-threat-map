import React from 'react';
import CyberCube from './CyberCube';

export default function Dashboard({ 
  userName, 
  t, 
  onPanelSwitch, 
  voiceNavEnabled, 
  setVoiceNavEnabled,
  SulabhaTitleComponent
}) {
  
  const cards = [
    { 
      id: 'panel-reader', 
      icon: 'fa-file-contract', 
      titleKey: 'card-reader-title', 
      descKey: 'card-reader-desc', 
      themeClass: 'theme-purple',
      badgeNum: '01'
    },
    { 
      id: 'panel-voice', 
      icon: 'fa-microphone', 
      titleKey: 'card-voice-title', 
      descKey: 'card-voice-desc', 
      themeClass: 'theme-blue',
      badgeNum: '02'
    },
    { 
      id: 'panel-map', 
      icon: 'fa-map-location-dot', 
      titleKey: 'card-map-title', 
      descKey: 'card-map-desc', 
      themeClass: 'theme-green',
      badgeNum: '03'
    },
    { 
      id: 'panel-simulators', 
      icon: 'fa-eye-low-vision', 
      titleKey: 'card-sims-title', 
      descKey: 'card-sims-desc', 
      themeClass: 'theme-violet',
      badgeNum: '04'
    },
    { 
      id: 'panel-game', 
      icon: 'fa-gamepad', 
      titleKey: 'card-game-title', 
      descKey: 'card-game-desc', 
      themeClass: 'theme-magenta',
      badgeNum: '05'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
      
      {/* 🌌 Split Hero Section */}
      <div className="hero-split-row">
        
        {/* Left Hero Description */}
        <div className="hero-text-block">
          {SulabhaTitleComponent && (
            <div style={{ marginBottom: '16px' }}>
              <SulabhaTitleComponent />
            </div>
          )}
          <span className="hero-tagline">A CITIZEN LEVEL INCLUSION PORTAL</span>
          <h2 className="hero-title" style={{ marginTop: '8px' }}>SULABHA SUITE</h2>
          <p className="hero-subtitle">Code • Include • Empower</p>
          <p className="hero-desc">
            An immersive platform for cognitive accessibility, empowering disabled citizens with real-time multilingual document simplification, hands-free voice form filling, and spatial street cricket.
          </p>
          
          <div className="hero-actions-row">
            <button 
              type="button" 
              onClick={() => onPanelSwitch("panel-reader")} 
              className="primary-btn hero-btn"
            >
              Launch Reader
            </button>
            
            <button 
              type="button" 
              onClick={() => setVoiceNavEnabled(!voiceNavEnabled)} 
              className={`secondary-btn hero-btn ${voiceNavEnabled ? 'btn-cyan' : ''}`}
            >
              <i className="fa-solid fa-microphone" style={{ marginRight: '6px' }}></i>
              {voiceNavEnabled ? "Voice Active" : "Voice Navigation"}
            </button>
          </div>
        </div>

        {/* Right Hero Interactive 3D Cube */}
        <div className="hero-cube-block">
          <CyberCube />
        </div>

      </div>

      {/* 📂 Themes & Problem Statements Section */}
      <div className="themes-section">
        <div className="themes-header">
          <span className="section-pre">EXPLORE ACCESSIBILITY</span>
          <h3 className="section-title">Themes &amp; Inclusive Technologies</h3>
          <p className="section-subtitle">Deploying real-world cognitive interfaces to bridge digital gaps.</p>
        </div>

        {/* Responsive Grid layout matching symposium design */}
        <div className="themes-grid-container">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className={`theme-cyber-card ${card.themeClass}`}
              onClick={() => onPanelSwitch(card.id)}
            >
              <div className="theme-card-badge-row">
                <div className="theme-card-icon-box">
                  <i className={`fa-solid ${card.icon}`}></i>
                </div>
                <span className="theme-card-num">{card.badgeNum}</span>
              </div>

              <div className="theme-card-content">
                <h4>{t(card.titleKey)}</h4>
                <p>{t(card.descKey)}</p>
              </div>

              <div className="theme-card-footer">
                <button type="button" className="theme-read-more-btn">
                  Launch Tool <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
