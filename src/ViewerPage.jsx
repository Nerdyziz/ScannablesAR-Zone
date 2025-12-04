import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
import './ViewerPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// === SCROLLYTELLING CONFIG ===
// Define your "Story" points here. 
// "orbit" format: "Azimuth(Horizontal) Elevation(Vertical) Zoom%"
const SCROLL_SECTIONS = [
  { id: 0, title: "THE ICONIC FIT", desc: "Designed for the streets.", orbit: "0deg 75deg 105%" },       // Front
  { id: 1, title: "SIGNATURE PROFILE", desc: "Sleek silhouette from every angle.", orbit: "90deg 75deg 105%" }, // Side
  { id: 2, title: "BACK DETAILS", desc: "Premium stitching and construction.", orbit: "180deg 75deg 105%" },  // Back
  { id: 3, title: "OVERSIZED HOOD", desc: "Maximum comfort and coverage.", orbit: "0deg 30deg 60%" }      // Top-down Zoom
];

function ViewerPage() {
  const [model, setModel] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Scrollytelling State
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    // 1. Fetch Model Data
    const path = window.location.pathname;
    const shortId = path.split('/').pop();

    (async () => {
      try {
        const res = await fetch(`${API}/api/models/${shortId}`);
        if (!res.ok) throw new Error('Model not found');
        const data = await res.json();
        setModel(data);
      } catch (err) { setError(err.message); } 
      finally { setLoading(false); }
    })();

    // 2. Scroll Listener
    const handleScroll = () => {
      // Calculate which section is currently in view
      // We divide scrollY by window height to get "pages scrolled"
      const pageIndex = Math.round(window.scrollY / window.innerHeight);
      
      // Clamp index between 0 and last section
      const targetIndex = Math.min(Math.max(pageIndex, 0), SCROLL_SECTIONS.length - 1);
      
      setActiveSection(targetIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="viewer-skeleton">Loading...</div>;
  if (error) return <div className="viewer-skeleton error">{error}</div>;

  return (
    <div className="viewer-page" style={{ 
      // Make page tall enough to scroll (100vh per section)
      height: `${SCROLL_SECTIONS.length * 100}vh`, 
      background: '#050505' 
    }}>
      
      {/* === STICKY VIEWER CONTAINER === */}
      <div style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1
      }}>
        {/* Header (Overlay) */}
        <header style={{ position:'absolute', top:0, left:0, width:'100%', padding:'20px', zIndex:10, display:'flex', justifyContent:'space-between' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>
             SCANNABLES <span style={{ color: '#00f' }}>ARZONE</span>
          </div>
          <div style={{ color: 'white' }}>👁 {model.views} views</div>
        </header>

        {/* 3D Model */}
        <ModelViewer 
          modelUrl={model.url} 
          info={model.info} 
          pointers={model.pointers}
          // Pass the orbit based on scroll position
          customOrbit={SCROLL_SECTIONS[activeSection].orbit}
        />
        
        {/* Scroll Prompt (Only on first section) */}
        {activeSection === 0 && (
          <div style={{
            position:'absolute', bottom:'30px', left:'50%', transform:'translateX(-50%)',
            color:'white', opacity:0.7, animation:'bounce 2s infinite'
          }}>
            ↓ Scroll to Explore
          </div>
        )}
      </div>

      {/* === SCROLLABLE TEXT SECTIONS === */}
      {/* These are invisible trigger zones that sit on top of the layout 
          but allow clicks to pass through to the model via pointer-events: none */}
      <div style={{ position: 'absolute', top: 0, width: '100%', zIndex: 2, pointerEvents: 'none' }}>
        {SCROLL_SECTIONS.map((section, index) => (
          <div key={section.id} style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'flex-end', // Text at bottom
            justifyContent: 'flex-start',
            padding: '40px',
            boxSizing: 'border-box'
          }}>
            {/* Text Card */}
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderLeft: '4px solid blue',
              color: 'white',
              maxWidth: '300px',
              // Fade in/out based on active status
              opacity: activeSection === index ? 1 : 0,
              transform: activeSection === index ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.5s ease'
            }}>
              <h2 style={{ margin:'0 0 10px 0', fontFamily:'Orbitron, sans-serif' }}>{section.title}</h2>
              <p style={{ margin:0, lineHeight:'1.5' }}>{section.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Animation Keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateX(-50%) translateY(0);}
          40% {transform: translateX(-50%) translateY(-10px);}
          60% {transform: translateX(-50%) translateY(-5px);}
        }
      `}</style>
    </div>
  );
}

export default ViewerPage;