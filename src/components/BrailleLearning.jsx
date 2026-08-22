import React, { useState } from 'react';

const BRAILLE_ALPHABET = {
  a: { dots: [1], desc: "Dot 1 (top-left)" },
  b: { dots: [1, 2], desc: "Dots 1, 2 (left column, top and middle)" },
  c: { dots: [1, 4], desc: "Dots 1, 4 (top row)" },
  d: { dots: [1, 4, 5], desc: "Dots 1, 4, 5 (top row + right middle)" },
  e: { dots: [1, 5], desc: "Dots 1, 5 (top-left + middle-right)" },
  f: { dots: [1, 2, 4], desc: "Dots 1, 2, 4" },
  g: { dots: [1, 2, 4, 5], desc: "Dots 1, 2, 4, 5" },
  h: { dots: [1, 2, 5], desc: "Dots 1, 2, 5" },
  i: { dots: [2, 4], desc: "Dots 2, 4" },
  j: { dots: [2, 4, 5], desc: "Dots 2, 4, 5" },
  k: { dots: [1, 3], desc: "Dots 1, 3" },
  l: { dots: [1, 2, 3], desc: "Dots 1, 2, 3" },
  m: { dots: [1, 3, 4], desc: "Dots 1, 3, 4" },
  n: { dots: [1, 3, 4, 5], desc: "Dots 1, 3, 4, 5" },
  o: { dots: [1, 3, 5], desc: "Dots 1, 3, 5" },
  p: { dots: [1, 2, 3, 4], desc: "Dots 1, 2, 3, 4" },
  q: { dots: [1, 2, 3, 4, 5], desc: "Dots 1, 2, 3, 4, 5" },
  r: { dots: [1, 2, 3, 5], desc: "Dots 1, 2, 3, 5" },
  s: { dots: [2, 3, 4], desc: "Dots 2, 3, 4" },
  t: { dots: [2, 3, 4, 5], desc: "Dots 2, 3, 4, 5" },
  u: { dots: [1, 3, 6], desc: "Dots 1, 3, 6" },
  v: { dots: [1, 2, 3, 6], desc: "Dots 1, 2, 3, 6" },
  w: { dots: [2, 4, 5, 6], desc: "Dots 2, 4, 5, 6" },
  x: { dots: [1, 3, 4, 6], desc: "Dots 1, 3, 4, 6" },
  y: { dots: [1, 3, 4, 5, 6], desc: "Dots 1, 3, 4, 5, 6" },
  z: { dots: [1, 3, 5, 6], desc: "Dots 1, 3, 5, 6" }
};

// 6-Dot grid standard order
const DOTS_ORDER = [1, 4, 2, 5, 3, 6];

export default function BrailleLearning() {
  const [activeTab, setActiveTab] = useState('cell');
  const [interactiveCell, setInteractiveCell] = useState([false, false, false, false, false, false]);
  const [selectedLetter, setSelectedLetter] = useState('a');
  const [inputWord, setInputWord] = useState('hello');

  const toggleInteractiveDot = (realNum) => {
    // realNum is 1,2,3,4,5,6. Index matches DOTS_ORDER
    const index = DOTS_ORDER.indexOf(realNum);
    if (index === -1) return;
    setInteractiveCell(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  // Find English letter matching selected dots patterns
  const getLetterFromPattern = () => {
    const raisedDots = DOTS_ORDER.filter((num, idx) => interactiveCell[idx]).sort();
    const entry = Object.entries(BRAILLE_ALPHABET).find(([letter, details]) => {
      const patternDots = [...details.dots].sort();
      return JSON.stringify(patternDots) === JSON.stringify(raisedDots);
    });
    return entry ? entry[0].toUpperCase() : '?';
  };

  const renderCellVisual = (dotsArr, size = "32px") => {
    return (
      <div 
        className="braille-cell-grid" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, max-content)', 
          gap: '8px', 
          width: 'max-content', 
          padding: '10px', 
          border: '1.5px solid rgba(255,255,255,0.06)', 
          borderRadius: '8px', 
          background: 'rgba(255,255,255,0.02)' 
        }}
      >
        {DOTS_ORDER.map((num) => {
          const isRaised = dotsArr.includes(num);
          return (
            <div 
              key={num} 
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: isRaised ? 'var(--neon-green)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isRaised ? '0 0 10px var(--neon-green)' : 'none',
                border: isRaised ? '1.5px solid #fff' : '1.5px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: isRaised ? '#000' : 'rgba(255,255,255,0.3)',
                fontSize: '0.65rem'
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 🚀 Dashboard Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, color: 'var(--neon-green)', textShadow: '0 0 12px rgba(57, 255, 20, 0.2)' }}>
            Braille Learning Console
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Interactive tactile character engine for sighted caregivers, educators, and curious minds.
          </p>
        </div>
      </div>

      {/* Sub navigation flow header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px dashed rgba(255,255,255,0.1)', paddingBottom: '16px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('cell')}
          className={`primary-btn ${activeTab === 'cell' ? '' : 'btn-dim'}`}
          style={{ minHeight: '38px', padding: '6px 20px', fontSize: '0.8rem', fontWeight: 'bold' }}
        >
          <i className="fa-solid fa-circle-dot" style={{ marginRight: '6px' }}></i> 1. The Braille Cell
        </button>
        <button 
          onClick={() => setActiveTab('alphabet')}
          className={`primary-btn ${activeTab === 'alphabet' ? '' : 'btn-dim'}`}
          style={{ minHeight: '38px', padding: '6px 20px', fontSize: '0.8rem', fontWeight: 'bold' }}
        >
          <i className="fa-solid fa-list-ol" style={{ marginRight: '6px' }}></i> 2. Alphabet Reference
        </button>
        <button 
          onClick={() => setActiveTab('practice')}
          className={`primary-btn ${activeTab === 'practice' ? '' : 'btn-dim'}`}
          style={{ minHeight: '38px', padding: '6px 20px', fontSize: '0.8rem', fontWeight: 'bold' }}
        >
          <i className="fa-solid fa-keyboard" style={{ marginRight: '6px' }}></i> 3. Word Sandbox
        </button>
      </div>

      {/* Section 1: The Braille Cell Explainer */}
      {activeTab === 'cell' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="themes-section" style={{ border: '2px solid rgba(0, 240, 255, 0.15)', borderRadius: '12px', padding: '24px', background: 'rgba(0, 240, 255, 0.02)', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Interactive Grid on left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 60px)', 
                  gap: '16px', 
                  width: 'max-content', 
                  padding: '24px', 
                  border: '2px solid var(--neon-cyan)', 
                  borderRadius: '16px', 
                  background: 'rgba(0, 240, 255, 0.04)',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)'
                }}
              >
                {DOTS_ORDER.map((num) => {
                  const idx = DOTS_ORDER.indexOf(num);
                  const isRaised = interactiveCell[idx];
                  return (
                    <button
                      key={num}
                      onClick={() => toggleInteractiveDot(num)}
                      aria-label={`Dot ${num}: ${isRaised ? 'Raised' : 'Flat'}`}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: isRaised ? 'var(--neon-cyan)' : 'rgba(255, 255, 255, 0.04)',
                        boxShadow: isRaised ? 'var(--text-glow-cyan)' : 'none',
                        border: isRaised ? '2.5px solid #fff' : '2.5px dashed rgba(255, 255, 255, 0.15)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '1.25rem',
                        color: isRaised ? '#000' : 'rgba(255, 255, 255, 0.35)',
                        transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <button 
                type="button"
                className="secondary-btn"
                style={{ minHeight: '34px', fontSize: '0.75rem', width: '100%' }}
                onClick={() => setInteractiveCell([false, false, false, false, false, false])}
              >
                Reset Cell Pattern
              </button>
            </div>

            {/* Readout console on right */}
            <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <span className="section-pre" style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', letterSpacing: '1px' }}>EXPLORER ENGINE</span>
                <h3 style={{ margin: '8px 0', fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>Constructing the Grid</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  A standard Braille cell comprises 6 dots in columns 1-3 (left) and 4-6 (right). Toggle the dots to build custom raised patterns.
                </p>
              </div>

              {/* Large Symbol Decoder Panel */}
              <div style={{ display: 'flex', gap: '16px', background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.1)', border: '1.5px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'var(--neon-cyan)', textShadow: 'var(--text-glow-cyan)' }}>
                  {getLetterFromPattern()}
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8a99ad', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Detected Letter</span>
                  <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>
                    {getLetterFromPattern() !== '?' ? `Character "${getLetterFromPattern()}"` : 'Unrecognized combination'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#94a3b8' }}>
                <strong>Active Dots: </strong>
                {DOTS_ORDER.filter((num, idx) => interactiveCell[idx]).join(', ') || 'None'}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Section 2: Alphabet Walkthrough */}
      {activeTab === 'alphabet' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Alphabet Select Grid */}
          <div style={{ flex: 1, minWidth: '320px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#fff', marginBottom: '16px' }}>Tactile Reference Library</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: '10px' }}>
              {Object.keys(BRAILLE_ALPHABET).map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  style={{
                    height: '52px',
                    borderRadius: '8px',
                    background: selectedLetter === letter ? 'rgba(57, 255, 20, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: selectedLetter === letter ? '1.5px solid var(--neon-green)' : '1.5px solid rgba(255,255,255,0.06)',
                    color: selectedLetter === letter ? 'var(--neon-green)' : '#fff',
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Large Letter Details Viewer */}
          <div style={{ width: '300px', padding: '24px', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{selectedLetter}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>in Braille</span>
            </div>
            
            {renderCellVisual(BRAILLE_ALPHABET[selectedLetter].dots, "48px")}

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#8a99ad', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Dot Sequence</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#fff', fontWeight: '500' }}>
                {BRAILLE_ALPHABET[selectedLetter].desc}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Section 3: Word Sandbox */}
      {activeTab === 'practice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Enter Word to Translate</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                placeholder="Type a word..."
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}
              />
              <button 
                onClick={() => setInputWord('')}
                className="secondary-btn"
                style={{ padding: '0 20px', minHeight: '44px' }}
              >
                Clear
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#8a99ad' }}>
              * Only alphabetical characters are allowed (A-Z). Spaces and numbers are skipped.
            </p>
          </div>

          {/* Braille Chain display output */}
          <div style={{ border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', background: 'rgba(0,0,0,0.15)', overflowX: 'auto' }}>
            <span className="section-pre" style={{ color: 'var(--neon-green)', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.7rem' }}>TRANSLATED BRAILLE CHAIN</span>
            
            {inputWord.length > 0 ? (
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingBottom: '10px' }}>
                {inputWord.split('').map((char, index) => {
                  const letterData = BRAILLE_ALPHABET[char];
                  if (!letterData) return null;
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      {renderCellVisual(letterData.dots, "28px")}
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(57, 255, 20, 0.08)', border: '1.5px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--neon-green)', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                        {char}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-keyboard" style={{ fontSize: '1.8rem', display: 'block', marginBottom: '10px', color: 'rgba(255,255,255,0.1)' }}></i>
                Start typing above to compile the translated cell output...
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
