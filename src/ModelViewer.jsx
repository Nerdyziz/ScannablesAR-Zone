import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

export default function ModelViewer({ modelUrl, cameraOrbit, enableInteractions }) {
  const [progress, setProgress] = useState(0);
  // Ref to access the actual DOM element of the viewer
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

  // 2. HARD RESET LOGIC (Smoothed)
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv) return;

    // If we are exiting "Explore Mode" (entering a Fixed View like Front/Back)
    if (!enableInteractions && cameraOrbit) {
      
      // A. Reset Panning (Center the model)
      mv.cameraTarget = 'auto auto auto';
      
      // B. Reset FOV (Fixes the "Zoom Scale" issue)
      // Pinch-zooming changes FOV; we must reset it to 'auto' to get back to default zoom.
      mv.fieldOfView = 'auto';
      
      // C. Reset Rotation Offset
      // This ensures "0deg" is truly Front.
      if (mv.resetTurntableRotation) {
        mv.resetTurntableRotation();
      }
      
      // D. Apply the Target Angle
      mv.cameraOrbit = cameraOrbit;
      
      // E. REMOVED jumpCameraToGoal() 
      // By removing this line, the camera will now GLIDE to the new position 
      // instead of snapping instantly.
    }
  }, [cameraOrbit, enableInteractions]);

  if (!modelUrl) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Sci-Fi Font Import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');`}</style>

      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt="A 3D model"
        ar 
        ar-modes="webxr scene-viewer quick-look"
        
        // === INTERACTION ===
        camera-controls={enableInteractions}
        
        // Auto-Rotate: Enabled in Explore mode
        auto-rotate={enableInteractions}
        auto-rotate-delay="0"
        rotation-per-second="-30deg" // Gentle spin
        
        // === ORBIT INPUT ===
        // Interactive: undefined (Let user/auto control it)
        // Fixed: cameraOrbit (Target angle)
        camera-orbit={enableInteractions ? undefined : cameraOrbit}
        
        // Always center
        camera-target="auto auto auto"
        
        // === MOVEMENT SPEED ===
        // 200ms decay makes the "Glide" logic work. 
        // It creates the smooth transition you wanted.
        interpolation-decay="200"
        
        // Lock manual controls when in "View" mode
        disable-pan={!enableInteractions}
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
        
        {/* AR Button */}
        <button slot="ar-button" style={{
          position:'absolute', bottom:'20px', right:'20px', padding:'10px 20px', 
          borderRadius:'20px', border:'none', fontFamily: 'Orbitron, sans-serif', fontWeight: 'bold'
        }}>📱 AR View</button>
      </model-viewer>
    </div>
  );
}