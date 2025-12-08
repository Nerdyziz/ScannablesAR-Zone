import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
import './ViewerPage.css';
import logoImg from './assets/logo.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ViewerPage() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stats
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const shortId = window.location.pathname.split('/').pop();
    fetch(`${API}/api/models/${shortId}`)
      .then(res => res.json())
      .then(data => {
        if(data.error) throw new Error(data.error);
        setModel(data);
        setLikes(data.likes || 0);
        
        const likedLocally = localStorage.getItem(`liked_${shortId}`);
        if (likedLocally === 'true') setIsLiked(true);
        
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleLike = async () => {
    const newStatus = !isLiked;
    const change = newStatus ? 1 : -1;

    setIsLiked(newStatus);
    setLikes(prev => Math.max(0, prev + change));
    localStorage.setItem(`liked_${model.shortId}`, newStatus);

    try {
      await fetch(`${API}/api/models/${model.shortId}/like`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change }) 
      });
    } catch(e) {
      console.error("Like sync failed", e);
    }
  };

  if (loading) return <div className="loading">INITIALIZING...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="viewer-container">
      
      {/* 1. Header Section */}
      <div className="header-section">
        <div className="brand-tag">SCANNABLES AR ZONE</div>
        <h1 className="product-title">{model.name}</h1>
      </div>

      {/* 2. Main Visual Card */}
      <div className="visual-card">
        {/* Background Image Layer */}
        {model.bgUrl && <img src={model.bgUrl} alt="background" className="bg-image" />}

        {/* Top UI Overlay */}
        <div className="card-overlay-top">
          <div className="logo-icon">
             <img src={logoImg} alt="Logo" />
          </div>
          
          <div className="action-group">
             <button 
               className={`icon-btn like-btn ${isLiked ? 'active' : ''}`} 
               onClick={toggleLike}
             >
               {isLiked ? '❤️' : '🤍'} 
               <span className="like-count">{likes}</span>
             </button>
          </div>
        </div>

        {/* 3D Model Layer */}
        <div className="model-layer">
          <ModelViewer 
            modelUrl={model.url}
            cameraOrbit="auto auto 105%"
            enableInteractions={true} 
          />
        </div>
      </div>

      {/* 3. Footer Stats */}
     <div className="stats-footer">
  <div className="stat-item">
    <strong>{model.sold || 0}</strong> sold
  </div>
  <div className="stat-item">
    <strong>{model.qty || 0}</strong> items
  </div>
  <div className="stat-item">
    <strong>{model.views}</strong> views
  </div>
</div>

    </div>
  );
}