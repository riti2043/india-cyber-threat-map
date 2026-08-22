import React, { useState, useEffect, useRef } from 'react';
import translations from './i18n';
import TopNavbar from './components/TopNavbar';
import Dashboard from './components/Dashboard';
import DocumentReader from './components/DocumentReader';
import VoiceSuite from './components/VoiceSuite';
import InclusionMap from './components/InclusionMap';
import Simulators from './components/Simulators';
import GullyGame from './components/GullyGame';
import SignDigitRecognizer from './components/SignDigitRecognizer';
import ChatBotWidget from './components/ChatBotWidget';
import DynamicBackground from './components/DynamicBackground';
import Community from './components/Community';
import BrailleLearning from './components/BrailleLearning';

export default function App() {
  // Global Application State loading helper
  const savedProfile = (() => {
    try {
      const saved = localStorage.getItem("aura_react_profile");
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  })();

  const [isAuthenticated, setIsAuthenticated] = useState(!!savedProfile.isAuthenticated);
  const [userName, setUserName] = useState(savedProfile.userName || "Guest");
  const [userEmail, setUserEmail] = useState(savedProfile.userEmail || "");
  const [lang, setLang] = useState(savedProfile.lang || "en");
  const [fontScale, setFontScale] = useState(savedProfile.fontScale || 100);
  const [dyslexiaMode, setDyslexiaMode] = useState(!!savedProfile.dyslexiaMode);
  const [voiceNavEnabled, setVoiceNavEnabled] = useState(!!savedProfile.voiceNavEnabled);
  const [colorFilter, setColorFilter] = useState(savedProfile.colorFilter || "none");
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(savedProfile.autoScrollSpeed || "none");
  const [activePanel, setActivePanel] = useState("panel-dashboard");
  
  // Modal visibility
  const [showAuthModal, setShowAuthModal] = useState(!savedProfile.isAuthenticated);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSuccessBadgeVisible, setIsSuccessBadgeVisible] = useState(false);

  // Chat History & Floating Drawer States
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "AURA-9000 systems online, Captain. Structural diagnostics check out. Starfield background coordinates scrolling. How may I assist your voyage today?" }
  ]);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(savedProfile.isDarkMode !== false);
  const [isAccessDrawerOpen, setIsAccessDrawerOpen] = useState(false);

  // References
  const speechRecognitionRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Light/Dark mode class toggle
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }
  }, [isDarkMode]);

  // Sync translations & document attributes
  const t = (key) => {
    if (!translations) return key;
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Save profile to LocalStorage
  const saveProfile = (customState = {}) => {
    const stateToSave = {
      userName,
      userEmail,
      lang,
      fontScale,
      dyslexiaMode,
      voiceNavEnabled,
      colorFilter,
      autoScrollSpeed,
      isAuthenticated,
      isDarkMode,
      ...customState
    };
    localStorage.setItem("aura_react_profile", JSON.stringify(stateToSave));
  };

  // Text Scaling trigger
  useEffect(() => {
    const factor = fontScale / 100;
    document.documentElement.style.setProperty("--font-scale", factor);
  }, [fontScale]);

  // Dyslexia layout class toggle
  useEffect(() => {
    if (dyslexiaMode) {
      document.body.classList.add("dyslexia-mode");
    } else {
      document.body.classList.remove("dyslexia-mode");
    }
  }, [dyslexiaMode]);

  // Empathy color filters classes
  useEffect(() => {
    document.body.classList.remove("sim-protanopia", "sim-deuteranopia", "sim-tritanopia", "sim-achromatopsia");
    if (colorFilter !== "none") {
      document.body.classList.add(`sim-${colorFilter}`);
    }
  }, [colorFilter]);

  // Auto Scrolling animation loops
  useEffect(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    let intervalMs = 0;
    let pixels = 1;

    if (autoScrollSpeed === "slow") {
      intervalMs = 60;
    } else if (autoScrollSpeed === "medium") {
      intervalMs = 40;
    } else if (autoScrollSpeed === "fast") {
      intervalMs = 25;
    }

    if (intervalMs > 0) {
      scrollIntervalRef.current = setInterval(() => {
        const activePanelEl = document.querySelector(".workspace-panel.active");
        if (activePanelEl) {
          activePanelEl.scrollBy(0, pixels);
        }
      }, intervalMs);
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [autoScrollSpeed, activePanel]);

  // Scroll To Top Helper
  const scrollToTop = () => {
    const activePanelEl = document.querySelector(".workspace-panel.active");
    if (activePanelEl) {
      activePanelEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Continuous speech commands controller (Voice Navigation scrolling)
  useEffect(() => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      speechRecognitionRef.current = null;
    }

    if (!voiceNavEnabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech recognition not supported in this browser.");
      setVoiceNavEnabled(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      const lastResultIdx = event.results.length - 1;
      const cmd = event.results[lastResultIdx][0].transcript.trim().toLowerCase();
      console.log("React Background Voice Command parsed:", cmd);
      handleVoiceCommand(cmd);
    };

    recognition.onend = () => {
      if (voiceNavEnabled) {
        try { recognition.start(); } catch (e) {}
      }
    };

    recognition.onerror = (e) => {
      console.error("Continuous Speech API error", e);
    };

    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Error starting speech recognition", e);
    }

    return () => {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [voiceNavEnabled]);

  const handleVoiceCommand = (text) => {
    if (text.includes("scroll down") || text.includes("neeche") || text.includes("kelage")) {
      const panel = document.querySelector(".workspace-panel.active");
      if (panel) panel.scrollBy({ top: 250, behavior: 'smooth' });
    } else if (text.includes("scroll up") || text.includes("upar") || text.includes("mele")) {
      const panel = document.querySelector(".workspace-panel.active");
      if (panel) panel.scrollBy({ top: -250, behavior: 'smooth' });
    } else if (text.includes("scroll fast")) {
      setAutoScrollSpeed("fast");
    } else if (text.includes("scroll slow")) {
      setAutoScrollSpeed("slow");
    } else if (text.includes("stop scroll")) {
      setAutoScrollSpeed("none");
    } else if (text.includes("open reader") || text.includes("document reader")) {
      handlePanelSwitch("panel-reader");
    } else if (text.includes("open voice") || text.includes("voice suite")) {
      handlePanelSwitch("panel-voice");
    } else if (text.includes("open map") || text.includes("inclusion map")) {
      handlePanelSwitch("panel-map");
    } else if (text.includes("open simulator") || text.includes("simulators")) {
      handlePanelSwitch("panel-simulators");
    } else if (text.includes("open game") || text.includes("play cricket")) {
      handlePanelSwitch("panel-game");
    } else if (text.includes("open dashboard") || text.includes("go home")) {
      handlePanelSwitch("panel-dashboard");
    }
  };

  // Save profile to LocalStorage automatically whenever preferences change
  useEffect(() => {
    if (isAuthenticated) {
      saveProfile();
    }
  }, [fontScale, dyslexiaMode, voiceNavEnabled, colorFilter, autoScrollSpeed, lang, userName, userEmail, isDarkMode]);

  // Text-To-Speech alert feedback
  const speakFeedback = (text) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === "hi") {
        utterance.lang = "hi-IN";
      } else if (lang === "kn") {
        utterance.lang = "kn-IN";
      } else {
        utterance.lang = "en-US";
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePanelSwitch = (panelId) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    window.dispatchEvent(new Event("auraPanelSwitch"));
    setActivePanel(panelId);

    let title = "Dashboard";
    if (panelId === "panel-reader") title = "Document Reader";
    if (panelId === "panel-voice") title = "Voice Suite";
    if (panelId === "panel-map") title = "Inclusion Map";
    if (panelId === "panel-simulators") title = "Simulators";
    if (panelId === "panel-game") title = "Gully Cricket Game";
    speakFeedback(title);
  };

  // Chat message send loop & parser
  const handleSendChatMessage = (queryText) => {
    const query = queryText.trim();
    if (!query) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);

    setTimeout(() => {
      const response = generateAura9000Response(query);
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      speakFeedback(response);
    }, 600);
  };

  const generateAura9000Response = (query) => {
    const text = query.toLowerCase();

    // 1. Scale
    if (text.includes("bigger") || text.includes("increase text") || text.includes("increase scale") || text.includes("make text bigger")) {
      setFontScale(130);
      return "Engaging text magnification warp drive to 130%! Visual accessibility shields are now at maximum, Captain.";
    }
    if (text.includes("normal") || text.includes("reset text") || text.includes("smaller")) {
      setFontScale(100);
      return "Deactivating text magnification. Font scales returned to base coordinates.";
    }

    // 2. Dyslexia Mode
    if (text.includes("dyslexia") || text.includes("dyslexic") || text.includes("scramble")) {
      setDyslexiaMode(true);
      return "Recalibrating linguistic matrices. Dyslexic-friendly layouts active. Mid-word letter scramblers online.";
    }
    if (text.includes("disable dyslexia") || text.includes("remove dyslexia")) {
      setDyslexiaMode(false);
      return "Linguistic matrices restored to standard layout definitions.";
    }

    // 3. Routing
    if (text.includes("open reader") || text.includes("document reader") || text.includes("ocr")) {
      handlePanelSwitch("panel-reader");
      return "Plotting warp course to Document OCR simplifying chambers. Initializing scanner grids.";
    }
    if (text.includes("open voice") || text.includes("form filler") || text.includes("transcribe")) {
      handlePanelSwitch("panel-voice");
      return "Adjusting navigation dials to Voice Assistant Form Suite. Microphone lines active.";
    }
    if (text.includes("open map") || text.includes("inclusion map") || text.includes("helpline")) {
      handlePanelSwitch("panel-map");
      return "Initiating tactical map checks of the Indian subcontinent. State helpline databases operational.";
    }
    if (text.includes("open simulator") || text.includes("simulators")) {
      handlePanelSwitch("panel-simulators");
      return "Routing visual feeds to simulation filters and hand gesture camera sensors.";
    }
    if (text.includes("open sign") || text.includes("sign language") || text.includes("digits")) {
      handlePanelSwitch("panel-sign");
      return "Opening the webcam Sign Language Digit Recognizer. Ready for hand gesture inputs.";
    }
    if (text.includes("open game") || text.includes("cricket") || text.includes("play")) {
      handlePanelSwitch("panel-game");
      return "Activating digital Gully Cricket audio beep emitters. Ready for match launch, Captain.";
    }

    // 4. Color Filters
    if (text.includes("colorblind") || text.includes("red green")) {
      setColorFilter("protanopia");
      return "Protanopia red-deficiency color filter applied. Spectrum calibration checks completed.";
    }

    // 5. Help guidelines
    if (text.includes("what is") || text.includes("aura") || text.includes("portal")) {
      return "AURA-9000 is your cockpit system for accessibility. I simplify legal jargon, dictate welfare forms, track state helplines, and run beep spatial games.";
    }
    if (text.includes("how to play") || text.includes("cricket help")) {
      return "To bat, listen to the acoustic beep speed. Swing at the highest sound frequency pitch by pressing Spacebar or screaming 'Swing'.";
    }

    return "Instruction received, Captain. Diagnostic indexes normal. You can dictate 'make text bigger', 'open reader', or 'open game' to proceed.";
  };

  // Auth logins
  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    const mockName = authEmail.split("@")[0];
    const computedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
    
    setUserName(computedName);
    setUserEmail(authEmail);
    setIsSuccessBadgeVisible(true);
    speakFeedback(`Authentication successful. Welcome ${computedName}`);
  };

  const handleGoogleLogin = () => {
    setUserName("Guest User");
    setUserEmail("guest@codefury.com");
    setIsSuccessBadgeVisible(true);
    speakFeedback("Authenticated via Google. Welcome Guest!");
  };

  const handleSaveProfile = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    saveProfile({
      userName,
      userEmail,
      isAuthenticated: true
    });
    speakFeedback("Accessibility Profile applied successfully.");
  };

  return (
    <div className="app">
      
      {/* SVG Empathy Filters */}
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05,  0, 0, 0, 0,  0.433, 0.567, 0, 0, 0, 0,  0.475, 0.525, 0, 0, 0, 0, 1, 0"/>
          </filter>
          <filter id="achromatopsia">
            <feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0"/>
          </filter>
        </defs>
      </svg>
      
      {/* Gateway auth overlay dialog */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="auth-card">
            <div className="auth-header">
              <i className="fa-solid fa-lock logo-icon text-accent" style={{ color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 5px var(--neon-cyan))' }}></i>
              <h2>AURA Gateway</h2>
              <p>{t("txt-modal-subtitle")}</p>
            </div>
            
            <div className="auth-body">
              {!isSuccessBadgeVisible ? (
                <>
                  <form onSubmit={handleCredentialsSubmit} className="credentials-form">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={authEmail} 
                      onChange={(e) => setAuthEmail(e.target.value)} 
                      required 
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={authPassword} 
                      onChange={(e) => setAuthPassword(e.target.value)} 
                      required 
                    />
                    <button type="submit" className="primary-btn w-full">{t("txt-sign-in-btn") || "Sign In"}</button>
                  </form>
                  <div style={{ textAlign: 'center', margin: '6px 0', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>OR</div>
                  <button type="button" onClick={handleGoogleLogin} className="google-btn">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                    <span>{t("txt-google-btn")}</span>
                  </button>
                </>
              ) : (
                <div className="success-badge">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>{t("txt-auth-success")} ({userName})</span>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }} />

              <h3><i className="fa-solid fa-user-gear" style={{ color: 'var(--neon-cyan)' }}></i> {t("txt-setup-title")}</h3>
              
              <div className="profile-options">
                <div className="profile-group">
                  <label>Full Name</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="profile-group">
                  <label>Email Address</label>
                  <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                </div>
                <div className="profile-group">
                  <label>Default Language</label>
                  <select value={lang} onChange={(e) => setLang(e.target.value)}>
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  </select>
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '6px 0' }} />

                <div className="profile-group">
                  <label>{t("lbl-font-scale")}: {fontScale}%</label>
                  <input type="range" min="100" max="180" step="10" value={fontScale} onChange={(e) => setFontScale(parseInt(e.target.value))} />
                </div>

                <div className="profile-group switch-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label><strong>{t("lbl-dyslexia-title")}</strong></label>
                  <label className="switch">
                    <input type="checkbox" checked={dyslexiaMode} onChange={(e) => setDyslexiaMode(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="profile-group switch-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label><strong>{t("lbl-voice-nav-title")}</strong></label>
                  <label className="switch">
                    <input type="checkbox" checked={voiceNavEnabled} onChange={(e) => setVoiceNavEnabled(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="profile-group">
                  <label>{t("lbl-color-filter")}</label>
                  <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
                    <option value="none">{t("opt-filter-none")}</option>
                    <option value="protanopia">{t("opt-filter-protan")}</option>
                    <option value="deuteranopia">{t("opt-filter-deuteran")}</option>
                    <option value="tritanopia">{t("opt-filter-tritan")}</option>
                    <option value="achromatopsia">{t("opt-filter-achro")}</option>
                  </select>
                </div>

                <div className="profile-group">
                  <label>{t("lbl-auto-scroll")}</label>
                  <select value={autoScrollSpeed} onChange={(e) => setAutoScrollSpeed(e.target.value)}>
                    <option value="none">{t("opt-scroll-none")}</option>
                    <option value="slow">{t("opt-scroll-slow")}</option>
                    <option value="medium">{t("opt-scroll-med")}</option>
                    <option value="fast">{t("opt-scroll-fast")}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="auth-footer">
              <button 
                type="button" 
                onClick={handleSaveProfile} 
                className="primary-btn" 
                disabled={!isSuccessBadgeVisible}
              >
                {t("txt-enter-btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Left Side Accessibility rail (Desktop icon list / Mobile hidden rail) */}
      <div className="a11y-rail">
        <div className="icon" title="Magnification" onClick={() => setFontScale(fontScale >= 180 ? 100 : fontScale + 20)}>A+</div>
        <div className="icon" title="Contrast Spectrum" onClick={() => {
          const list = ["none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"];
          const currIdx = list.indexOf(colorFilter);
          setColorFilter(list[(currIdx + 1) % list.length]);
        }}>◐</div>
        <div className="icon" title="Dyslexia Font" style={dyslexiaMode ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}} onClick={() => setDyslexiaMode(!dyslexiaMode)}>Aa</div>
        <div className="icon" title="Auto Scroll" onClick={() => {
          const list = ["none", "slow", "medium", "fast"];
          const currIdx = list.indexOf(autoScrollSpeed);
          setAutoScrollSpeed(list[(currIdx + 1) % list.length]);
        }}>≋</div>
        <div className="icon" title="Switch Language" onClick={() => {
          const list = ["en", "hi", "kn"];
          const currIdx = list.indexOf(lang);
          setLang(list[(currIdx + 1) % list.length]);
        }}>EN</div>
        <div className="expand" style={{ cursor: 'pointer' }} onClick={() => setIsAccessDrawerOpen(!isAccessDrawerOpen)}>»</div>
      </div>

      <div className="main-col" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <TopNavbar 
          activePanel={activePanel} 
          onPanelSwitch={handlePanelSwitch} 
          t={t}
          openAuthModal={() => {
            setIsSuccessBadgeVisible(true);
            setShowAuthModal(true);
          }}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          toggleAccessDrawer={() => setIsAccessDrawerOpen(!isAccessDrawerOpen)}
        />

        {/* Collapsible Left Side Accessibility drawer */}
        {isAccessDrawerOpen && (
          <div className="accessibility-side-drawer">
            <div className="drawer-header">
              <h4>Accessibility Console</h4>
              <button type="button" onClick={() => setIsAccessDrawerOpen(false)} className="compact-close-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="drawer-body">
              
              {/* Color Filter */}
              <div className="drawer-group">
                <label>Colorblind Spectrum</label>
                <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
                  <option value="none">Normal Spectrum</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                  <option value="achromatopsia">Achromatopsia (Monochrome)</option>
                </select>
              </div>

              {/* Dyslexia Mode */}
              <div className="drawer-group switch-row-drawer">
                <label><strong>Dyslexia Layout Font</strong></label>
                <label className="switch">
                  <input type="checkbox" checked={dyslexiaMode} onChange={(e) => setDyslexiaMode(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Text Sizing */}
              <div className="drawer-group">
                <label>Text Magnification</label>
                <div className="drawer-scale-adjuster">
                  <button type="button" onClick={() => setFontScale(Math.max(100, fontScale - 10))}>A-</button>
                  <span>{fontScale}%</span>
                  <button type="button" onClick={() => setFontScale(Math.min(180, fontScale + 10))}>A+</button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="drawer-group">
                <label>Language</label>
                <div className="drawer-lang-buttons">
                  <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
                  <button className={lang === 'hi' ? 'active' : ''} onClick={() => setLang('hi')}>हिन्दी</button>
                  <button className={lang === 'kn' ? 'active' : ''} onClick={() => setLang('kn')}>ಕನ್ನಡ</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Main Panel Viewport */}
        <main className="main-workspace" style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          {/* Dynamic Workspace Panels */}
          <div className={`workspace-panel ${activePanel === 'panel-dashboard' ? 'active' : ''}`}>
            <Dashboard 
              userName={userName} 
              t={t} 
              onPanelSwitch={handlePanelSwitch}
              voiceNavEnabled={voiceNavEnabled}
              setVoiceNavEnabled={setVoiceNavEnabled}
              SulabhaTitleComponent={SulabhaTitle}
            />
          </div>

          <div className={`workspace-panel ${activePanel === 'panel-reader' ? 'active' : ''}`}>
            <DocumentReader t={t} lang={lang} speakFeedback={speakFeedback} />
          </div>

          <div className={`workspace-panel ${activePanel === 'panel-voice' ? 'active' : ''}`}>
            <VoiceSuite t={t} lang={lang} speakFeedback={speakFeedback} />
          </div>

          <div className={`workspace-panel ${activePanel === 'panel-map' ? 'active' : ''}`} style={{ display: activePanel === 'panel-map' ? 'flex' : 'none', flexDirection: 'column', gap: '30px' }}>
            <InclusionMap t={t} lang={lang} speakFeedback={speakFeedback} />
            <hr style={{ border: 'none', borderTop: '3px solid var(--border)', margin: '10px 0' }} />
            <Community t={t} speakFeedback={speakFeedback} />
          </div>

          <div className={`workspace-panel ${activePanel === 'panel-simulators' ? 'active' : ''}`} style={{ display: activePanel === 'panel-simulators' ? 'flex' : 'none', flexDirection: 'column', gap: '30px' }}>
            <Simulators t={t} speakFeedback={speakFeedback} />
            <hr style={{ border: 'none', borderTop: '3px solid var(--border)', margin: '10px 0' }} />
            <BrailleLearning />
          </div>

          <div className={`workspace-panel ${activePanel === 'panel-game' ? 'active' : ''}`}>
            <GullyGame t={t} isAuthenticated={isAuthenticated} speakFeedback={speakFeedback} activePanel={activePanel} />
          </div>

          <div className={`workspace-panel ${activePanel === 'panel-sign' ? 'active' : ''}`}>
            <SignDigitRecognizer speakFeedback={speakFeedback} />
          </div>

          {/* Structured Footer below workspace panels */}
          <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '2px dashed var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
            <span>Sulabha Inclusion Portal &copy; 2026</span>
            <span>Dedicated citizen accessibility interface</span>
          </footer>

        </main>

      {/* ================= OMNIPRESENT FLOATING CHAT COMPANION ================= */}
      {/* Floating Hologram Orb Button */}
      <button 
        type="button"
        className="floating-holo-orb-btn"
        onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
        title="Toggle AURA Companion Chat"
      >
        <div className="floating-orb-outer"></div>
        <div className="floating-orb-inner"></div>
        <i className="fa-solid fa-robot"></i>
      </button>

      {/* Floating Glass Chat Drawer */}
      {isFloatingChatOpen && (
        <div className="floating-chat-drawer" style={{ padding: '0px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
            <button 
              type="button" 
              className="compact-btn" 
              style={{ padding: '2px 8px', borderColor: 'var(--neon-magenta)', color: 'var(--neon-magenta)', background: 'rgba(15,18,36,0.8)' }}
              onClick={() => setIsFloatingChatOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i> Close
            </button>
          </div>
          <ChatBotWidget 
            messages={messages}
            onSendMessage={handleSendChatMessage}
            speakFeedback={speakFeedback}
            t={t}
          />
        </div>
      )}

      {/* Floating Back to Top button */}
      <button 
        type="button" 
        className="floating-back-to-top-btn" 
        onClick={scrollToTop} 
        title="Scroll to Top"
      >
        <i className="fa-solid fa-chevron-up"></i>
      </button>

      </div>
    </div>
  );
}
