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

export default function BrailleLearning() {
  const [activeTab, setActiveTab] = useState('cell');
  const [interactiveCell, setInteractiveCell] = useState([false, false, false, false, false, false]);
  const [selectedLetter, setSelectedLetter] = useState('a');
  const [inputWord, setInputWord] = useState('hello');

  const toggleInteractiveDot = (index) => {
    setInteractiveCell(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const renderCellVisual = (dotsArr) => {
    return (
      <div className="braille-cell-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 40px)', gap: '12px', width: 'max-content', padding: '12px', border: '2px solid var(--border)', borderRadius: '6px', background: '#fff' }}>
        {[1, 4, 2, 5, 3, 6].map((num) => {
          const isRaised = dotsArr.includes(num);
          return (
            <div 
              key={num} 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isRaised ? 'var(--primary)' : '#e2e8f0',
                border: '2px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: isRaised ? '#fff' : '#64748b',
                fontSize: '0.8rem'
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
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sub navigation flow header */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('cell')}
          className={`btn ${activeTab === 'cell' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ minHeight: '40px', padding: '6px 16px' }}
        >
          1. The Braille Cell
        </button>
        <button 
          onClick={() => setActiveTab('alphabet')}
          className={`btn ${activeTab === 'alphabet' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ minHeight: '40px', padding: '6px 16px' }}
        >
          2. Alphabet Walkthrough
        </button>
        <button 
          onClick={() => setActiveTab('practice')}
          className={`btn ${activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ minHeight: '40px', padding: '6px 16px' }}
        >
          3. Practice: Build a Word
        </button>
      </div>

      {/* Section 1: The Braille Cell Explainer */}
      {activeTab === 'cell' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2>The 6-Dot Braille Cell</h2>
          <p>Braille characters are designed within a grid of 6 dots, organized into two columns of three rows. These dots are numbered 1 to 6.</p>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 50px)', gap: '16px', width: 'max-content', padding: '16px', border: '3px solid var(--border)', borderRadius: '10px', background: '#fff' }}>
              {[0, 3, 1, 4, 2, 5].map((index) => {
                const isRaised = interactiveCell[index];
                const dotNum = index < 3 ? index + 1 : index + 1; // 1,2,3 or 4,5,6 mapping
                const realNum = [1, 4, 2, 5, 3, 6][index];
                return (
                  <button
                    key={index}
                    onClick={() => toggleInteractiveDot(index)}
                    aria-label={`Dot ${realNum}: ${isRaised ? 'Raised' : 'Flat'}`}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isRaised ? 'var(--primary)' : '#f1f5f9',
                      border: '3px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: isRaised ? '#fff' : 'var(--ink)',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {realNum}
                  </button>
                );
              })}
            </div>
            
            <div style={{ flex: 1, minWidth: '260px' }}>
              <p style={{ fontWeight: 'bold' }}>Interactive Cell Preview</p>
              <p>Click the dots on the left grid to toggle them between Flat (grey) and Raised (blue). Feel free to explore how patterns are constructed!</p>
              <div style={{ marginTop: '16px', padding: '12px', border: '2px dashed var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                <strong>Active Dots: </strong> 
                {interactiveCell.map((val, idx) => val ? [1, 4, 2, 5, 3, 6][idx] : null).filter(Boolean).join(', ') || 'None'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Alphabet Walkthrough */}
      {activeTab === 'alphabet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2>Alphabet Walkthrough</h2>
          <p>Select any letter below to view its 6-dot Braille arrangement and structural guide.</p>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* 26 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 44px)', gap: '10px', background: 'var(--surface)', padding: '12px', border: '3px solid var(--border)', borderRadius: '10px' }}>
              {Object.keys(BRAILLE_ALPHABET).map((letKey) => (
                <button
                  key={letKey}
                  onClick={() => setSelectedLetter(letKey)}
                  className={`btn ${selectedLetter === letKey ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '40px', height: '40px', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold', fontSize: '1.2rem', padding: 0 }}
                >
                  {letKey.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Visual focus details */}
            <div style={{ flex: 1, minWidth: '260px', padding: '18px', border: '3px solid var(--border)', borderRadius: '10px', background: 'var(--surface)', display: 'flex', gap: '20px', alignItems: 'center' }}>
              {renderCellVisual(BRAILLE_ALPHABET[selectedLetter].dots)}
              <div>
                <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: '800' }}>Letter {selectedLetter.toUpperCase()}</h3>
                <p style={{ marginTop: '8px', color: '#4a4a4a' }}>{BRAILLE_ALPHABET[selectedLetter].desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Word Practice */}
      {activeTab === 'practice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2>Word Translation Builder</h2>
          <p>Type a short word below to visually output its translation into Braille dots cells side-by-side.</p>
          
          <input 
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
            placeholder="Type word here (e.g. name)"
            style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: '8px' }}
          />

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', padding: '20px', background: 'var(--surface)', border: '3px solid var(--border)', borderRadius: '10px', overflowX: 'auto' }}>
            {inputWord.split('').map((char, idx) => {
              const letterData = BRAILLE_ALPHABET[char];
              if (!letterData) return null;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {renderCellVisual(letterData.dots)}
                  <strong style={{ fontSize: '1.4rem' }}>{char.toUpperCase()}</strong>
                </div>
              );
            })}
            {inputWord.length === 0 && <span style={{ color: '#999', fontStyle: 'italic' }}>Please type letters to preview their cell chains.</span>}
          </div>
        </div>
      )}

    </div>
  );
}
