import React, { useEffect, useState } from 'react';
import './AdminUpload.css'; // Ensure this matches basic styles

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminUpload() {
  const [adminKey, setAdminKey] = useState('');
  const [models, setModels] = useState([]);
  
  // Upload States
  const [modelFile, setModelFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [name, setName] = useState('');
  const [qty, setQty] = useState(100);
  const [sold, setSold] = useState(0);
  const [message, setMessage] = useState('');

  // Editing State
  const [editId, setEditId] = useState(null);
  const [editQty, setEditQty] = useState(0);
  const [editSold, setEditSold] = useState(0);

  useEffect(() => { fetchModels(); }, []);

  async function fetchModels() {
    const res = await fetch(`${API}/api/models`);
    const data = await res.json();
    setModels(Array.isArray(data) ? data : []);
  }

  // --- CREATE NEW ---
  async function handleUpload(e) {
    e.preventDefault();
    if (!modelFile || !adminKey || !name) return setMessage('Missing required fields');

    const fd = new FormData();
    fd.append('modelFile', modelFile);
    if (bgFile) fd.append('bgFile', bgFile);
    fd.append('name', name);
    fd.append('qty', qty);
    fd.append('sold', sold);

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { 'x-api-key': adminKey },
        body: fd
      });
      const data = await res.json();
      if(data.success) {
        setMessage('Uploaded!');
        fetchModels();
        // Reset form
        setName(''); setModelFile(null); setBgFile(null);
      } else {
        setMessage(data.error);
      }
    } catch (e) { setMessage('Error uploading'); }
  }

  // --- UPDATE EXISTING ---
  async function handleUpdate(shortId) {
    if(!adminKey) return alert('Enter Admin Key top left');
    try {
      const res = await fetch(`${API}/api/models/${shortId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': adminKey 
        },
        body: JSON.stringify({ qty: editQty, sold: editSold })
      });
      if(res.ok) {
        setEditId(null);
        fetchModels();
      } else {
        alert('Update failed');
      }
    } catch(e) { console.error(e); }
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto', color: '#fff', background: '#111' }}>
      <h1>Admin Dashboard</h1>
      
      <div style={{ marginBottom: 20 }}>
        <input 
          type="password" 
          placeholder="Admin Key" 
          value={adminKey} 
          onChange={e=>setAdminKey(e.target.value)}
          style={{ padding: 10, borderRadius: 5, border: 'none' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        
        {/* LEFT: UPLOAD FORM */}
        <div style={{ background: '#222', padding: 20, borderRadius: 10 }}>
          <h2>New Drop</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} required style={{padding:8}} />
            
            <label>3D Model (.glb/.gltf)</label>
            <input type="file" accept=".glb,.gltf" onChange={e=>setModelFile(e.target.files[0])} required />
            
            <label>Background Image (Optional)</label>
            <input type="file" accept="image/*" onChange={e=>setBgFile(e.target.files[0])} />

            <div style={{display:'flex', gap:10}}>
              <input type="number" placeholder="Total Qty" value={qty} onChange={e=>setQty(e.target.value)} style={{padding:8, width:'50%'}} />
              <input type="number" placeholder="Sold Count" value={sold} onChange={e=>setSold(e.target.value)} style={{padding:8, width:'50%'}} />
            </div>

            <button type="submit" style={{ padding: 10, background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>UPLOAD DROP</button>
          </form>
          <p>{message}</p>
        </div>

        {/* RIGHT: LIST */}
        <div>
          <h2>Active Drops</h2>
          {models.map(m => (
            <div key={m._id} style={{ border: '1px solid #444', padding: 10, marginBottom: 10, borderRadius: 5 }}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <strong>{m.name}</strong>
                <a href={`/view/${m.shortId}`} target="_blank" style={{color:'lightblue'}}>View</a>
              </div>
              
              {editId === m.shortId ? (
                <div style={{ marginTop: 10, background:'#333', padding:5 }}>
                   Qty: <input type="number" defaultValue={m.qty} onChange={e=>setEditQty(e.target.value)} style={{width:50}} />
                   Sold: <input type="number" defaultValue={m.sold} onChange={e=>setEditSold(e.target.value)} style={{width:50}} />
                   <button onClick={() => handleUpdate(m.shortId)} style={{marginLeft:5}}>Save</button>
                   <button onClick={() => setEditId(null)} style={{marginLeft:5}}>Cancel</button>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 5 }}>
                   Qty: {m.qty} | Sold: {m.sold} | Views: {m.views} | Likes: {m.likes || 0}
                   <br/>
                   <button onClick={() => { setEditId(m.shortId); setEditQty(m.qty); setEditSold(m.sold); }} style={{marginTop:5, fontSize:'0.7rem'}}>Edit Stats</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}