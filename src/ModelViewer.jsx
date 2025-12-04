import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

// Added 'customOrbit' prop to control camera from parent (Scrollytelling)
export default function ModelViewer({ modelUrl, info, pointers, customOrbit }) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const lastClickRef = useRef(0);

  // Defaults
  const pts = pointers || {
    tl: { x: 42, y: 40 }, tr: { x: 58, y: 40 },
    bl: { x: 42, y: 60 }, br: { x: 58, y: 60 }
  };

  const handleDoubleTapDetector = (e) => {
    const now = Date.now();
    if (now - lastClickRef.current < 300) {
      setIsPaused(p => !p);
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
    }
  };

  useEffect(() => {
    const mv = document.querySelector('model-viewer');
    if (mv) mv.addEventListener('progress', e => setProgress(e.detail.totalProgress * 100));
  }, []);

  if (!modelUrl) return null;

  // === ORBIT LOGIC ===
  // 1. If Paused (Popup): Force Front View (0deg 75deg 105%)
  // 2. If Scrolling (customOrbit): Use the scroll angle
  // 3. Default: "auto auto auto"
  const currentOrbit = isPaused 
    ? "0deg 75deg 105%" 
    : (customOrbit || "auto auto auto");

  // Disable auto-rotate if we are manually controlling orbit via scroll
  const shouldAutoRotate = !isPaused && !customOrbit;

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', touchAction: 'none', cursor: 'pointer' }}
      onClick={handleDoubleTapDetector}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');`}</style>

      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        ar ar-modes="webxr scene-viewer quick-look"
        
        camera-controls={!isPaused ? true : undefined}
        
        // Dynamic Orbit
        camera-orbit={currentOrbit}
        camera-target="auto auto auto"
        interpolation-decay="200"
        
        auto-rotate={shouldAutoRotate} 
        auto-rotate-delay="0" 
        rotation-per-second="-60deg"
        
        disable-pan
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <div slot="progress-bar" style={{
             position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
             background:'rgba(0,0,0,0.7)', color:'white', padding:'10px 20px', borderRadius:'8px',
             display: progress >= 100 ? 'none' : 'block'
        }}>Loading... {Math.round(progress)}%</div>
        <button slot="ar-button" style={{position:'absolute', bottom:'20px', right:'20px', padding:'10px 20px', borderRadius:'20px', border:'none'}}>📱 AR View</button>
      </model-viewer>

      {/* Popup Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none',
        opacity: isPaused ? 1 : 0,
        transform: isPaused ? 'scale(1)' : 'scale(0.1)',
        transformOrigin: 'center center',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
           <line x1={`${pts.tl.x}%`} y1={`${pts.tl.y}%`} x2="15%" y2="15%" stroke="blue" strokeWidth="2" />
           <line x1={`${pts.tr.x}%`} y1={`${pts.tr.y}%`} x2="85%" y2="15%" stroke="blue" strokeWidth="2" />
           <line x1={`${pts.bl.x}%`} y1={`${pts.bl.y}%`} x2="15%" y2="85%" stroke="blue" strokeWidth="2" />
           <line x1={`${pts.br.x}%`} y1={`${pts.br.y}%`} x2="85%" y2="85%" stroke="blue" strokeWidth="2" />
        </svg>

        <div style={boxStyle({ top: '10%', left: '5%' })}>{info?.tl}</div>
        <div style={boxStyle({ top: '10%', right: '5%' })}>{info?.tr}</div>
        <div style={boxStyle({ bottom: '10%', left: '5%' })}>{info?.bl}</div>
        <div style={boxStyle({ bottom: '10%', right: '5%' })}>{info?.br}</div>
      </div>
    </div>
  );
}

const boxStyle = (pos) => ({
  position: 'absolute', width: '20%', maxWidth: '160px', minHeight: '30px', padding: '8px',
  backgroundColor: 'rgba(0,0,0, 0.5)', color: 'blue', border: '2px solid blue', borderRadius: '4px',
  textAlign: 'center', pointerEvents: 'auto', fontFamily: '"Orbitron", sans-serif',
  fontSize: 'clamp(10px, 2.5vw, 13px)', fontWeight: '700',
  display: 'flex', alignItems: 'center', justifyContent: 'center', ...pos
});