// frontend/src/ViewerPage.jsx

import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
import './ViewerPage.css';

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
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/models/${shortId}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Model not found');
          } else {
            throw new Error(`Server error: ${res.status}`);
          }
        }
        
        const data = await res.json();
        setModel(data);
        setViews(data.views || 0);
      } catch (err) {
        console.error('Error loading model:', err);
        setError(err.message || 'Failed to load model. Please check your connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="viewer-page">
        <div className="viewer-skeleton">
          <div className="loading-spinner"></div>
          Loading model...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="viewer-page">
        <div className="viewer-skeleton error">
          <div className="error-icon">⚠️</div>
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-page">
      <header className="viewer-header">
        <div className="brand">
          <div className="brand-logo-placeholder">
            <span className="logo-symbol">⚡</span>
          </div>
          <span className="brand-text">
            <span className="accent">AR</span> ZONE
          </span>
        </div>

        <div className="meta">
          <div className="views">👁 {views} views</div>
        </div>
      </header>

      <main className="viewer-main">
        <div className="viewer-left">
          <div className="viewer-card">
            {model?.url ? (
              <ModelViewer modelUrl={model.url} />
            ) : (
              <div className="model-error">No model URL provided</div>
            )}
          </div>
        </div>

        <aside className="viewer-sidebar">
          <div className="panel">
            <h3>Model Info</h3>
            <div className="info-item">
              <label>Views:</label>
              <span>{views}</span>
            </div>
            {model?.name && (
              <div className="info-item">
                <label>Name:</label>
                <span>{model.name}</span>
              </div>
            )}
          </div>
          
          <div className="panel mobile-instructions">
            <h3>Mobile Instructions</h3>
            <ul>
              <li>• Drag to rotate the model</li>
              <li>• Pinch to zoom in/out</li>
              <li>• Tap "View in AR" to see in your space</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ViewerPage;