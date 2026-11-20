import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LaporanList from './pages/LaporanList';
import LaporanDetail from './pages/LaporanDetail';
import LaporanCreate from './pages/LaporanCreate';
import Login from './pages/Login';
import ManageInstansi from './pages/ManageInstansi';
import ManageUsers from './pages/ManageUsers';
import AuditLog from './pages/AuditLog';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="laporan" element={<LaporanList />} />
        <Route path="laporan/baru" element={<LaporanCreate />} />
        <Route path="laporan/:id" element={<LaporanDetail />} />
        <Route path="instansi" element={<ManageInstansi />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="audit" element={<AuditLog />} />
      </Route>
    </Routes>
  );
}

export default App;
