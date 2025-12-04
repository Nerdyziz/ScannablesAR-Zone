import React, { useEffect, useState } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl, cameraOrbit }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mv = document.querySelector('model-viewer');
    if (mv) mv.addEventListener('progress', e => setProgress(e.detail.totalProgress * 100));
  }, []);

  if (!modelUrl) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Import Sci-Fi Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');`}</style>

      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        
        // === CORE SETTINGS ===
        ar 
        ar-modes="webxr scene-viewer quick-look"
        
        // Disable manual camera controls so the Scroll controls the rotation
        camera-controls={false}
        
        // Orbit is passed dynamically from the parent (ViewerPage)
        camera-orbit={cameraOrbit || "0deg 75deg 105%"}
        
        // This ensures the camera moves smoothly to the new angle
        interpolation-decay="200"
        
        // Prevent manual panning/zooming to keep the scrollytelling consistent
        disable-pan
        disable-zoom
        
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {/* Loading Bar */}
        <div slot="progress-bar" style={{
             position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
             background:'rgba(0,0,0,0.7)', color:'white', padding:'10px 20px', borderRadius:'8px',
             display: progress >= 100 ? 'none' : 'block', fontFamily: 'Orbitron, sans-serif'
        }}>Loading... {Math.round(progress)}%</div>
      </model-viewer>
    </div>
  );
}