import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl, info }) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const lastClickRef = useRef(0);

  // --- DOUBLE TAP LOGIC ---
  const handleDoubleTapDetector = (e) => {
    // We do NOT prevent default here so gestures like pinch-to-zoom still work 
    // for the model-viewer, but we capture the tap timing.
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; 

    if (now - lastClickRef.current < DOUBLE_TAP_DELAY) {
      // Toggle popup on double tap
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
        // touch-action: none allows the model-viewer to handle pinch-zoom 
        // without the browser zooming the whole page
        touchAction: 'none', 
        cursor: 'pointer'
      }}
      onClick={handleDoubleTapDetector}
    >
      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        
        // PAUSE ROTATION WHEN POPUP IS OPEN
        auto-rotate={!isPaused} 
        auto-rotate-delay="0"
        rotation-per-second="-60deg"
        
        disable-pan 
        // REMOVED 'disable-zoom' TO ENABLE ZOOMING
        
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
      {isPaused && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 10, pointerEvents: 'none'
        }}>
          {/* SVG Lines */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
             <line x1="50%" y1="50%" x2="15%" y2="15%" stroke="blue" strokeWidth="2" />
             <line x1="50%" y1="50%" x2="85%" y2="15%" stroke="blue" strokeWidth="2" />
             <line x1="50%" y1="50%" x2="15%" y2="85%" stroke="blue" strokeWidth="2" />
             <line x1="50%" y1="50%" x2="85%" y2="85%" stroke="blue" strokeWidth="2" />
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
      )}
    </div>
  );
}

// === RESPONSIVE STYLE HELPER ===
const boxStyle = (pos) => ({
  position: 'absolute',
  
  // Responsive Width: 
  // - 38% ensures two boxes fit side-by-side on mobile (38+38=76%)
  // - maxWidth keeps them from looking huge on desktop
  width: '38%', 
  maxWidth: '160px',
  
  minHeight: '30px',
  padding: '8px',
  
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'blue',
  border: '2px solid blue',
  borderRadius: '4px',
  textAlign: 'center',
  pointerEvents: 'auto',
  
  // Responsive Font: Clamps between 11px and 14px based on viewport width
  fontSize: 'clamp(11px, 2.5vw, 14px)',
  fontWeight: 'bold',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  
  // Flex centering
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  
  // Merge the specific position (top/left/etc)
  ...pos
});