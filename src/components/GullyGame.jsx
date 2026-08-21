import React, { useState, useEffect, useRef } from 'react';

export default function GullyGame({ t, isAuthenticated, speakFeedback, activePanel }) {
  const [gameState, setGameState] = useState("idle"); // idle, playing, over
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  
  // Game Customizers
  const [soundBeepsEnabled, setSoundBeepsEnabled] = useState(true);
  const [voiceHittingEnabled, setVoiceHittingEnabled] = useState(false);
  const [activeBeepBar, setActiveBeepBar] = useState(false);

  // References
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animationFrameRef = useRef(null);
  const gameVoiceRecognitionRef = useRef(null);

  // Game variable trackers
  const ballRef = useRef({
    x: 0, y: 0, radius: 8, speed: 2.2, isBowled: false, swingChecked: false
  });
  const pitchRef = useRef({
    wicketsX: 300, baseLineY: 200
  });

  // Handle Global Panel Switch event -> stop game immediately
  useEffect(() => {
    const handlePanelSwitch = () => {
      stopMatch();
    };
    window.addEventListener("auraPanelSwitch", handlePanelSwitch);
    return () => {
      window.removeEventListener("auraPanelSwitch", handlePanelSwitch);
      stopMatch();
    };
  }, []);

  // Keyboard swing key space bindings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && gameState === "playing") {
        e.preventDefault();
        swingBat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, score, wickets]);

  // Voice Hitting Recognizer loop
  useEffect(() => {
    if (gameVoiceRecognitionRef.current) {
      try { gameVoiceRecognitionRef.current.stop(); } catch (e) {}
      gameVoiceRecognitionRef.current = null;
    }

    if (!voiceHittingEnabled || gameState !== "playing") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const resultText = e.results[e.results.length - 1][0].transcript.toLowerCase();
      console.log("Game Speech Voice:", resultText);
      
      if (resultText.includes("hit") || resultText.includes("swing") || resultText.includes("bat") || resultText.includes("maar")) {
        swingBat();
      }
    };

    recognition.onend = () => {
      if (voiceHittingEnabled && gameState === "playing") {
        try { recognition.start(); } catch (e) {}
      }
    };

    gameVoiceRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (gameVoiceRecognitionRef.current) {
        try { gameVoiceRecognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [voiceHittingEnabled, gameState]);

  // Main Canvas loop and Physics simulation
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 240;

    // Reset ball starting state
    resetBallState();

    let beepTimer = 0;
    let beepRate = 50; // frames between beeps initially

    const renderLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starry sky
      ctx.fillStyle = "#0c0e1b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw pitch boundaries
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, canvas.height);
      ctx.lineTo(160, 110);
      ctx.lineTo(240, 110);
      ctx.lineTo(320, canvas.height);
      ctx.stroke();

      // Pitch center line
      ctx.strokeStyle = "rgba(255, 0, 127, 0.1)";
      ctx.beginPath();
      ctx.moveTo(200, 110);
      ctx.lineTo(200, canvas.height);
      ctx.stroke();

      // Draw wickets
      ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
      ctx.fillRect(pitchRef.current.wicketsX - 10, pitchRef.current.baseLineY - 45, 4, 45);
      ctx.fillRect(pitchRef.current.wicketsX, pitchRef.current.baseLineY - 45, 4, 45);
      ctx.fillRect(pitchRef.current.wicketsX + 10, pitchRef.current.baseLineY - 45, 4, 45);
      ctx.fillRect(pitchRef.current.wicketsX - 12, pitchRef.current.baseLineY - 45, 28, 4); // bail

      // Physics loop calculations
      const ball = ballRef.current;
      if (ball.isBowled) {
        ball.x += (pitchRef.current.wicketsX - ball.x) * 0.04;
        ball.y += ball.speed;
        ball.radius += 0.25;

        // Draw ball vector
        ctx.fillStyle = "var(--neon-magenta)";
        ctx.shadowColor = "var(--neon-magenta)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Visual Beep indicator sync
        beepTimer++;
        const currentDistance = pitchRef.current.baseLineY - ball.y;
        if (currentDistance > 0) {
          // Adjust beep interval proportional to distance
          const speedMultiplier = Math.max(8, Math.round(currentDistance / 3.5));
          beepRate = speedMultiplier;
        }

        if (beepTimer >= beepRate && soundBeepsEnabled) {
          triggerAudioBeep();
          beepTimer = 0;
        }

        // Check wickets collision / miss limit
        if (ball.y >= pitchRef.current.baseLineY && !ball.swingChecked) {
          ball.isBowled = false;
          handleBallMissed();
        }
      } else {
        // Auto bow next ball timer
        if (Math.random() < 0.015) {
          bowlBall();
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, soundBeepsEnabled]);

  const resetBallState = () => {
    const ball = ballRef.current;
    ball.x = 200;
    ball.y = 110;
    ball.radius = 4;
    ball.speed = 1.8 + Math.random() * 0.8;
    ball.isBowled = false;
    ball.swingChecked = false;
  };

  const bowlBall = () => {
    resetBallState();
    ballRef.current.isBowled = true;
  };

  const triggerAudioBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioCtx = audioCtxRef.current;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Pitch gets higher as the ball gets closer to the baseline
      const ball = ballRef.current;
      const distanceRatio = Math.max(0, Math.min(1, (ball.y - 110) / (pitchRef.current.baseLineY - 110)));
      const freq = 220 + distanceRatio * 520; // 220Hz to 740Hz range

      osc.frequency.value = freq;
      osc.type = "sine";

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.12);

      // Visual graph glow pulse
      setActiveBeepBar(true);
      setTimeout(() => setActiveBeepBar(false), 90);
    } catch (e) {
      console.warn("Audio Context init failure", e);
    }
  };

  const swingBat = () => {
    const ball = ballRef.current;
    if (!ball.isBowled || ball.swingChecked) return;
    
    ball.swingChecked = true;
    const hitTolerance = Math.abs(ball.y - (pitchRef.current.baseLineY - 12));

    if (hitTolerance <= 14) {
      // Successful Hit!
      ball.isBowled = false;
      const runs = Math.random() < 0.15 ? 6 : Math.random() < 0.4 ? 4 : Math.random() < 0.75 ? 2 : 1;
      
      setScore(s => s + runs);
      speakFeedback(`${runs} runs! Excellent shot.`);
      playHitAudioSound(true);
    } else {
      // Failed Swing (Too early or too late)
      ball.isBowled = false;
      handleBallMissed();
    }
  };

  const handleBallMissed = () => {
    setWickets(w => {
      const nextW = w + 1;
      if (nextW >= 3) {
        setGameState("over");
        speakFeedback(`All out! Your final score is ${score} runs.`);
        stopMatch();
        return 3;
      } else {
        speakFeedback("Bowled! You missed the delivery.");
        playHitAudioSound(false);
        return nextW;
      }
    });
  };

  const playHitAudioSound = (isHit) => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isHit) {
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      } else {
        // Wooden wicket collision crash tone
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      }

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const startMatch = () => {
    if (!isAuthenticated) {
      alert("Please login via Gateway before playing the cricket match.");
      return;
    }
    setScore(0);
    setWickets(0);
    setGameState("playing");
    speakFeedback("Match started. Ball is being bowled.");
  };

  const stopMatch = () => {
    setGameState("idle");
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const resetMatch = () => {
    setScore(0);
    setWickets(0);
    setGameState("idle");
    speakFeedback("Match reset.");
  };

  return (
    <div className="panel-layout-split">
      
      {/* Canvas screen */}
      <div className="panel-card flex-2">
        <div className="card-header">
          <h3><i className="fa-solid fa-gamepad"></i> Gully Cricket Arena</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="preset-btn" style={{ padding: '3px 8px', fontSize: '0.65rem', borderColor: 'var(--neon-cyan)' }}>Runs: {score}</span>
            <span className="preset-btn" style={{ padding: '3px 8px', fontSize: '0.65rem', borderColor: 'var(--neon-magenta)' }}>Wickets: {wickets}/3</span>
          </div>
        </div>

        <div className="card-body flex-center relative">
          <canvas ref={canvasRef} id="gully-cricket-canvas"></canvas>
          
          <div className="game-beep-wave">
            <div className={`beep-node ${activeBeepBar ? 'active' : ''}`}></div>
            <span style={{ fontSize: '0.65rem', color: '#a0aabf' }}>Pitch Distance Beep Indicator</span>
          </div>
        </div>
      </div>

      {/* Settings & Game controls */}
      <div className="panel-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-circle-nodes"></i> Play Controls</h3>
        </div>

        <div className="card-body">
          <div className="game-control-details" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            
            <div className="voice-commands-list" style={{ borderStyle: 'solid', background: 'rgba(255,255,255,0.01)' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#fff' }}>Sound Instruction Rules:</p>
              <p style={{ fontSize: '0.7rem', color: '#a0aabf' }}>
                Listen to the pitch audio beeps. The speed of the tone increases as the ball approaches. Tap "Swing Bat" or press the **Spacebar** at the highest pitch tone to strike.
              </p>
            </div>

            <div className="sim-switch-row" style={{ padding: '8px 10px' }}>
              <div className="sim-label-block">
                <strong style={{ fontSize: '0.75rem' }}>Acoustic Beeps (Blind Mode)</strong>
              </div>
              <label className="switch">
                <input type="checkbox" checked={soundBeepsEnabled} onChange={(e) => setSoundBeepsEnabled(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="sim-switch-row" style={{ padding: '8px 10px' }}>
              <div className="sim-label-block">
                <strong style={{ fontSize: '0.75rem' }}>Voice Hitting ("Swing")</strong>
              </div>
              <label className="switch">
                <input type="checkbox" checked={voiceHittingEnabled} onChange={(e) => setVoiceHittingEnabled(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>

          </div>

          <div className="action-footer">
            {gameState !== "playing" ? (
              <button onClick={startMatch} className="primary-btn w-full margin-bottom-sm">
                <i className="fa-solid fa-play"></i> Start Match
              </button>
            ) : (
              <button 
                onClick={swingBat} 
                className="primary-btn btn-cyan w-full margin-bottom-sm"
                style={{ background: 'var(--neon-cyan)', color: '#000' }}
              >
                <i className="fa-solid fa-baseball-bat-ball"></i> Swing Bat! (Space)
              </button>
            )}
            
            <button onClick={resetMatch} className="secondary-btn btn-magenta w-full">
              <i className="fa-solid fa-arrows-rotate"></i> Reset Game
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
