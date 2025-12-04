import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
import './ViewerPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ViewerPage() {
  const [model, setModel] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Model
  useEffect(() => {
    const shortId = window.location.pathname.split('/').pop();
    fetch(`${API}/api/models/${shortId}`)
      .then(res => res.json())
      .then(data => {
        if(data.error) throw new Error(data.error);
        setModel(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Handle Scroll
  useEffect(() => {
    const handleScroll = () => {
      // Calculate which "Page" we are on (0, 1, 2, or 3)
      const scrollPosition = window.scrollY + (window.innerHeight / 3); // Trigger slightly early
      const sectionIndex = Math.floor(scrollPosition / window.innerHeight);
      
      // Keep within bounds (0 to 3)
      const safeIndex = Math.max(0, Math.min(sectionIndex, 3));
      setActiveSection(safeIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div style={{color:'white', padding:'20px'}}>Loading Model...</div>;
  if (error) return <div style={{color:'red', padding:'20px'}}>Error: {error}</div>;

  // === DYNAMIC CONTENT CONFIGURATION ===
  // We map the 4 text fields from Admin (tl, tr, bl, br) to 4 narrative sections
  const sections = [
    { 
      id: 0, 
      label: "FRONT VIEW", 
      text: model.info?.tl || "Detailed Front Profile", 
      orbit: "0deg 75deg 105%"  // Front
    },
    { 
      id: 1, 
      label: "SIDE PROFILE", 
      text: model.info?.tr || "Sleek Side Silhouette", 
      orbit: "90deg 75deg 105%" // Side
    },
    { 
      id: 2, 
      label: "BACK DESIGN", 
      text: model.info?.bl || "Signature Back Details", 
      orbit: "180deg 75deg 105%" // Back
    },
    { 
      id: 3, 
      label: "FABRIC & MATERIAL", 
      text: model.info?.br || "Premium Quality Material", 
      orbit: "0deg 30deg 60%"   // Top Zoom
    }
  ];

  return (
    <div className="scrolly-container" style={{ backgroundColor: '#050505', minHeight: '400vh' }}>
      
      {/* === BACKGROUND LAYER (FIXED 3D MODEL) === */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0 // Behind the text
      }}>
        <ModelViewer 
          modelUrl={model.url} 
          cameraOrbit={sections[activeSection].orbit} 
        />
        
        {/* Persistent Overlay Header */}
        <div style={{ 
          position: 'absolute', top: 20, left: 20, zIndex: 10,
          fontFamily: 'Orbitron, sans-serif', color: 'white', fontSize: '1.2rem' 
        }}>
          SCANNABLES <span style={{ color: '#00f' }}>ARZONE</span>
        </div>
        
        {/* Scroll Indicator (Only visible on first section) */}
        <div style={{
            position: 'absolute', bottom: 30, width: '100%', textAlign: 'center',
            color: 'white', opacity: activeSection === 0 ? 0.7 : 0, transition: 'opacity 0.5s',
            animation: 'bounce 2s infinite', pointerEvents: 'none'
        }}>
          ↓ SCROLL TO EXPLORE
        </div>
      </div>

      {/* === FOREGROUND LAYER (SCROLLING TEXT) === */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {sections.map((section, index) => (
          <div key={section.id} style={{
            height: '100vh', // Each section takes full screen height
            display: 'flex',
            alignItems: 'center', // Vertically center
            justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end', // Alternating Left/Right
            padding: '10%',
            boxSizing: 'border-box'
          }}>
            {/* Text Card */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #333',
              borderLeft: '4px solid blue',
              padding: '30px',
              maxWidth: '300px',
              color: 'white',
              fontFamily: 'Orbitron, sans-serif',
              // Animation based on visibility
              opacity: activeSection === index ? 1 : 0.3,
              transform: activeSection === index ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease-out'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#00f', fontSize: '0.9rem' }}>
                0{index + 1} // {section.label}
              </h3>
              <p style={{ margin: 0, fontSize: '1.2rem', lineHeight: '1.5' }}>
                {section.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }
        body { margin: 0; overflow-x: hidden; background: #050505; }
      `}</style>
    </div>
  );
}

export default ViewerPage;