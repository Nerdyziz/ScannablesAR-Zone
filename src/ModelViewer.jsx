import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

// Helper to detect long press
function useLongPress(callback = () => {}, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timerId;
    if (startLongPress) {
      timerId = setTimeout(callback, ms);
    } else {
      clearTimeout(timerId);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [startLongPress, callback, ms]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
}

export default function ModelViewer({ modelUrl, info }) { // Accept 'info' prop
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // Controls rotation and popups
  
  // Logic: Long press -> Open. Single Click while open -> Close.
  const handleLongPress = () => {
    if (!isPaused) {
      setIsPaused(true);
    }
  };

  const longPressEvents = useLongPress(handleLongPress, 500); // 500ms long press

  // Logic: If paused, any click closes it
  const handleContainerClick = () => {
    if (isPaused) {
      setIsPaused(false);
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
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      onClick={handleContainerClick}
      {...longPressEvents} // Attach long press listeners
    >
      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        
        // CONTROLS ROTATION BASED ON POPUP STATE
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

      {/* --- POPUP OVERLAY SECTION --- */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 10,
          pointerEvents: 'none' // Allow click-through for the "Close" click
        }}>
          {/* SVG Lines */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
             {/* Top Left Line */}
             <line x1="50%" y1="50%" x2="15%" y2="15%" stroke="blue" strokeWidth="2" />
             {/* Top Right Line */}
             <line x1="50%" y1="50%" x2="85%" y2="15%" stroke="blue" strokeWidth="2" />
             {/* Bottom Left Line */}
             <line x1="50%" y1="50%" x2="15%" y2="85%" stroke="blue" strokeWidth="2" />
             {/* Bottom Right Line */}
             <line x1="50%" y1="50%" x2="85%" y2="85%" stroke="blue" strokeWidth="2" />
          </svg>

          {/* BOXES */}
          {/* Top Left */}
          <div style={boxStyle({ top: '10%', left: '5%' })}>
            {info?.tl || 'Top Left Info'}
          </div>

          {/* Top Right */}
          <div style={boxStyle({ top: '10%', right: '5%' })}>
             {info?.tr || 'Top Right Info'}
          </div>

          {/* Bottom Left */}
          <div style={boxStyle({ bottom: '10%', left: '5%' })}>
             {info?.bl || 'Bottom Left Info'}
          </div>

          {/* Bottom Right */}
          <div style={boxStyle({ bottom: '10%', right: '5%' })}>
             {info?.br || 'Bottom Right Info'}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper style for the boxes
const boxStyle = (pos) => ({
  position: 'absolute',
  width: '150px',
  padding: '10px',
  backgroundColor: 'white',
  border: '2px solid blue',
  borderRadius: '4px',
  textAlign: 'center',
  pointerEvents: 'auto', // Allow text selection if needed
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  ...pos
});