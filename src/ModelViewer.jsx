import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

// (Removed the unused useLongPress hook here)

export default function ModelViewer({ modelUrl, info }) {
  const [progress, setProgress] = useState(0);
  // Controls rotation and popup visibility. True = popup open, rotation stopped.
  const [isPaused, setIsPaused] = useState(false);
  
  // Ref to store the timestamp of the last click for detecting double taps
  const lastClickRef = useRef(0);

  // --- DOUBLE TAP LOGIC ---
  const handleDoubleTapDetector = (e) => {
    // Prevent default browser zooming behavior on double tap
    if (e.type === 'touchstart') {
       // e.preventDefault(); // Sometimes needed on mobile, but can block model interaction. 
       // Trying via CSS 'touch-action: none' on container first.
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms window to consider it a double tap

    if (now - lastClickRef.current < DOUBLE_TAP_DELAY) {
      // === Double Tap Detected ===
      // Toggle the paused state (open/close popup)
      setIsPaused(prevState => !prevState);
      // Reset timer so a "triple tap" doesn't trigger it again instantly
      lastClickRef.current = 0;
    } else {
      // === Single Tap (so far) ===
      // Record time of this tap
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
    /* Main Container 
       - Added 'touchAction: none' to prevent browser zoom on double-tap on mobile devices.
       - Using onClick to catch both mouse clicks and finger taps.
    */
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        touchAction: 'none', // Important: Prevents browser zoom on double tap
        cursor: 'pointer'    // Suggests interaction
      }}
      onClick={handleDoubleTapDetector}
    >
      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        
        // CONTROLS ROTATION: Stops when paused (popup open)
        auto-rotate={!isPaused} 
        
        auto-rotate-delay="0"
        rotation-per-second="-60deg"
        
        // Panning is disabled as per original requirements
        disable-pan 
        // Disabling zoom ensures our double tap doesn't fight with model viewer zoom
        disable-zoom

        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {/* Progress Bar */}
        <div slot="progress-bar" style={{
             position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
             background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '8px',
             color: 'white', display: progress >= 100 ? 'none' : 'block', pointerEvents: 'none'
        }}>
           Loading... {Math.round(progress)}%
        </div>

        {/* AR Button */}
        <button slot="ar-button" style={{
          position: 'absolute', bottom: '20px', right: '20px', padding: '12px 24px',
          backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '30px',
          fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100
        }}>
          <span>📱 View in your space</span>
        </button>
      </model-viewer>

      {/* --- POPUP OVERLAY SECTION (Shows only when paused) --- */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 10,
          pointerEvents: 'none' // Clicks pass through this layer to the container div
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

// Helper style for the boxes (unchanged)
const boxStyle = (pos) => ({
  position: 'absolute',
  width: '150px',
  minHeight: '30px',
  padding: '10px',
  backgroundColor: 'white',
  border: '2px solid blue',
  borderRadius: '4px',
  textAlign: 'center',
  pointerEvents: 'auto', // Allow text selection in boxes
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  ...pos
});