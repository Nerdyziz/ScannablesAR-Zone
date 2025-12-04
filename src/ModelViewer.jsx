import React, { useEffect, useState } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl, cameraOrbit, enableInteractions }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mv = document.querySelector('model-viewer');
    if (mv) mv.addEventListener('progress', e => setProgress(e.detail.totalProgress * 100));
  }, []);

  if (!modelUrl) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');`}</style>

      <model-viewer
        src={modelUrl}
        alt="A 3D model"
        ar 
        ar-modes="webxr scene-viewer quick-look"
        
        // === DYNAMIC INTERACTION LOGIC ===
        // If enableInteractions is TRUE (at the end of scroll):
        // 1. Enable manual controls
        // 2. Enable Auto-Rotate
        // 3. Enable Zoom/Pan
        camera-controls={enableInteractions}
        auto-rotate={enableInteractions}
        
        // If interactive, use "auto" (default). If scrolling, use the specific angle.
        camera-orbit={enableInteractions ? "auto auto auto" : (cameraOrbit || "0deg 75deg 105%")}
        
        interpolation-decay="200"
        
        // Disable Zoom/Pan ONLY while scrolling (to keep the user focused)
        // Re-enable them when at the end
        disable-pan={!enableInteractions}
        disable-zoom={!enableInteractions}
        
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <div slot="progress-bar" style={{
             position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
             background:'rgba(0,0,0,0.7)', color:'white', padding:'10px 20px', borderRadius:'8px',
             display: progress >= 100 ? 'none' : 'block', fontFamily: 'Orbitron, sans-serif'
        }}>Loading... {Math.round(progress)}%</div>
      </model-viewer>
    </div>
  );
}