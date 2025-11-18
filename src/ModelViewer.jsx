// frontend/src/ModelViewer.jsx

import React, { useEffect, useState, useRef } from 'react';
import '@google/model-viewer';

const ModelViewer = ({ modelUrl }) => {
  const [progress, setProgress] = useState(0);
  const [arSupported, setArSupported] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    // Check AR support
    const checkARSupport = async () => {
      try {
        if ('xr' in navigator) {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setArSupported(supported);
        } else {
          setArSupported(false);
        }
      } catch (error) {
        console.log('AR support check failed:', error);
        setArSupported(false);
      }
    };

    checkARSupport();
  }, []);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    
    if (!modelViewer || !modelUrl) return;

    const handleLoad = () => {
      setLoading(false);
      setError(null);
    };

    const handleError = (event) => {
      console.error('Model loading error:', event);
      setError('Failed to load 3D model');
      setLoading(false);
    };

    const handleProgress = (event) => {
      const { totalProgress } = event.detail;
      setProgress(Math.round(totalProgress * 100));
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);
    modelViewer.addEventListener('progress', handleProgress);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
      modelViewer.removeEventListener('progress', handleProgress);
    };
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className="model-viewer-error">
        No model URL provided
      </div>
    );
  }

  return (
    <div className="model-viewer-container">
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        alt="3D Model"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        auto-rotate-delay="0"
        disable-pan
        rotation-per-second="-30deg"
        camera-orbit="0deg 75deg 105%"
        min-camera-orbit="auto 60deg auto"
        max-camera-orbit="auto 85deg auto"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1.0"
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      >
        {/* Loading Overlay */}
        {loading && progress < 100 && (
          <div className="loading-overlay" slot="progress-bar">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-text">Loading... {progress}%</div>
            </div>
          </div>
        )}

        {/* AR Button */}
        <button 
          className="ar-button" 
          slot="ar-button"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '24px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
            fontFamily: 'inherit'
          }}
        >
          <span>📱</span>
          View in AR
        </button>

        {/* Error Message */}
        {error && (
          <div className="model-error-message">
            {error}
          </div>
        )}

        {/* AR Support Warning */}
        {arSupported === false && (
          <div 
            className="ar-warning"
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '20px',
              background: 'rgba(255, 59, 48, 0.9)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              zIndex: 100,
              maxWidth: '200px'
            }}
          >
            AR not available on this device
          </div>
        )}
      </model-viewer>
    </div>
  );
};

export default ModelViewer;