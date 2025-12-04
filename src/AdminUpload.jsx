// frontend/src/AdminUpload.jsx
import React, { useEffect, useState } from 'react';
import './AdminUpload.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [adminKey, setAdminKey] = useState('');
  const [message, setMessage] = useState('');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastCreatedLink, setLastCreatedLink] = useState('');

  // --- 4 CORNERS STATE ---
  const [infoTL, setInfoTL] = useState('');
  const [infoTR, setInfoTR] = useState('');
  const [infoBL, setInfoBL] = useState('');
  const [infoBR, setInfoBR] = useState('');

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchModels() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/models`);
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchModels error', err);
      setMessage('Failed to load models');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage('');
    setLastCreatedLink('');

    if (!file) return setMessage('Choose a file first');
    if (!adminKey) return setMessage('Enter admin key');

    setMessage('Uploading...');
    const fd = new FormData();
    fd.append('modelFile', file);
    
    // Append Text Data
    fd.append('infoTL', infoTL);
    fd.append('infoTR', infoTR);
    fd.append('infoBL', infoBL);
    fd.append('infoBR', infoBR);

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { 'x-api-key': adminKey },
        body: fd
      });

      const text = await res.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = { raw: text }; }

      if (!res.ok) {
        const err = payload.error || payload.message || payload.raw || `HTTP ${res.status}`;
        setMessage(`Upload failed: ${err}`);
        return;
      }

      const viewLink =
        payload.viewLink ||
        (payload.model && payload.model.viewLink) ||
        (payload.model && payload.model.shortId && `${window.location.origin}/view/${payload.model.shortId}`) ||
        (payload.model && payload.model._id && `${window.location.origin}/view/${payload.model._id}`) ||
        null;

      if (payload.model) {
        setModels(prev => [payload.model, ...prev.filter(x => x._id !== payload.model._id)]);
      } else {
        await fetchModels();
      }

      if (viewLink) {
        setLastCreatedLink(viewLink);
        setMessage('Upload successful — link created below.');
        setFile(null);
        setInfoTL(''); setInfoTR(''); setInfoBL(''); setInfoBR('');
        return;
      }

      setMessage('Upload succeeded but server did not return a link. Refreshed list.');
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Network/server error. Check backend logs and CORS.');
    }
  }

  async function handleDelete(shortId) {
    if (!adminKey) return setMessage('Enter admin key to delete');
    if (!confirm('Delete this model?')) return;
    try {
      const res = await fetch(`${API}/api/models/${shortId}`, {
        method: 'DELETE',
        headers: { 'x-api-key': adminKey }
      });
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        setMessage(p.error || 'Delete failed');
        return;
      }
      setMessage('Deleted');
      setModels(prev => prev.filter(m => m.shortId !== shortId));
      if (lastCreatedLink && lastCreatedLink.includes(shortId)) setLastCreatedLink('');
    } catch (e) {
      console.error('Delete error', e);
      setMessage('Delete failed');
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text)
      .then(() => setMessage('Link copied'))
      .catch(() => setMessage('Copy failed'));
  }

  return (
    <div className="admin-wrap">
      {/* --- LEFT SIDE: UPLOAD CARD --- */}
      <div className="admin-card" style={{ minWidth: '350px' }}>
        <h2>Admin — Upload 3D Model</h2>

        <div style={{ marginBottom: '15px' }}>
          <label className="field" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Admin Key
          </label>
          <input
            type="password"
            className="field-input"
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            placeholder="Enter admin token"
          />
        </div>

        {lastCreatedLink && (
          <div className="created-link" style={{ wordBreak: 'break-all', marginBottom: '15px' }}>
            <strong>Link:</strong> <a href={lastCreatedLink} target="_blank" rel="noreferrer">{lastCreatedLink}</a>
            <div style={{ marginTop: '5px' }}>
              <button className="btn small" onClick={() => copyToClipboard(lastCreatedLink)}>Copy</button>
            </div>
          </div>
        )}

        {/* --- FORM WITH CLEAN VERTICAL LAYOUT --- */}
        <form onSubmit={handleUpload} className="upload-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* 1. File Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', opacity: 0.9 }}>1. Select Model</label>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={e => {
                setFile(e.target.files[0]);
                setMessage('');
              }}
              style={{ width: '100%' }}
            />
          </div>
          
          {/* 2. Text Inputs Grid */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', opacity: 0.9 }}>2. Corner Details (Optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
               <input 
                 placeholder="Top Left" 
                 value={infoTL} onChange={e=>setInfoTL(e.target.value)} 
                 className="field-input"
                 style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
               />
               <input 
                 placeholder="Top Right" 
                 value={infoTR} onChange={e=>setInfoTR(e.target.value)} 
                 className="field-input"
                 style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
               />
               <input 
                 placeholder="Bottom Left" 
                 value={infoBL} onChange={e=>setInfoBL(e.target.value)} 
                 className="field-input"
                 style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
               />
               <input 
                 placeholder="Bottom Right" 
                 value={infoBR} onChange={e=>setInfoBR(e.target.value)} 
                 className="field-input"
                 style={{ width: '100%', boxSizing: 'border-box', padding: '8px' }}
               />
            </div>
          </div>

          <button className="btn" type="submit" style={{ width: '100%', padding: '10px' }}>Upload Model</button>
        </form>

        <p className="message" style={{ marginTop: '15px' }}>{message}</p>
      </div>

      {/* --- RIGHT SIDE: MODELS GRID --- */}
      <div className="models-grid">
        <h3>Your models</h3>
        {loading && <p>Loading...</p>}
        {!loading && models.length === 0 && <p>No models yet</p>}

        <div className="cards">
          {models.map(m => {
            const viewUrl = `${window.location.origin}/view/${m.shortId}`;
            return (
              <div className="model-card" key={m._id}>
                <div className="card-top">
                  <div className="name" title={m.name}>{m.name}</div>
                  <div className="meta">👁 {m.views || 0}</div>
                </div>

                <div className="card-body">
                  <a href={viewUrl} target="_blank" rel="noreferrer">
                    <div className="link">{viewUrl}</div>
                  </a>
                </div>

                <div className="card-actions">
                  <button className="btn small" onClick={() => copyToClipboard(viewUrl)}>Copy Link</button>
                  <a className="btn small ghost" href={m.url} target="_blank" rel="noreferrer">Raw</a>
                  <button className="btn small danger" onClick={() => handleDelete(m.shortId)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}