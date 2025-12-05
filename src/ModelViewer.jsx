import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl, cameraOrbit, enableInteractions }) {
  const [progress, setProgress] = useState(0);
  const viewerRef = useRef(null);

  // 1. Progress Bar Logic
  useEffect(() => {
    const mv = viewerRef.current;
    if (mv) {
      const onProgress = (e) => setProgress(e.detail.totalProgress * 100);
      mv.addEventListener('progress', onProgress);
      return () => mv.removeEventListener('progress', onProgress);
    }
  }, []);

  // 2. Interaction Logic
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv) return;
    if (!enableInteractions && cameraOrbit) {
      mv.cameraTarget = 'auto auto auto';
      mv.fieldOfView = 'auto';
      if (mv.resetTurntableRotation) mv.resetTurntableRotation();
      mv.cameraOrbit = cameraOrbit;
    }
  }, [cameraOrbit, enableInteractions]);

  if (!modelUrl) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Sci-Fi Font & Dynamic AR Button Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');
        
        /* Default Desktop AR Button */
        .ar-button {
            position: absolute;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 20px;
            border: none;
            font-family: 'Orbitron', sans-serif;
            font-weight: bold;
            background: white;
            color: black;
            z-index: 100;
        }

        /* Mobile Adjustment: Lift it up so it doesn't overlap the dock */
        @media (max-width: 768px) {
            .ar-button {
                bottom: 100px; /* Clears the bottom buttons */
                right: 15px;
                padding: 8px 16px;
                font-size: 0.8rem;
                opacity: 0.9;
            }
        }
      `}</style>

      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt="A 3D model"
        ar 
        ar-modes="webxr scene-viewer quick-look"
        camera-controls={enableInteractions}
        auto-rotate={enableInteractions}
        auto-rotate-delay="0"
        rotation-per-second="-60deg"
        camera-orbit={enableInteractions ? undefined : cameraOrbit}
        camera-target="auto auto auto"
        interpolation-decay="200"
        disable-pan='true'
        disable-zoom={!enableInteractions}
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {/* Loading Bar */}
        <div slot="progress-bar" style={{
             position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
             background:'rgba(0,0,0,0.7)', color:'white', padding:'10px 20px', borderRadius:'8px',
             display: progress >= 100 ? 'none' : 'block', fontFamily: 'Orbitron, sans-serif'
        }}>Loading... {Math.round(progress)}%</div>
        
        {/* AR Button with Class for Responsive Positioning */}
        <button slot="ar-button" className="ar-button">
          📱 AR View
        </button>
      </model-viewer>
    </div>
  );
}