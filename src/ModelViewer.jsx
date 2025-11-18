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
        
        /* --- ROTATION & ANIMATION --- */
        auto-rotate 
        auto-rotate-delay="0"
        rotation-per-second="-30deg" /* Slower, smoother spin */
        disable-pan 

        /* --- CAMERA FIXES FOR MOBILE --- */
        /* 105% radius ensures the model fits in the viewport */
        camera-orbit="0deg 75deg 105%" 
        
        /* Lock vertical angle to 75deg (slight top-down view) */
        min-camera-orbit="auto 75deg auto" 
        max-camera-orbit="auto 75deg auto"

        /* --- LIGHTING --- */
        shadow-intensity="1"
        environment-image="neutral" /* Ensures model is lit even on dark backgrounds */
        
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
             pointerEvents: 'none',
             zIndex: 10
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