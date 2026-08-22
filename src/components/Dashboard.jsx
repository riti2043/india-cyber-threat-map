import React from 'react';
import CyberCube from './CyberCube';

export default function Dashboard({ 
  userName, 
  t, 
  onPanelSwitch, 
  voiceNavEnabled, 
  setVoiceNavEnabled,
  SulabhaTitleComponent,
  InclusionMapComponent,
  onLaunchVillageGame
}) {
  
  const toolsCards = [
    { 
      id: 'panel-reader', 
      icon: 'fa-file-contract', 
      title: 'Smart Document Reader', 
      desc: 'Scan documents, simplify technical words, and listen with karaoke highlights.', 
      themeClass: 'theme-purple',
      badgeNum: '01'
    },
    { 
      id: 'panel-voice', 
      icon: 'fa-microphone', 
      title: 'Voice Assistant Suite', 
      desc: 'Speak details to populate forms in English/Hindi/Kannada and compile PDFs.', 
      themeClass: 'theme-blue',
      badgeNum: '02'
    }
  ];

  const learningCards = [
    { 
      id: 'panel-sign', 
      icon: 'fa-hand', 
      title: 'Sign-Digit Recognition', 
      desc: 'Show a number 1-5 to your webcam to translate hand signs to text inputs.', 
      themeClass: 'theme-violet',
      badgeNum: '03'
    },
    { 
      id: 'panel-braille', 
      icon: 'fa-braille', 
      title: 'Braille Learning Module', 
      desc: 'Self-paced interactive 6-dot explainer, alphabet walkthrough, and word builder.', 
      themeClass: 'theme-green',
      badgeNum: '04'
    },
    { 
      id: 'panel-game', 
      icon: 'fa-gamepad', 
      title: 'Digital Gully Cricket', 
      desc: 'Inclusive street cricket for visually impaired. Play using rhythm beeps & voice hitting.', 
      themeClass: 'theme-magenta',
      badgeNum: '05'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', width: '100%' }}>
      
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

      {/* 📂 Tools Section */}
      <div className="themes-section">
        <div className="themes-header" style={{ marginBottom: '20px' }}>
          <span className="section-pre" style={{ letterSpacing: '2px', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>UTILITIES</span>
          <h3 className="section-title" style={{ fontSize: '1.6rem', fontWeight: '800' }}>Welfare Tools</h3>
        </div>

        <div className="themes-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {toolsCards.map((card) => (
            <div 
              key={card.id} 
              className={`theme-cyber-card ${card.themeClass}`}
              onClick={() => onPanelSwitch(card.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="theme-card-badge-row">
                <div className="theme-card-icon-box">
                  <i className={`fa-solid ${card.icon}`}></i>
                </div>
                <span className="theme-card-num">{card.badgeNum}</span>
              </div>
              <div className="theme-card-content">
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
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

      {/* 📂 Learning & Games Section */}
      <div className="themes-section">
        <div className="themes-header" style={{ marginBottom: '20px' }}>
          <span className="section-pre" style={{ letterSpacing: '2px', fontWeight: 'bold', color: 'var(--neon-magenta)' }}>INTERACT</span>
          <h3 className="section-title" style={{ fontSize: '1.6rem', fontWeight: '800' }}>Learning &amp; Games</h3>
        </div>

        <div className="themes-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {learningCards.map((card) => (
            <div 
              key={card.title} 
              className={`theme-cyber-card ${card.themeClass}`}
              onClick={() => onPanelSwitch(card.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="theme-card-badge-row">
                <div className="theme-card-icon-box">
                  <i className={`fa-solid ${card.icon}`}></i>
                </div>
                <span className="theme-card-num">{card.badgeNum}</span>
              </div>
              <div className="theme-card-content">
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </div>
              <div className="theme-card-footer">
                <button type="button" className="theme-read-more-btn">
                  Open Module <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎮 Digital Village Game Launch Banner */}
      <div className="themes-section" style={{ border: '2px solid rgba(168,85,247,0.3)', borderRadius: '12px', padding: '24px', background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(56,189,248,0.04))', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🏘</div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px', color: '#a855f7' }}>Digital Gully — Village Game</h3>
          <p style={{ margin: 0, color: '#94a3b8', maxWidth: '50ch', fontSize: '0.9rem' }}>
            Walk through a fully interactive village — visit the Bank, Hospital, Post Office, Kirana Shop, Government Office, and Bus Stand. Complete real-world accessibility tasks and earn badges!
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {['🏦 ATM Ready','✉ Form Filler','🏥 Appointment','🛒 UPI Pay','🏛 Scheme','🚌 Ticket'].map(b => (
              <span key={b} style={{ padding: '2px 8px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '10px', color: '#c4b5fd', fontSize: '0.65rem', fontWeight: 'bold' }}>{b}</span>
            ))}
          </div>
        </div>
        <button
          onClick={onLaunchVillageGame}
          style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(124,58,237,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          🎮 Launch Game
        </button>
      </div>

      {/* 📂 Inclusion Map Banner Block */}
      <div className="themes-section" style={{ border: '2px solid rgba(0, 240, 255, 0.15)', borderRadius: '12px', padding: '24px', background: 'rgba(0, 240, 255, 0.02)' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 8px', color: 'var(--neon-green)' }}>India Inclusion Map</h3>
          <p style={{ margin: 0, color: '#94a3b8', maxWidth: '60ch' }}>See state-wise disabled welfare schemes, statistics, and helpline data directly.</p>
        </div>
        <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.08)' }}>
          {InclusionMapComponent && <InclusionMapComponent />}
        </div>
      </div>

    </div>
  );
}
