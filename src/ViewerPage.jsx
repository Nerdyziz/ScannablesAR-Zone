import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
import './ViewerPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ViewerPage() {
  const [model, setModel] = useState(null);
  const [activeTab, setActiveTab] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  if (loading) return <div className="loading-screen">INITIALIZING SCAN...</div>;
  if (error) return <div className="error-screen">SYSTEM ERROR: {error}</div>;

  const tabs = [
    { id: 0, label: "FRONT", title: "FRONT PROFILE", text: model.info?.tl || "Detailed Front Profile", orbit: "0deg 75deg 105%" },
    { id: 1, label: "SIDE", title: "SIDE SILHOUETTE", text: model.info?.tr || "Sleek Side Silhouette", orbit: "90deg 75deg 105%" },
    { id: 2, label: "BACK", title: "BACK DETAILS", text: model.info?.bl || "Signature Back Details", orbit: "180deg 75deg 105%" },
    { id: 3, label: "FABRIC", title: "MATERIAL ZOOM", text: model.info?.br || "Premium Quality Material", orbit: "0deg 30deg 60%" },
    { id: 4, label: "EXPLORE", title: "INTERACTIVE", text: "Touch & Drag to rotate.", orbit: null } 
  ];

  const currentTab = tabs[activeTab];

  return (
    <div className="app-container">
      
      {/* === SECTION 1: HEADER (Static, Solid Background) === */}
      <header className="app-header">
        <div className="brand">SCANNABLES <span style={{color:'#00f'}}>ARZONE</span></div>
        <div className="meta">ID: {model.shortId}</div>
      </header>

      {/* === SECTION 2: VIEWPORT (Takes remaining space) === */}
      <main className="viewport-area">
        
        {/* Layer A: 3D Model */}
        <div className="model-layer">
          <ModelViewer 
            modelUrl={model.url} 
            cameraOrbit={currentTab.orbit}
            enableInteractions={activeTab === 4}
          />
        </div>

        {/* Layer B: UI Overlay (Info + Buttons) */}
        <div className="ui-layer">
          
          {/* Info Terminal */}
          {activeTab !== 4 && (
            <div className="info-terminal-wrapper">
              <div className="info-terminal">
                <div className="terminal-header"><span className="blink">●</span> LIVE DATA</div>
                <h3>{currentTab.title}</h3>
                <p key={activeTab} className="typewriter">{currentTab.text}</p>
              </div>
            </div>
          )}

          {/* Control Dock */}
          <div className="control-dock">
             <div className="dock-grid">
                {tabs.map((tab, index) => (
                  <button 
                    key={tab.id}
                    className={`dock-btn ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab.label}
                  </button>
                ))}
             </div>
          </div>
        </div>

      </main>

      {/* === CSS STYLES === */}
      <style>{`
        /* --- GLOBAL & LAYOUT --- */
        :root {
            --primary: #0000ff;
            --bg-dark: #050505;
            --glass: rgba(0, 0, 0, 0.4); 
            --border: rgba(255, 255, 255, 0.15);
        }
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg-dark); overflow: hidden; font-family: 'Orbitron', sans-serif; }
        
        /* Flex Container for Vertical Stacking */
        .app-container { 
            display: flex; 
            flex-direction: column; 
            height: 100dvh; 
            width: 100vw;
        }

        /* --- HEADER (Fixed Height, Solid) --- */
        .app-header {
          flex: 0 0 auto; /* Don't shrink */
          padding: 15px 20px; 
          display: flex; justify-content: space-between; align-items: center;
          background: var(--bg-dark); /* Solid background now */
          
          color: white; letter-spacing: 1px; 
          z-index: 30;
        }
        .brand { font-size: 1.1rem; font-weight: 700; }
        .meta { font-size: 0.8rem; opacity: 0.7; color: var(--primary); font-family: monospace; }

        /* --- VIEWPORT (Fills remaining space) --- */
        .viewport-area {
            flex: 1; /* Take all remaining height */
            position: relative; /* Context for absolute children */
            width: 100%;
            overflow: hidden;
        }

        /* Layers inside Viewport */
        .model-layer, .ui-layer { 
            position: absolute; 
            top: 0; left: 0; 
            width: 100%; height: 100%; 
        }
        .model-layer { z-index: 1; }
        .ui-layer { 
            z-index: 10; 
            pointer-events: none; /* Let clicks pass to model */
            display: flex; flex-direction: column; justify-content: space-between;
        }

        /* --- UI ELEMENTS --- */
        .loading-screen, .error-screen { height: 100%; display: flex; justify-content: center; align-items: center; background: var(--bg-dark); color: white; letter-spacing: 2px; }
        .error-screen { color: #ff3333; }

        /* Info Terminal */
        .info-terminal-wrapper {
            position: absolute; top: 20px; left: 20px; pointer-events: none; 
        }
        .info-terminal {
          width: 300px; background: var(--glass);
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.1); border-left: 3px solid var(--primary);
          padding: 15px; color: white; pointer-events: auto; animation: fadePop 0.4s ease-out;
        }
        .info-terminal h3 { margin: 0 0 5px 0; font-size: 1rem; color: #fff; text-transform: uppercase; }
        .info-terminal p { margin: 0; font-size: 0.85rem; line-height: 1.4; opacity: 0.9; min-height: 2.8em; color: #ddd; }
        .terminal-header { font-size: 0.65rem; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; gap: 5px; font-weight: bold;}
        .blink { animation: blink 1s infinite; color: var(--primary); }

        /* Control Dock */
        .control-dock {
          position: absolute; bottom: 0; width: 100%;
          padding: 15px 0 25px 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          pointer-events: auto;
        }
        .dock-grid { display: flex; justify-content: center; gap: 10px; }
        
        .dock-btn {
          background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border);
          color: white; padding: 10px 20px; font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease;
          text-transform: uppercase;
          clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px);
        }
        .dock-btn:hover { background: rgba(0, 0, 255, 0.2); border-color: var(--primary); }
        .dock-btn.active { background: var(--primary); border-color: var(--primary); box-shadow: 0 0 10px rgba(0, 0, 255, 0.5); }

        /* --- ANIMATIONS --- */
        .typewriter { overflow: hidden; border-right: 2px solid var(--primary); white-space: normal; animation: typing 1s steps(40, end), blink-caret .75s step-end infinite; }
        @keyframes fadePop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes typing { from { max-height: 0; } to { max-height: 100px; } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: var(--primary); } }

        /* === MOBILE FIXES (Max 768px) === */
        @media (max-width: 768px) {
          .meta { display: none; }
          
          /* 1. INFO CARD: Position relative to Viewport (Top Left) */
          .info-terminal-wrapper {
            top: 10px; left: 0; width: 100%;
            display: flex; justify-content: flex-start; padding: 0 15px; 
          }
          .info-terminal {
            width: 100%; max-width: 280px; background: rgba(0, 0, 0, 0.6);
            padding: 10px 12px; border-left: 2px solid var(--primary);
          }
          .info-terminal h3 { font-size: 0.9rem; }
          .info-terminal p { font-size: 0.75rem; line-height: 1.3; }

          /* 2. DOCK: Compact Grid */
          .control-dock {
            padding: 10px 5px 5px 5px; 
            padding-bottom: max(5px, env(safe-area-inset-bottom));
            background: rgba(0,0,0,0.85);
          }
          .dock-grid {
            display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; width: 100%;
          }
          .dock-btn {
            padding: 12px 0; 
            font-size: 3.5vw; max-font-size: 0.75rem;
            text-align: center; width: 100%; min-width: 0;
            display: flex; justify-content: center; align-items: center;
            clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
          }
        }
      `}</style>
    </div>
  );
}

export default ViewerPage;