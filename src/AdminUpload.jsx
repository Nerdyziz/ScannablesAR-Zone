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
    
    // --- APPEND TEXT DATA ---
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

      // read raw text in case backend returns non-JSON
      const text = await res.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = { raw: text }; }

      console.log('Upload response:', res.status, payload);

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
        // Reset text fields
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
      <div className="admin-card">
        <h2>Admin — Upload 3D Model</h2>

        <label className="field">
          Admin Key
          <input
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            placeholder="Enter admin token"
          />
        </label>

        {lastCreatedLink && (
          <div className="created-link">
            <strong>Shareable Link:</strong>{' '}
            <a href={lastCreatedLink} target="_blank" rel="noreferrer">{lastCreatedLink}</a>
            <button className="btn small" onClick={() => copyToClipboard(lastCreatedLink)} style={{ marginLeft: 8 }}>
              Copy
            </button>
          </div>
        )}

        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={e => {
              setFile(e.target.files[0]);
              setMessage('');
            }}
          />
          
          {/* --- NEW INPUTS FOR 4 CORNERS --- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', marginBottom: '10px' }}>
             <input placeholder="Top Left Text" value={infoTL} onChange={e=>setInfoTL(e.target.value)} className="field-input"/>
             <input placeholder="Top Right Text" value={infoTR} onChange={e=>setInfoTR(e.target.value)} className="field-input"/>
             <input placeholder="Bottom Left Text" value={infoBL} onChange={e=>setInfoBL(e.target.value)} className="field-input"/>
             <input placeholder="Bottom Right Text" value={infoBR} onChange={e=>setInfoBR(e.target.value)} className="field-input"/>
          </div>

          <button className="btn" type="submit">Upload</button>
        </form>

        <p className="message">{message}</p>
      </div>

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
