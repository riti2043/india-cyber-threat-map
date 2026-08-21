import React, { useState, useEffect, useRef } from 'react';

export default function Simulators({ t, speakFeedback }) {
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [activeTargetField, setActiveTargetField] = useState("None");
  const [recognizedDigit, setRecognizedDigit] = useState("None");

  // Simulators Checklist States
  const [simProtan, setSimProtan] = useState(false);
  const [simDeuteran, setSimDeuteran] = useState(false);
  const [simTritan, setSimTritan] = useState(false);
  const [simAchro, setSimAchro] = useState(false);
  const [simDyslexia, setSimDyslexia] = useState(false);

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const dyslexiaIntervalRef = useRef(null);
  const originalMarkupMapRef = useRef(new Map());

  // Webcam controls
  const startWebcam = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.classList.remove("hidden");
        }
        setIsWebcamOn(true);
        speakFeedback("Camera enabled. Hold hand in front of sensor.");
        startCvAnalysis();
      })
      .catch(err => {
        console.error(err);
        alert("Camera connection blocked. Please check system permissions.");
      });
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.classList.add("hidden");
    }
    setIsWebcamOn(false);
    setRecognizedDigit("None");
    speakFeedback("Camera Offline");

    // Clear Canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startCvAnalysis = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 320;
    canvas.height = 240;

    let cooldown = 0;

    const analyzeFrame = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;

      // Skin Tone Threshold segmenter coordinates
      let skinCount = 0;
      let sumX = 0, sumY = 0;

      for (let y = 0; y < canvas.height; y += 3) {
        for (let x = 0; x < canvas.width; x += 3) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx+1];
          const b = data[idx+2];

          // Threshold metrics
          if (r > 95 && g > 40 && b > 20 && (r - g) > 15 && r > g && r > b) {
            skinCount++;
            sumX += x;
            sumY += y;
          }
        }
      }

      // Render hand tracking overlay
      if (skinCount > 200) {
        const cx = sumX / skinCount;
        const cy = sumY / skinCount;

        // Draw HUD tracking circle
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = "#ff007f";
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Count mock gesture finger peaks based on hand mass bounding box
        if (cooldown <= 0) {
          let count = 0;
          if (skinCount < 500) count = 1;
          else if (skinCount < 1000) count = 2;
          else if (skinCount < 1500) count = 3;
          else if (skinCount < 2000) count = 4;
          else count = 5;

          setRecognizedDigit(count.toString());
          speakFeedback(count.toString());
          cooldown = 45; // loop delay frame count
        } else {
          cooldown--;
        }
      } else {
        setRecognizedDigit("None");
      }

      loopRef.current = requestAnimationFrame(analyzeFrame);
    };

    loopRef.current = requestAnimationFrame(analyzeFrame);
  };

  // Clean Webcams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, []);

  // Dyslexia Jitter Simulator logic
  useEffect(() => {
    if (dyslexiaIntervalRef.current) {
      clearInterval(dyslexiaIntervalRef.current);
      dyslexiaIntervalRef.current = null;
    }

    if (!simDyslexia) {
      originalMarkupMapRef.current.forEach((orig, el) => {
        el.innerHTML = orig;
      });
      originalMarkupMapRef.current.clear();
      return;
    }

    // Select dashboard and reader text blocks to scramble
    const targetBlocks = [
      ".welcome-banner p", ".dash-card p", "#txt-how-to-play-desc"
    ];
    const elements = document.querySelectorAll(targetBlocks.join(", "));
    
    elements.forEach(el => {
      if (!originalMarkupMapRef.current.has(el)) {
        originalMarkupMapRef.current.set(el, el.innerHTML);
      }
    });

    dyslexiaIntervalRef.current = setInterval(() => {
      elements.forEach(el => {
        const markup = originalMarkupMapRef.current.get(el);
        if (!markup) return;

        const temp = document.createElement("div");
        temp.innerHTML = markup;
        scrambleTextNodes(temp);
        el.innerHTML = temp.innerHTML;
      });
    }, 850);

    return () => {
      if (dyslexiaIntervalRef.current) clearInterval(dyslexiaIntervalRef.current);
    };
  }, [simDyslexia]);

  const scrambleTextNodes = (rootNode) => {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      const val = node.nodeValue;
      if (!val.trim()) continue;

      const words = val.split(/(\s+)/);
      const jumbled = words.map(w => {
        if (!w.trim() || w.length <= 3) return w;
        const letters = w.split("");
        for (let i = 1; i < letters.length - 2; i++) {
          if (Math.random() < 0.25) {
            const temp = letters[i];
            letters[i] = letters[i+1];
            letters[i+1] = temp;
          }
        }
        return letters.join("");
      });
      node.nodeValue = jumbled.join("");
    }
  };

  // Sync empathy stylesheet color overlays
  useEffect(() => {
    document.body.classList.remove("sim-protanopia", "sim-deuteranopia", "sim-tritanopia", "sim-achromatopsia");
    if (simProtan) document.body.classList.add("sim-protanopia");
    if (simDeuteran) document.body.classList.add("sim-deuteranopia");
    if (simTritan) document.body.classList.add("sim-tritanopia");
    if (simAchro) document.body.classList.add("sim-achromatopsia");
  }, [simProtan, simDeuteran, simTritan, simAchro]);

  return (
    <div className="panel-layout-split">
      
      {/* Webcam virtual gesture input */}
      <div className="panel-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-video"></i> Sign Language Input</h3>
          <button 
            type="button" 
            onClick={isWebcamOn ? stopWebcam : startWebcam} 
            className={`secondary-btn ${isWebcamOn ? 'btn-magenta' : 'btn-cyan'}`}
            style={{ padding: '5px 10px', fontSize: '0.65rem' }}
          >
            <i className="fa-solid fa-camera"></i> {isWebcamOn ? "Disable Camera" : "Enable Camera"}
          </button>
        </div>

        <div className="card-body relative flex-column align-center">
          <div className="webcam-window">
            <video ref={videoRef} autoplay playsInline muted className="hidden"></video>
            <canvas ref={canvasRef}></canvas>
            
            {!isWebcamOn && (
              <div className="webcam-placeholder">
                <i className="fa-solid fa-ban"></i>
                <span>Camera Offline</span>
                <p>Allow system webcam permissions to track hands for numbers entry.</p>
              </div>
            )}
          </div>

          <div className="recognition-box">
            <div className="result-row">
              <span>Sign Digit Recognized:</span>
              <strong>{recognizedDigit}</strong>
            </div>
            <div className="result-row">
              <span>Selected Target field:</span>
              <strong>Welfare Application {"->"} Aadhaar Input</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Toggles panel */}
      <div className="panel-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-wand-magic-sparkles"></i> Accessibility Simulators</h3>
        </div>

        <div className="card-body">
          <div className="simulator-controls-box" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.75rem', color: '#a0aabf' }}>
              Enable filters to experience the visual constraints disabled citizens face when interacting online.
            </p>

            <div className="sim-switch-row">
              <div className="sim-label-block">
                <strong>Protanopia Simulator</strong>
                <p className="sub-label">Simulates red-green visual confusion</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={simProtan} onChange={(e) => {
                  setSimProtan(e.target.checked);
                  if (e.target.checked) { setSimDeuteran(false); setSimTritan(false); setSimAchro(false); }
                }} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="sim-switch-row">
              <div className="sim-label-block">
                <strong>Deuteranopia Simulator</strong>
                <p className="sub-label">Simulates green-red visual deficiency</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={simDeuteran} onChange={(e) => {
                  setSimDeuteran(e.target.checked);
                  if (e.target.checked) { setSimProtan(false); setSimTritan(false); setSimAchro(false); }
                }} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="sim-switch-row">
              <div className="sim-label-block">
                <strong>Tritanopia Simulator</strong>
                <p className="sub-label">Simulates blue-yellow colorblindness</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={simTritan} onChange={(e) => {
                  setSimTritan(e.target.checked);
                  if (e.target.checked) { setSimProtan(false); setSimDeuteran(false); setSimAchro(false); }
                }} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="sim-switch-row">
              <div className="sim-label-block">
                <strong>Achromatopsia Simulator</strong>
                <p className="sub-label">Simulates total color monochromacy</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={simAchro} onChange={(e) => {
                  setSimAchro(e.target.checked);
                  if (e.target.checked) { setSimProtan(false); setSimDeuteran(false); setSimTritan(false); }
                }} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="sim-switch-row">
              <div className="sim-label-block">
                <strong>Dyslexia Jitter Text</strong>
                <p className="sub-label">Scrambles mid-word letters to simulate reading fatigue</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={simDyslexia} onChange={(e) => setSimDyslexia(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
