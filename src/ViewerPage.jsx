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
      // Calculate active section based on scroll position
      const scrollPosition = window.scrollY + (window.innerHeight / 2); 
      const sectionIndex = Math.floor(scrollPosition / window.innerHeight);
      const safeIndex = Math.max(0, Math.min(sectionIndex, 3));
      setActiveSection(safeIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div style={{color:'white', padding:'20px'}}>Loading Model...</div>;
  if (error) return <div style={{color:'red', padding:'20px'}}>Error: {error}</div>;

  // Map Admin Text to Sections
  const sections = [
    { id: 0, label: "FRONT VIEW", text: model.info?.tl || "Detailed Front Profile", orbit: "0deg 75deg 105%" },
    { id: 1, label: "SIDE PROFILE", text: model.info?.tr || "Sleek Side Silhouette", orbit: "90deg 75deg 105%" },
    { id: 2, label: "BACK DESIGN", text: model.info?.bl || "Signature Back Details", orbit: "180deg 75deg 105%" },
    { id: 3, label: "FABRIC & MATERIAL", text: model.info?.br || "Premium Quality Material", orbit: "0deg 30deg 60%" }
  ];

  return (
    <div className="scrolly-container">
      
      {/* === BACKGROUND LAYER (FIXED 3D MODEL) === */}
      <div className="fixed-background">
        <ModelViewer 
          modelUrl={model.url} 
          cameraOrbit={sections[activeSection].orbit} 
        />
        
        {/* Header */}
        <div className="overlay-header">
          SCANNABLES <span style={{ color: '#00f' }}>ARZONE</span>
        </div>
        
        {/* Scroll Indicator (Only on first section) */}
        <div className={`scroll-hint ${activeSection === 0 ? 'visible' : ''}`}>
          ↓ SCROLL TO EXPLORE
        </div>
      </div>

      {/* === FOREGROUND LAYER (SCROLLING TEXT) === */}
      <div className="scroll-content">
        {sections.map((section, index) => (
          <div key={section.id} className={`section-wrapper ${index % 2 === 0 ? 'left' : 'right'}`}>
            
            {/* Text Card */}
            <div className={`text-card ${activeSection === index ? 'active' : ''}`}>
              <h3>0{index + 1} // {section.label}</h3>
              <p>{section.text}</p>
            </div>

          </div>
        ))}
      </div>

      {/* === CSS STYLES (Responsive) === */}
      <style>{`
        /* --- GLOBAL & ANIMATIONS --- */
        body { margin: 0; background: #050505; overflow-x: hidden; }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }

        /* --- LAYOUT CONTAINERS --- */
        .scrolly-container {
          min-height: 400vh;
          /* Snap scrolling for better mobile feel */
          scroll-snap-type: y mandatory; 
        }

        .fixed-background {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100vh;
          z-index: 0;
        }

        .scroll-content {
          position: relative;
          z-index: 1;
        }

        /* --- HEADER & HINT --- */
        .overlay-header {
          position: absolute; top: 20px; left: 20px; z-index: 10;
          font-family: 'Orbitron', sans-serif; color: white; font-size: 1.2rem;
        }

        .scroll-hint {
          position: absolute; bottom: 80px; width: 100%; text-align: center;
          color: white; font-family: 'Orbitron', sans-serif; font-size: 0.8rem;
          opacity: 0; transition: opacity 0.5s;
          pointer-events: none;
        }
        .scroll-hint.visible {
          opacity: 0.7;
          animation: bounce 2s infinite;
        }

        /* --- SECTION WRAPPERS --- */
        .section-wrapper {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center; /* Vertically center by default */
          padding: 20px;
          box-sizing: border-box;
          scroll-snap-align: start; /* Snap to top of section */
        }

        /* --- TEXT CARDS --- */
        .text-card {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px); /* Safari support */
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 4px solid blue;
          padding: 25px;
          max-width: 300px;
          color: white;
          font-family: 'Orbitron', sans-serif;
          
          /* Animation State */
          opacity: 0.3;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .text-card.active {
          opacity: 1;
          transform: translateY(0);
        }

        .text-card h3 {
          margin: 0 0 10px 0;
          color: #00f;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .text-card p {
          margin: 0;
          line-height: 1.5;
          font-size: clamp(1rem, 4vw, 1.2rem); /* Responsive Font Size */
        }

        /* === DESKTOP LAYOUT (Min-width: 769px) === */
        @media (min-width: 769px) {
          .section-wrapper.left { justify-content: flex-start; padding-left: 10%; }
          .section-wrapper.right { justify-content: flex-end; padding-right: 10%; }
          .section-wrapper.right .text-card {
            border-left: none;
            border-right: 4px solid blue;
            text-align: right;
          }
        }

        /* === MOBILE LAYOUT (Max-width: 768px) === */
        @media (max-width: 768px) {
          .section-wrapper {
            align-items: flex-end; /* Keep text at bottom */
            padding-bottom: 80px; /* Space for AR button/UI */
          }
          
          /* RESTORE LEFT/RIGHT POSITIONING ON MOBILE */
          .section-wrapper.left { justify-content: flex-start; padding-left: 15px; }
          .section-wrapper.right { justify-content: flex-end; padding-right: 15px; }

          .text-card {
            width: 75%;      
            max-width: 300px;
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5));
          }

          /* LEFT CARD STYLE */
          .section-wrapper.left .text-card {
            border-left: 4px solid blue;
            text-align: left;
          }

          /* RIGHT CARD STYLE (Border on Right) */
          .section-wrapper.right .text-card {
            border-left: none;
            border-right: 4px solid blue;
            text-align: right;
          }
          
          .overlay-header { top: 15px; left: 15px; font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}

export default ViewerPage;