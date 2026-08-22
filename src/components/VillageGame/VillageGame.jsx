import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { VillageScene } from './VillageScene';
import TaskModal from './TaskModal';

export default function VillageGame({ onExit }) {
  const gameRef = useRef(null);
  const phaserRef = useRef(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [badges, setBadges] = useState([]);

  const handleTrigger = useCallback((locId) => {
    setActiveLocation(locId);
  }, []);

  const handleClose = useCallback(() => {
    setActiveLocation(null);
  }, []);

  const handleComplete = useCallback((badge) => {
    setBadges(prev => prev.includes(badge) ? prev : [...prev, badge]);
  }, []);

  // Tell the scene when task modal is open so it can freeze player
  useEffect(() => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene.getScene('VillageScene');
      if (scene) scene.setTaskOpen(!!activeLocation);
    }
  }, [activeLocation]);

  // Boot Phaser only once
  useEffect(() => {
    if (phaserRef.current) return;

    const scene = new VillageScene();

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#1a2e1a',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: scene,
    });

    phaserRef.current = game;

    // Wait until scene is fully created before setting callbacks
    game.events.once('ready', () => {
      const s = game.scene.getScene('VillageScene');
      if (s) s.setCallbacks(handleTrigger);
    });

    // Fallback: poll until scene is live
    const poll = setInterval(() => {
      const s = game.scene.getScene('VillageScene');
      if (s && s.sys.isActive()) {
        s.setCallbacks(handleTrigger);
        clearInterval(poll);
      }
    }, 100);

    return () => {
      clearInterval(poll);
      if (phaserRef.current) {
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [handleTrigger]);

  const totalLocations = 6;
  const progress = Math.round((badges.length / totalLocations) * 100);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* ─── HUD Bar ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 20px', background: 'rgba(0,0,0,0.85)',
        borderBottom: '1px solid rgba(0,240,255,0.2)',
        flexShrink: 0,
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f0ff' }}>🏘 Digital Village</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b', padding: '2px 8px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
            WASD / Arrow Keys to move
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '320px', margin: '0 20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {badges.length}/{totalLocations} tasks
          </span>
          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #00f0ff, #a855f7)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#00f0ff', whiteSpace: 'nowrap' }}>{progress}%</span>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '300px' }}>
          {badges.map(b => (
            <span key={b} style={{ padding: '3px 8px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '12px', color: '#fbbf24', fontSize: '0.65rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
              🏅 {b}
            </span>
          ))}
          {badges.length === 0 && <span style={{ color: '#475569', fontSize: '0.75rem', fontStyle: 'italic' }}>No badges yet — explore the village!</span>}
        </div>

        {/* Exit */}
        <button onClick={onExit} style={{
          marginLeft: '16px', padding: '6px 14px', background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px',
          color: '#f87171', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem',
          flexShrink: 0,
        }}>✕ Exit</button>
      </div>

      {/* ─── Game Canvas + Overlay ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Scanline vignette overlay for immersion */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
        }} />

        {/* Phaser mount point */}
        <div ref={gameRef} style={{ position: 'relative', zIndex: 1, borderRadius: '4px', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,240,255,0.15), 0 0 120px rgba(0,0,0,0.8)' }}>
          {/* Task modal lives inside the game frame */}
          {activeLocation && (
            <TaskModal
              locationId={activeLocation}
              onClose={handleClose}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>

      {/* ─── Win screen ────────────────────────────────────────────── */}
      {badges.length === totalLocations && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.88)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '16px',
        }}>
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24', margin: 0 }}>All Tasks Complete!</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>You've navigated the entire digital village!</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '400px' }}>
            {badges.map(b => (
              <span key={b} style={{ padding: '6px 14px', background: 'rgba(251,191,36,0.2)', border: '1px solid #fbbf24', borderRadius: '20px', color: '#fbbf24', fontWeight: 'bold', fontSize: '0.8rem' }}>🏅 {b}</span>
            ))}
          </div>
          <button onClick={onExit} style={{ marginTop: '16px', padding: '12px 32px', background: '#1d4ed8', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
