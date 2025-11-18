import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';           // optional, list of models
import AdminUpload from './AdminUpload';     // for uploading
import ViewerPage from './ViewerPage';       // for viewing models by shortId

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminUpload />} />
        <Route path="/view/:shortId" element={<ViewerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;