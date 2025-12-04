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
        
        // === INTERACTION LOGIC ===
        camera-controls={enableInteractions}
        auto-rotate={enableInteractions}
        auto-rotate-delay="0"
        rotation-per-second="-60deg" // Slower auto-rotate for classier feel
        
        // === FIX FOR MISALIGNMENT ===
        // 1. When Interactive: Pass undefined. This lets the user/auto-rotate control the camera fully without fighting "auto".
        // 2. When Scrolling: Pass the specific angle (e.g. "0deg 75deg 105%").
        camera-orbit={enableInteractions ? undefined : (cameraOrbit || "0deg 75deg 105%")}
        
        // Reset panning target when scrolling so model is always centered
        camera-target="auto auto auto"
        
        // === SNAP SPEED ===
        // 200 = Tighter/Faster tracking. 
        // This ensures the model aligns with the text cards quickly when you scroll up.
        interpolation-decay="200"
        
        // Lock controls when scrolling
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