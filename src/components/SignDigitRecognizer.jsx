import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── ISL Reference Guide ───────────────────────────────────────────────────
const ISL_GUIDE = [
  { digit: 0, emoji: '✊', desc: 'Closed fist', fingers: [false, false, false, false, false] },
  { digit: 1, emoji: '☝️', desc: 'Index up', fingers: [false, true, false, false, false] },
  { digit: 2, emoji: '✌️', desc: 'Index + Middle', fingers: [false, true, true, false, false] },
  { digit: 3, emoji: '🤟', desc: 'Index + Mid + Ring', fingers: [false, true, true, true, false] },
  { digit: 4, emoji: '🖖', desc: '4 fingers, no thumb', fingers: [false, true, true, true, true] },
  { digit: 5, emoji: '🖐️', desc: 'Open palm', fingers: [true, true, true, true, true] },
  { digit: 6, emoji: '🤙', desc: 'Thumb + Pinky', fingers: [true, false, false, false, true] },
  { digit: 7, emoji: '👆', desc: 'Thumb + Index (L)', fingers: [true, true, false, false, false] },
  { digit: 8, emoji: '👌', desc: 'Thumb + Index + Mid', fingers: [true, true, true, false, false] },
  { digit: 9, emoji: '🤘', desc: 'Thumb + 3 fingers', fingers: [true, true, true, true, false] },
];

// ─── Digit Classifier ──────────────────────────────────────────────────────
function classifyDigit(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  // Thumb extends sideways (compare x): tip.x < ip.x for right hand
  const thumbExt = landmarks[4].x < landmarks[3].x;
  // Other fingers: tip.y < pip.y means extended (y increases downward)
  const indexExt  = landmarks[8].y  < landmarks[6].y;
  const middleExt = landmarks[12].y < landmarks[10].y;
  const ringExt   = landmarks[16].y < landmarks[14].y;
  const pinkyExt  = landmarks[20].y < landmarks[18].y;

  const [t, i, m, r, p] = [thumbExt, indexExt, middleExt, ringExt, pinkyExt];

  if (!t && !i && !m && !r && !p) return 0;
  if (!t &&  i && !m && !r && !p) return 1;
  if (!t &&  i &&  m && !r && !p) return 2;
  if (!t &&  i &&  m &&  r && !p) return 3;
  if (!t &&  i &&  m &&  r &&  p) return 4;
  if ( t &&  i &&  m &&  r &&  p) return 5;
  if ( t && !i && !m && !r &&  p) return 6;
  if ( t &&  i && !m && !r && !p) return 7;
  if ( t &&  i &&  m && !r && !p) return 8;
  if ( t &&  i &&  m &&  r && !p) return 9;
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function SignDigitRecognizer({ speakFeedback }) {
  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('live'); // 'live' | 'practice'
  const [detectedDigit, setDetectedDigit] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [noHands, setNoHands] = useState(false);
  const [lowLight, setLowLight] = useState(false);
  const [digitSequence, setDigitSequence] = useState([]);
  const [copied, setCopied] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [targetDigit, setTargetDigit] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [cameraError, setCameraError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  // Refs (avoid stale closures in onResults)
  const videoRef         = useRef(null);
  const canvasRef        = useRef(null);
  const cameraRef        = useRef(null);
  const handsRef         = useRef(null);
  const digitHistoryRef  = useRef([]);
  const lastLockedRef    = useRef(null);
  const lastSpokenRef    = useRef(null);
  const noHandsTimerRef  = useRef(null);
  const holdTimerRef     = useRef(null);
  const lightCheckRef    = useRef(0);
  const modeRef          = useRef('live');
  const targetRef        = useRef(null);
  const ttsRef           = useRef(true);

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; },       [mode]);
  useEffect(() => { targetRef.current = targetDigit; }, [targetDigit]);
  useEffect(() => { ttsRef.current = ttsEnabled; },  [ttsEnabled]);

  // Load MediaPipe from CDN once
  useEffect(() => {
    const srcs = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js',
    ];
    let loaded = 0;
    const done = () => { if (++loaded === srcs.length) setMediaPipeReady(true); };
    const fail = () => setCameraError('Failed to load MediaPipe. Check your internet connection.');
    srcs.forEach(src => {
      if (document.querySelector(`script[src="${src}"]`)) { done(); return; }
      const s = document.createElement('script');
      s.src = src; s.crossOrigin = 'anonymous';
      s.onload = done; s.onerror = fail;
      document.head.appendChild(s);
    });
    return () => stopCamera();
  }, []);

  // ─── TTS helper ───────────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!ttsRef.current || !window.speechSynthesis) return;
    const key = String(text);
    if (lastSpokenRef.current === key) return;
    lastSpokenRef.current = key;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(key);
    u.rate = 0.9; u.lang = 'en-IN';
    window.speechSynthesis.speak(u);
    setTimeout(() => { lastSpokenRef.current = null; }, 2500);
  }, []);

  // ─── Lighting check ───────────────────────────────────────────────────────
  const checkLighting = useCallback(() => {
    if (!videoRef.current) return;
    const tmp = document.createElement('canvas');
    tmp.width = 32; tmp.height = 24;
    const ctx = tmp.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 32, 24);
    const data = ctx.getImageData(0, 0, 32, 24).data;
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4)
      brightness += data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
    setLowLight(brightness / (data.length / 4) < 50);
  }, []);

  // ─── MediaPipe results callback ───────────────────────────────────────────
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    // Mirror-draw video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks?.length > 0) {
      clearTimeout(noHandsTimerRef.current);
      noHandsTimerRef.current = null;
      setNoHands(false);

      const landmarks = results.multiHandLandmarks[0];

      // Draw skeleton (mirrored)
      const { drawConnectors, drawLandmarks, HAND_CONNECTIONS } = window;
      if (drawConnectors) {
        const mirrored = landmarks.map(lm => ({ ...lm, x: 1 - lm.x }));
        drawConnectors(ctx, mirrored, HAND_CONNECTIONS, { color: '#818cf8', lineWidth: 3 });
        drawLandmarks(ctx, mirrored, { color: '#c7d2fe', lineWidth: 1, radius: 4 });
      }

      // Classify and smooth over last 15 frames
      const raw = classifyDigit(landmarks);
      digitHistoryRef.current.push(raw);
      if (digitHistoryRef.current.length > 15) digitHistoryRef.current.shift();

      // Mode of history
      const counts = {};
      for (const d of digitHistoryRef.current)
        if (d !== null) counts[d] = (counts[d] || 0) + 1;
      let best = null, bestCount = 0;
      for (const [d, c] of Object.entries(counts))
        if (c > bestCount) { bestCount = c; best = parseInt(d); }
      const conf = bestCount / digitHistoryRef.current.length;

      if (best !== null && conf >= 0.6) {
        setDetectedDigit(best);
        setConfidence(Math.round(conf * 100));

        if (best !== lastLockedRef.current) {
          lastLockedRef.current = best;
          speak(String(best));

          // Add to sequence after holding 800ms
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = setTimeout(() => {
            setDigitSequence(prev => [...prev.slice(-19), best]);
          }, 800);

          // Practice mode check
          if (modeRef.current === 'practice' && targetRef.current !== null && best === targetRef.current) {
            setPracticeResult('correct');
            setPracticeScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
            speak('Correct! Well done!');
            setTimeout(() => {
              setPracticeResult(null);
              setTargetDigit(Math.floor(Math.random() * 10));
            }, 1600);
          }
        }
      } else {
        setDetectedDigit(null);
        setConfidence(0);
        lastLockedRef.current = null;
      }

      // Lighting check every ~30 frames
      if (++lightCheckRef.current % 30 === 0) checkLighting();

    } else {
      // No hands
      if (!noHandsTimerRef.current)
        noHandsTimerRef.current = setTimeout(() => setNoHands(true), 2000);
      setDetectedDigit(null);
      setConfidence(0);
      digitHistoryRef.current = [];
      lastLockedRef.current = null;
    }
  }, [speak, checkLighting]);

  // ─── Camera start / stop ──────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!mediaPipeReady) return;
    setCameraError(null);
    const { Hands, Camera } = window;
    if (!Hands || !Camera) { setCameraError('MediaPipe not available. Refresh the page.'); return; }

    try {
      const hands = new Hands({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${f}`,
      });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
      hands.onResults(onResults);
      handsRef.current = hands;

      const camera = new Camera(videoRef.current, {
        onFrame: async () => { if (handsRef.current) await handsRef.current.send({ image: videoRef.current }); },
        width: 640, height: 480,
      });
      await camera.start();
      cameraRef.current = camera;
      setIsRunning(true);
    } catch (err) {
      setCameraError(err?.message?.includes('Permission') ? 'Camera permission denied. Please allow camera access.' : (err?.message || 'Could not start camera.'));
    }
  }, [mediaPipeReady, onResults]);

  const stopCamera = useCallback(() => {
    try { cameraRef.current?.stop(); } catch {}
    try { handsRef.current?.close(); } catch {}
    cameraRef.current = null;
    handsRef.current = null;
    clearTimeout(noHandsTimerRef.current);
    clearTimeout(holdTimerRef.current);
    setIsRunning(false);
    setDetectedDigit(null);
    setNoHands(false);
    setLowLight(false);
    digitHistoryRef.current = [];
  }, []);

  const startPractice = () => {
    setMode('practice');
    setTargetDigit(Math.floor(Math.random() * 10));
    setPracticeResult(null);
    setPracticeScore({ correct: 0, total: 0 });
  };

  const copySequence = () => {
    if (!digitSequence.length) return;
    navigator.clipboard?.writeText(digitSequence.join('')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const digitColors = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#6366f1','#a855f7','#ec4899','#14b8a6','#f59e0b'];

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🤟 Sign Language Digit Recognizer
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Indian Sign Language (ISL) • Digits 0–9 • Real-time MediaPipe detection
          </p>
        </div>
        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['live', 'practice'].map(m => (
            <button key={m} onClick={() => { setMode(m); if (m === 'practice') startPractice(); }}
              style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                background: mode === m ? '#6366f1' : '#1e293b', color: mode === m ? '#fff' : '#94a3b8' }}>
              {m === 'live' ? '📹 Live' : '🎯 Practice'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

        {/* Camera Feed */}
        <div style={{ position: 'relative', background: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b' }}>
          <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
          <canvas ref={canvasRef} style={{ width: '100%', height: '360px', objectFit: 'cover', display: isRunning ? 'block' : 'none', borderRadius: '16px' }} />

          {/* Not running placeholder */}
          {!isRunning && (
            <div style={{ height: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '4rem' }}>📷</span>
              <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}>Camera is off</p>
              {cameraError && <p style={{ color: '#ef4444', margin: 0, fontSize: '0.8rem', textAlign: 'center', padding: '0 20px' }}>⚠️ {cameraError}</p>}
            </div>
          )}

          {/* No hands warning */}
          {isRunning && noHands && !lowLight && (
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.92)', borderRadius: '12px', padding: '10px 18px', border: '1px solid #334155', textAlign: 'center', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>👋 Show your hand in the frame</span>
            </div>
          )}

          {/* Low light warning */}
          {isRunning && lowLight && (
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(251,191,36,0.15)', borderRadius: '12px', padding: '10px 18px', border: '1px solid #d97706', textAlign: 'center', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>💡 Low light detected — move to better lighting</span>
            </div>
          )}

          {/* Practice overlay */}
          {isRunning && mode === 'practice' && targetDigit !== null && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.88)', borderRadius: '12px', padding: '10px 16px', border: '1px solid #334155' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.7rem' }}>SHOW THIS DIGIT</p>
              <p style={{ margin: '4px 0 0', color: '#a5b4fc', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{targetDigit}</p>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.7rem' }}>{ISL_GUIDE[targetDigit]?.desc}</p>
            </div>
          )}

          {/* Practice correct flash */}
          {practiceResult === 'correct' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.25)', borderRadius: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem' }}>✅</div>
                <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.5rem', marginTop: '8px' }}>Correct!</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Detected Digit Card */}
          <div style={{ background: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b', padding: '20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Detected</p>
            <div style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, color: detectedDigit !== null ? (digitColors[detectedDigit] || '#6366f1') : '#1e293b', transition: 'color 0.2s' }}>
              {detectedDigit !== null ? detectedDigit : '—'}
            </div>
            <div style={{ marginTop: '8px', height: '6px', background: '#1e293b', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${confidence}%`, background: confidence > 80 ? '#22c55e' : '#6366f1', borderRadius: '99px', transition: 'width 0.2s' }} />
            </div>
            <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '0.75rem' }}>{confidence > 0 ? `${confidence}% confidence` : 'Waiting...'}</p>
          </div>

          {/* Practice Score */}
          {mode === 'practice' && (
            <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '14px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' }}>Score</p>
              <p style={{ margin: 0, color: '#22c55e', fontWeight: 700, fontSize: '1.6rem' }}>{practiceScore.correct}<span style={{ color: '#475569', fontSize: '1rem' }}>/{practiceScore.total}</span></p>
            </div>
          )}

          {/* Digit Sequence */}
          <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '14px', flex: 1 }}>
            <p style={{ margin: '0 0 8px', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sequence</p>
            <div style={{ minHeight: '36px', display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {digitSequence.length === 0
                ? <span style={{ color: '#334155', fontSize: '0.8rem' }}>Hold a digit for 0.8s to add</span>
                : digitSequence.map((d, i) => (
                  <span key={i} style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: digitColors[d] + '22', border: `1px solid ${digitColors[d]}44`, color: digitColors[d], fontWeight: 700, fontSize: '0.9rem' }}>{d}</span>
                ))
              }
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={copySequence} disabled={!digitSequence.length}
                style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: copied ? '#22c55e' : '#1e293b', color: copied ? '#fff' : '#94a3b8', cursor: digitSequence.length ? 'pointer' : 'not-allowed', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button onClick={() => setDigitSequence([])} disabled={!digitSequence.length}
                style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#94a3b8', cursor: digitSequence.length ? 'pointer' : 'not-allowed', fontSize: '0.75rem', fontWeight: 600 }}>
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isRunning ? (
              <button onClick={startCamera} disabled={!mediaPipeReady}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: mediaPipeReady ? 'pointer' : 'not-allowed', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '0.85rem', opacity: mediaPipeReady ? 1 : 0.5 }}>
                {mediaPipeReady ? '▶ Start Camera' : 'Loading...'}
              </button>
            ) : (
              <button onClick={stopCamera}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                ⏹ Stop
              </button>
            )}
            <button onClick={() => setTtsEnabled(t => !t)} title={ttsEnabled ? 'Mute read-aloud' : 'Enable read-aloud'}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #1e293b', background: '#0f172a', color: ttsEnabled ? '#a5b4fc' : '#475569', cursor: 'pointer', fontSize: '1rem' }}>
              {ttsEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>

      {/* ISL Reference Guide */}
      <div style={{ marginTop: '20px', background: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        <button onClick={() => setShowGuide(g => !g)} style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>
          <span>📖 ISL Reference — Digits 0–9</span>
          <span style={{ transition: 'transform 0.2s', transform: showGuide ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>
        {showGuide && (
          <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {ISL_GUIDE.map(({ digit, emoji, desc, fingers }) => (
              <div key={digit} onClick={() => { setDetectedDigit(digit); speak(String(digit)); }}
                style={{ background: '#1e293b', borderRadius: '12px', padding: '14px 8px', textAlign: 'center', cursor: 'pointer', border: detectedDigit === digit ? `2px solid ${digitColors[digit]}` : '2px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ fontSize: '1.8rem' }}>{emoji}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: digitColors[digit], marginTop: '4px' }}>{digit}</div>
                {/* Finger indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '6px' }}>
                  {['T','I','M','R','P'].map((f, fi) => (
                    <span key={f} style={{ width: '14px', height: '14px', borderRadius: '3px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: fingers[fi] ? digitColors[digit] + '33' : '#0f172a', color: fingers[fi] ? digitColors[digit] : '#334155', border: `1px solid ${fingers[fi] ? digitColors[digit] + '66' : '#334155'}` }}>{f}</span>
                  ))}
                </div>
                <div style={{ color: '#475569', fontSize: '0.6rem', marginTop: '6px', lineHeight: 1.3 }}>{desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
