// src/HomePage.jsx
import React from 'react';

export default function HomePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Home</h1>
      <p>Welcome — use <a href="/admin">Admin</a> to upload or open a model link at /view/:id</p>
    </div>
  );
}
