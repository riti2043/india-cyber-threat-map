import React, { useState } from 'react';

export default function ChatBotWidget({ 
  messages, 
  onSendMessage, 
  speakFeedback, 
  t 
}) {
  const [chatInput, setChatInput] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);

  // Quick Action Pills
  const quickPills = [
    { text: "🔍 What is AURA?", cmd: "what is aura" },
    { text: "🔊 Bigger Text", cmd: "make text bigger" },
    { text: "🧠 Dyslexia Font", cmd: "dyslexia font" },
    { text: "🏏 Play Cricket", cmd: "open game" }
  ];

  const handleSend = (text = null) => {
    const textToSend = text || chatInput;
    if (!textToSend.trim()) return;
    onSendMessage(textToSend);
    setChatInput("");
  };

  const handleDictate = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    setIsMicActive(true);
    speakFeedback("System listening");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      const indicator = document.getElementById("voice-indicator");
      if (indicator) {
        indicator.classList.remove("hidden");
        document.getElementById("voice-text").textContent = "AURA Listening...";
      }
    };

    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setChatInput(spoken);
      setTimeout(() => handleSend(spoken), 600);
    };

    recognition.onend = () => {
      setIsMicActive(false);
      const indicator = document.getElementById("voice-indicator");
      if (indicator) indicator.classList.add("hidden");
    };

    recognition.onerror = () => {
      setIsMicActive(false);
    };

    try {
      recognition.start();
    } catch (e) {}
  };

  return (
    <div className="chatbot-widget-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      
      {/* Hologram AI Orb Header */}
      <div className="hologram-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        paddingBottom: '12px',
        borderBottom: '1.5px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Hologram CSS Orb */}
        <div className="hologram-avatar-container">
          <div className="holo-ring-outer"></div>
          <div className="holo-ring-inner"></div>
          <div className="holo-core"></div>
        </div>
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textShadow: 'var(--text-glow-magenta)' }}>AURA-9000</h4>
          <span style={{ fontSize: '0.62rem', color: 'var(--neon-green)', fontWeight: 'bold' }}>⚡ COGNITIVE INTERFACE RESIDENT</span>
        </div>
      </div>

      {/* Message Timeline Log */}
      <div className="chat-log-box" style={{
        flex: 1,
        overflowY: 'auto',
        background: 'rgba(6,7,10,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        margin: '10px 0',
        minHeight: '180px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            background: msg.sender === 'user' 
              ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(0, 240, 255, 0.04) 100%)' 
              : 'linear-gradient(135deg, rgba(255, 0, 127, 0.12) 0%, rgba(255, 0, 127, 0.03) 100%)',
            border: msg.sender === 'user' ? '1.5px solid var(--neon-cyan)' : '1.5px solid var(--neon-magenta)',
            boxShadow: msg.sender === 'user' ? '0 0 8px rgba(0, 240, 255, 0.1)' : '0 0 8px rgba(255, 0, 127, 0.1)',
            padding: '8px 12px',
            borderRadius: msg.sender === 'user' ? '14px 14px 0 14px' : '14px 14px 14px 0',
            color: '#e2e8f0',
            fontSize: '0.78rem',
            lineHeight: 1.45
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Quick Action Pill Tags */}
      <div className="quick-pills-row" style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '6px'
      }}>
        {quickPills.map((pill, idx) => (
          <button 
            key={idx}
            type="button"
            className="compact-btn"
            style={{ fontSize: '0.62rem', whiteSpace: 'nowrap', border: '1px solid rgba(0,240,255,0.2)' }}
            onClick={() => handleSend(pill.cmd)}
          >
            {pill.text}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="input-mic-wrapper">
        <input 
          type="text" 
          placeholder="Ask AURA: 'dyslexia', 'make text bigger'..." 
          value={chatInput} 
          onChange={(e) => setChatInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ paddingRight: '60px' }}
        />
        <button 
          type="button" 
          onClick={handleDictate} 
          className={`field-mic-btn ${isMicActive ? 'active' : ''}`}
          style={{ right: '35px' }}
          title="Dictate message"
        >
          <i className="fa-solid fa-microphone"></i>
        </button>
        <button 
          type="button" 
          onClick={() => handleSend()}
          className="field-mic-btn"
          style={{ right: '6px', background: 'var(--neon-cyan)', color: '#000', borderColor: 'var(--neon-cyan)' }}
          title="Send message"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

    </div>
  );
}
