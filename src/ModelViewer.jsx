// frontend/src/ModelViewer.jsx

import React, { useEffect, useState } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl }) {
  const [progress, setProgress] = useState(0);
  const [arSupported, setArSupported] = useState(true);

  useEffect(() => {
    const modelViewer = document.querySelector('model-viewer');
    
    // Check AR support
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setArSupported(supported);
        } catch (error) {
          console.log('AR not supported:', error);
          setArSupported(false);
        }
      } else {
        setArSupported(false);
      }
    };

    if (modelViewer) {
      const onProgress = (event) => {
        const { totalProgress } = event.detail;
        setProgress(totalProgress * 100);
      };
      
      modelViewer.addEventListener('progress', onProgress);
      checkARSupport();
      
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
        
        /* Mobile-optimized rotation */
        auto-rotate 
        auto-rotate-delay="0"
        rotation-per-second="-25deg"
        
        /* Better mobile camera setup */
        camera-orbit="0deg 75deg 110%" 
        min-camera-orbit="auto 60deg auto"
        max-camera-orbit="auto 85deg auto"
        
        /* Touch interaction improvements */
        touch-action="pan-y"
        disable-zoom="false"
        
        /* Performance optimizations for mobile */
        loading="eager"
        reveal="auto"
        
        /* Lighting */
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1.0"
        
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
          bottom: '70px',
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
          zIndex: 1000
        }}>
          <span>📱 View in your space</span>
        </button>

        {/* AR Support Warning */}
        {!arSupported && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(255,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 100
          }}>
            AR not supported on this device
          </div>
        )}

      </model-viewer>
    </div>
  );
}