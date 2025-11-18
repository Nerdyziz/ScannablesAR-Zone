// frontend/src/ModelViewer.jsx
import React, { useEffect, useState } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl }) {
  const [progress, setProgress] = useState(0);

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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        auto-rotate-delay="0"
        
        /* FIXED: Removed strict 90deg lock and disable-pan. 
           These settings often make the model invisible on mobile 
           because the Viewport clips the fixed angle. */
        
        rotation-per-second="-60deg"
        shadow-intensity="1"
        touch-action="pan-y" 
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {/* Custom Progress Bar */}
        <div slot="progress-bar" style={{
             position: 'absolute',
             top: '50%', left: '50%',
             transform: 'translate(-50%, -50%)',
             background: 'rgba(0,0,0,0.7)',
             padding: '10px 20px',
             borderRadius: '8px',
             color: 'white',
             display: progress >= 100 ? 'none' : 'block',
             pointerEvents: 'none'
        }}>
           Loading... {Math.round(progress)}%
        </div>

        {/* Custom AR Button */}
        <button slot="ar-button" style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '12px 24px',
          backgroundColor: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 100
        }}>
          <span>📱 View in your space</span>
        </button>

      </model-viewer>
    </div>
  );
}