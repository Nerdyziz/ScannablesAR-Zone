import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
import './ViewerPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ViewerPage() {
  const [model, setModel] = useState(null);
  const [activeTab, setActiveTab] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Model Data
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

  if (loading) return <div style={{color:'white', padding:'20px', background:'#050505', height:'100vh'}}>Loading Model...</div>;
  if (error) return <div style={{color:'red', padding:'20px', background:'#050505', height:'100vh'}}>Error: {error}</div>;

  const tabs = [
    { id: 0, label: "FRONT", title: "FRONT PROFILE", text: model.info?.tl || "Detailed Front Profile", orbit: "0deg 75deg 105%" },
    { id: 1, label: "SIDE", title: "SIDE SILHOUETTE", text: model.info?.tr || "Sleek Side Silhouette", orbit: "90deg 75deg 105%" },
    { id: 2, label: "BACK", title: "BACK DETAILS", text: model.info?.bl || "Signature Back Details", orbit: "180deg 75deg 105%" },
    { id: 3, label: "FABRIC", title: "MATERIAL ZOOM", text: model.info?.br || "Premium Quality Material", orbit: "0deg 30deg 60%" },
    { id: 4, label: "EXPLORE", title: "INTERACTIVE MODE", text: "Touch & Drag to rotate.", orbit: null } 
  ];

  const currentTab = tabs[activeTab];

  return (
    <div className="hud-container">
      
      {/* === LAYER 1: 3D MODEL === */}
      <div className="model-layer">
        <ModelViewer 
          modelUrl={model.url} 
          cameraOrbit={currentTab.orbit}
          enableInteractions={activeTab === 4}
        />
      </div>

      {/* === LAYER 2: HUD INTERFACE === */}
      <div className="hud-layer">
        
        {/* Header */}
        <div className="hud-header">
          <div className="brand">SCANNABLES <span style={{color:'#00f'}}>ARZONE</span></div>
          <div className="meta desktop-only">ID: {model.shortId}</div>
        </div>

        {/* Info Terminal (Hides in Explore Mode) */}
        {activeTab !== 4 && (
          <div className="info-terminal">
            <div className="terminal-header"><span className="blink">●</span> LIVE DATA</div>
            <h3>{currentTab.title}</h3>
            <p key={activeTab} className="typewriter">{currentTab.text}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="control-buttons-container">
            {tabs.map((tab, index) => (
              <button 
                key={tab.id}
                className={`dock-btn btn-${index} ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
              </button>
            ))}
        </div>

      </div>

      {/* === CSS STYLES === */}
      <style>{`
        /* --- GLOBAL --- */
        body { margin: 0; background: #050505; overflow: hidden; font-family: 'Orbitron', sans-serif; }
        .hud-container { width: 100vw; height: 100vh; position: relative; }
        .model-layer { width: 100%; height: 100%; position: absolute; z-index: 0; }
        .hud-layer { width: 100%; height: 100%; position: absolute; z-index: 10; pointer-events: none; }

        /* --- HEADER --- */
        .hud-header {
          padding: 20px; display: flex; justify-content: space-between; align-items: center;
          color: white; letter-spacing: 1px; pointer-events: auto;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
        }
        .brand { font-size: 1.2rem; font-weight: 700; }
        .meta { font-size: 0.8rem; opacity: 0.7; color: #00f; }

        /* --- DESKTOP DEFAULT STYLES --- */
        .info-terminal {
          position: absolute; top: 20%; left: 5%; 
          width: 300px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid #333;
          border-left: 4px solid blue;
          padding: 20px;
          color: white;
          pointer-events: auto;
          animation: slideIn 0.5s ease-out;
        }
        .info-terminal h3 { margin: 0 0 10px 0; font-size: 1.1rem; }
        .info-terminal p { margin: 0; font-size: 0.9rem; line-height: 1.6; opacity: 0.9; }
        .terminal-header { font-size: 0.7rem; color: #00f; margin-bottom: 10px; }
        .blink { animation: blink 1s infinite; }

        .control-buttons-container {
          position: absolute; bottom: 0; width: 100%;
          padding-bottom: 30px;
          background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
          pointer-events: auto;
          display: flex; justify-content: center; gap: 10px;
          padding-top: 40px;
        }

        .dock-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 24px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
          clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%);
        }
        .dock-btn:hover { background: rgba(0, 0, 255, 0.2); border-color: blue; }
        .dock-btn.active { background: blue; color: white; border-color: blue; text-shadow: 0 0 10px rgba(255,255,255,0.5); }

        .typewriter {
          overflow: hidden; border-right: 2px solid blue; white-space: normal; 
          animation: typing 2s steps(40, end), blink-caret .75s step-end infinite;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes typing { from { max-height: 0; } to { max-height: 100px; } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: blue; } }

        /* === MOBILE LAYOUT (REDESIGNED) === */
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .hud-header { padding: 15px; }

          /* 1. INFO CARD: Moved to BOTTOM (Above buttons) */
          .info-terminal {
            top: auto; 
            bottom: 70px; /* Sits securely above the bottom buttons */
            left: 10px; right: 10px;
            width: auto;
            max-width: none;
            padding: 12px 15px;
            border-left: none; 
            border-top: 2px solid blue;
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6));
            animation: slideUp 0.5s ease-out;
          }
          .info-terminal h3 { font-size: 0.9rem; margin-bottom: 4px; color: #fff; }
          .info-terminal p { font-size: 0.8rem; line-height: 1.3; color: #ccc; }

          /* 2. BUTTON CONTAINER: Full screen overlay for positioning */
          .control-buttons-container {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: none; padding: 0; pointer-events: none;
            display: block;
          }

          /* 3. BUTTON STYLES: Small, Compact, Touch-friendly */
          .dock-btn {
            position: absolute;
            pointer-events: auto;
            font-size: 0.65rem;
            padding: 8px 12px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            clip-path: none;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .dock-btn.active { background: rgba(0, 0, 255, 0.8); border-color: #00f; }

          /* 4. BUTTON POSITIONS */
          /* Top Corners */
          .btn-0 { top: 70px; left: 15px; }   /* FRONT */
          .btn-1 { top: 70px; right: 15px; }  /* SIDE */

          /* Bottom Row (Left, Center, Right) */
          .btn-2 { bottom: 30px; left: 15px; } /* BACK */
          .btn-3 { bottom: 30px; right: 15px; }/* FABRIC */
          
          /* Explore Button (Center Bottom) */
          .btn-4 {
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            background: rgba(0, 0, 255, 0.2);
            border: 1px solid blue;
            font-weight: bold;
            font-size: 0.75rem;
          }
          .btn-4.active { background: blue; box-shadow: 0 0 15px blue; }
        }
      `}</style>
    </div>
  );
}

export default ViewerPage;