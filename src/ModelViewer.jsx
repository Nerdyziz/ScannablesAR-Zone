import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl, info }) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const lastClickRef = useRef(0);

  // --- DOUBLE TAP LOGIC ---
  const handleDoubleTapDetector = (e) => {
    // allow zooming (no preventDefault), but track taps
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; 

    if (now - lastClickRef.current < DOUBLE_TAP_DELAY) {
      setIsPaused(prevState => !prevState);
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
    }
  };

  useEffect(() => {
    const modelViewer = document.querySelector('model-viewer');
    if (modelViewer) {
      const onProgress = (event) => {
        const { totalProgress } = event.detail;
        setProgress(totalProgress * 100);
      };
      modelViewer.addEventListener('progress', onProgress);
      return () => {
        modelViewer.removeEventListener('progress', onProgress);
      };
    }
  }, []);

  if (!modelUrl) return null;

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        touchAction: 'none', 
        cursor: 'pointer'
      }}
      onClick={handleDoubleTapDetector}
    >
      {/* Import Futuristic Font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');`}
      </style>

      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        
        /* === LOCK & RESET LOGIC === 
           - camera-controls: Removed when paused to disable manual interaction.
           - camera-orbit: 
              * UNPAUSED: "auto auto auto" (User controls + Auto Rotate)
              * PAUSED: "0deg 75deg auto" 
                - 0deg = Front (Default Azimuth)
                - 75deg = Standard Angle (Default Inclination)
                - auto = Default Zoom/Distance
           - interpolation-decay: Controls how fast/smooth the camera moves to the new orbit.
        */
        camera-controls={!isPaused ? true : undefined}
        camera-orbit={isPaused ? "0deg 75deg auto" : "auto auto auto"}
        interpolation-decay="200"
        
        // Auto-rotate stops when paused
        auto-rotate={!isPaused} 
        auto-rotate-delay="0"
        rotation-per-second="-60deg"
        
        disable-pan 
        
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <div slot="progress-bar" style={{
             position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
             background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '8px',
             color: 'white', display: progress >= 100 ? 'none' : 'block', pointerEvents: 'none'
        }}>
           Loading... {Math.round(progress)}%
        </div>

        <button slot="ar-button" style={{
          position: 'absolute', bottom: '20px', right: '20px', padding: '12px 24px',
          backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '30px',
          fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100
        }}>
          <span>📱 View in your space</span>
        </button>
      </model-viewer>

      {/* --- POPUP OVERLAY --- */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 10, 
        pointerEvents: 'none',
        opacity: isPaused ? 1 : 0,           // Fade in/out
        transition: 'opacity 0.5s ease-out'  // Smooth transition
      }}>
        
        {/* SVG Lines */}
        <svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
           <line x1="42%" y1="40%" x2="15%" y2="15%" stroke="blue" strokeWidth="2" />
           <line x1="58%" y1="40%" x2="85%" y2="15%" stroke="blue" strokeWidth="2" />
           <line x1="42%" y1="60%" x2="15%" y2="85%" stroke="blue" strokeWidth="2" />
           <line x1="58%" y1="60%" x2="85%" y2="85%" stroke="blue" strokeWidth="2" />
        </svg>

        {/* BOXES */}
        <div style={boxStyle({ top: '10%', left: '5%' })}>
          {info?.tl || ''}
        </div>
        <div style={boxStyle({ top: '10%', right: '5%' })}>
           {info?.tr || ''}
        </div>
        <div style={boxStyle({ bottom: '10%', left: '5%' })}>
           {info?.bl || ''}
        </div>
        <div style={boxStyle({ bottom: '10%', right: '5%' })}>
           {info?.br || ''}
        </div>
      </div>
    </div>
  );
}

// === RESPONSIVE STYLE HELPER ===
const boxStyle = (pos) => ({
  position: 'absolute',
  width: '38%', 
  maxWidth: '160px',
  minHeight: '30px',
  padding: '8px',
  
  backgroundColor: 'rgba(0,0,0, 0.5)',
  color: 'blue',
  border: '2px solid blue',
  borderRadius: '4px',
  textAlign: 'center',
  pointerEvents: 'auto',
  
  fontFamily: '"Orbitron", sans-serif', 
  letterSpacing: '1px',
  textTransform: 'uppercase',

  fontSize: 'clamp(10px, 2.5vw, 13px)', 
  fontWeight: '700',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  
  ...pos
});