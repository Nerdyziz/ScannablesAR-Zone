// frontend/src/ViewerPage.jsx

import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
import './ViewerPage.css';
import Logo from './assets/logo.svg';

function ViewerPage() {
  const [model, setModel] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState(0);

  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/');
    const shortId = parts[parts.length - 1];

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/models/${shortId}`);
        if (!res.ok) throw new Error('Model not found');
        const data = await res.json();
        setModel(data);
        setViews(data.views || 0);
      } catch (err) {
        setError(err.message || 'Failed to load model');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="viewer-skeleton">Loading model...</div>;
  if (error) return <div className="viewer-skeleton error">{error}</div>;

  return (
    <div className="viewer-page">
      <header className="viewer-header">
        <div className="brand">
          <img 
            src={Logo} 
            alt="Logo" 
            className="brand-logo"
          />
          <span className="accent">AR</span> ZONE
        </div>

        <div className="meta">
          <div className="views">👁 {views} views</div>
        </div>
      </header>

      <main className="viewer-main">
        <div className="viewer-left">
          <div className="viewer-card">
            <ModelViewer modelUrl={model.url} />
          </div>
        </div>

        <aside className="viewer-sidebar">
          <div className="panel">
            <h4>Views</h4>
            <p>{views}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ViewerPage;